-- Phases whose recorded end date differs from their end milestone's actual date, one row per phase,
-- sorted by work Lead. Only actual dates: a planned end stays on the phase, where the app keeps
-- extension and deadline changes. Dates compare as Pacific days.
--
-- Preview, for the Leads to review (changes nothing; the transaction rolls back):
--   psql -X --csv -d <database> -f scripts/fix_phase_ends.sql > phase_ends_to_fix.csv
-- Set the listed phases' end dates, optionally only for the works the Leads signed off:
--   psql -X --csv -v apply=1 [-v work_ids=12,34] -d <database> -f scripts/fix_phase_ends.sql > phase_ends_fixed.csv
--
-- Keep the apply run's output: it skips work_phases_history, so it's the only record of the old dates.
-- DEMI isn't sent anything; it gets the new date on the phase's next save in the app.

\set QUIET on
\set ON_ERROR_STOP on
\if :{?apply}
\else
    \set apply false
\endif
\if :{?work_ids}
\else
    \set work_ids ''
\endif

BEGIN;

CREATE TEMP TABLE phase_end_fixes ON COMMIT DROP AS
WITH end_milestones AS (
    SELECT
        ec.work_phase_id,
        e.name,
        e.actual_date,
        count(*) OVER (PARTITION BY ec.work_phase_id) AS ends_in_phase
    FROM events e
    JOIN event_configurations ec ON ec.id = e.event_configuration_id
    WHERE ec.event_position = 'END'
      AND ec.is_active
      AND NOT ec.is_deleted
      AND e.is_active
      AND NOT e.is_deleted
)
SELECT
    coalesce(nullif(concat_ws(' ', wl.first_name, wl.last_name), ''), '(no Lead)') AS work_lead,
    concat(p.name, ' - ', wt.name, coalesce(' - ' || nullif(w.simple_title, ''), '')) AS work,
    w.work_state,
    wp.name AS phase,
    (wp.end_date AT TIME ZONE 'America/Vancouver')::date AS phase_end,
    em.name AS end_milestone,
    (em.actual_date AT TIME ZONE 'America/Vancouver')::date AS milestone_actual,
    em.actual_date AS new_end_date,
    w.id AS work_id,
    wp.id AS work_phase_id,
    wp.sort_order
FROM work_phases wp
-- A phase with more than one end milestone is left for a person to sort out.
JOIN end_milestones em ON em.work_phase_id = wp.id AND em.ends_in_phase = 1
JOIN works w ON w.id = wp.work_id
JOIN projects p ON p.id = w.project_id
JOIN work_types wt ON wt.id = w.work_type_id
LEFT JOIN staffs wl ON wl.id = w.work_lead_id
WHERE em.actual_date IS NOT NULL
  AND wp.is_active
  AND NOT wp.is_deleted
  AND NOT w.is_deleted
  AND (wp.end_date IS NULL
       OR (wp.end_date AT TIME ZONE 'America/Vancouver')::date
          <> (em.actual_date AT TIME ZONE 'America/Vancouver')::date)
  AND (:'work_ids' = '' OR w.id = ANY (string_to_array(:'work_ids', ',')::int[]));

\if :apply
UPDATE work_phases wp
SET end_date = f.new_end_date
FROM phase_end_fixes f
WHERE wp.id = f.work_phase_id;
\endif

SELECT
    work_lead,
    work,
    work_state,
    phase,
    phase_end,
    end_milestone,
    milestone_actual,
    milestone_actual - phase_end AS days_moved,
    work_id,
    work_phase_id
FROM phase_end_fixes
ORDER BY work_lead, work, sort_order;

\if :apply
COMMIT;
\else
ROLLBACK;
\endif
