-- Running works whose phase and milestone dates don't fit the proposed work plan rules,
-- one row per issue, sorted by work Lead. Read-only: the transaction rolls back.
--
--   psql -X --csv -d <database> -f scripts/in_flight_data_check.sql > in_flight_data_check.csv
--
-- Dates compare as Pacific days. Calendar events are left out; they follow their parent milestone.

\set QUIET on
BEGIN READ ONLY;

WITH running_works AS (
    SELECT
        w.id,
        concat(p.name, ' - ', wt.name, coalesce(' - ' || nullif(w.simple_title, ''), '')) AS work,
        nullif(concat_ws(' ', wl.first_name, wl.last_name), '') AS work_lead,
        nullif(concat_ws(' ', epd.first_name, epd.last_name), '') AS responsible_epd
    FROM works w
    JOIN projects p ON p.id = w.project_id
    JOIN work_types wt ON wt.id = w.work_type_id
    LEFT JOIN staffs wl ON wl.id = w.work_lead_id
    LEFT JOIN staffs epd ON epd.id = w.responsible_epd_id
    WHERE w.work_state IN ('IN_PROGRESS', 'SUSPENDED')
      AND NOT w.is_deleted
),
phases AS (
    SELECT
        wp.id,
        wp.work_id,
        wp.name,
        row_number() OVER (PARTITION BY wp.work_id ORDER BY wp.sort_order, wp.id) AS phase_order,
        (wp.start_date AT TIME ZONE 'America/Vancouver')::date AS start_day,
        (wp.end_date AT TIME ZONE 'America/Vancouver')::date AS end_day,
        lag(wp.name) OVER (PARTITION BY wp.work_id ORDER BY wp.sort_order, wp.id) AS previous_name,
        (lag(wp.end_date) OVER (PARTITION BY wp.work_id ORDER BY wp.sort_order, wp.id)
            AT TIME ZONE 'America/Vancouver')::date AS previous_end_day
    FROM work_phases wp
    WHERE wp.work_id IN (SELECT id FROM running_works)
      AND wp.is_active
      AND NOT wp.is_deleted
      AND wp.visibility = 'REGULAR'
),
milestones AS (
    SELECT
        e.id,
        e.work_id,
        ec.work_phase_id,
        e.name,
        ec.event_position,
        (coalesce(e.actual_date, e.anticipated_date) AT TIME ZONE 'America/Vancouver')::date AS day,
        CASE WHEN e.actual_date IS NULL THEN 'planned' ELSE 'actual' END AS date_type
    FROM events e
    JOIN event_configurations ec ON ec.id = e.event_configuration_id
    WHERE e.work_id IN (SELECT id FROM running_works)
      AND e.is_active
      AND NOT e.is_deleted
      AND ec.event_category_id <> 6  -- Calendar
),
issues AS (
    SELECT
        ph.work_id, ph.id AS phase_id, 'Phases overlap' AS issue, NULL AS milestone, NULL::date AS milestone_date,
        NULL AS date_type,
        format('Starts %s, on or before the end of %s (%s). Proposed: a phase starts the day after the previous one ends.',
               ph.start_day, ph.previous_name, ph.previous_end_day) AS detail
    FROM phases ph
    WHERE ph.start_day <= ph.previous_end_day

    UNION ALL

    SELECT
        ph.work_id, ph.id, 'Gap between phases', NULL, NULL, NULL,
        format('Starts %s, %s days after %s ended (%s). Proposed: no gap between phases.',
               ph.start_day, ph.start_day - ph.previous_end_day - 1, ph.previous_name, ph.previous_end_day)
    FROM phases ph
    WHERE ph.start_day > ph.previous_end_day + 1

    UNION ALL

    SELECT
        m.work_id, ph.id, 'Milestone outside its phase', m.name, m.day, m.date_type,
        format('The phase runs %s to %s. Proposed: a milestone falls inside its phase.', ph.start_day, ph.end_day)
    FROM milestones m
    JOIN phases ph ON ph.id = m.work_phase_id
    WHERE m.day < ph.start_day OR m.day > ph.end_day

    UNION ALL

    SELECT
        m.work_id, ph.id, 'End milestone differs from phase end', m.name, m.day, m.date_type,
        format('The phase end is recorded as %s. Proposed: the end milestone''s date is the phase end, so check it.',
               ph.end_day)
    FROM milestones m
    JOIN phases ph ON ph.id = m.work_phase_id
    WHERE m.event_position = 'END' AND m.day <> ph.end_day

    UNION ALL

    SELECT
        ph.work_id, ph.id, 'Phase has more than one start milestone', NULL, NULL, NULL,
        format('%s start milestones. Proposed: one per phase.', count(*))
    FROM milestones m
    JOIN phases ph ON ph.id = m.work_phase_id
    WHERE m.event_position = 'START'
    GROUP BY ph.work_id, ph.id
    HAVING count(*) > 1

    UNION ALL

    SELECT
        wp.work_id, wp.id, 'Milestones from retired template steps', NULL, NULL, NULL,
        format('%s milestone(s) in this phase come from template steps no longer in the template.', count(*))
    FROM event_configurations ec
    JOIN event_templates et ON et.id = ec.template_id
    JOIN work_phases wp ON wp.id = ec.work_phase_id
    WHERE NOT et.is_active
      AND NOT ec.is_deleted
      AND NOT wp.is_deleted
      AND wp.work_id IN (SELECT id FROM running_works)
    GROUP BY wp.work_id, wp.id
)
SELECT
    coalesce(rw.work_lead, '(no Lead)') AS work_lead,
    rw.responsible_epd,
    rw.work,
    rw.id AS work_id,
    wp.name AS phase,
    i.issue,
    i.milestone,
    i.milestone_date,
    i.date_type,
    i.detail
FROM issues i
JOIN running_works rw ON rw.id = i.work_id
JOIN work_phases wp ON wp.id = i.phase_id
ORDER BY work_lead, rw.work, wp.sort_order, wp.id, i.issue, i.milestone_date NULLS FIRST, i.milestone;

ROLLBACK;
