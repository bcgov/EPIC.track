# Copyright © 2019 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the 'License');
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an 'AS IS' BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Service to manage Milestone."""
from flask import current_app, jsonify
from reports_api.models import Milestone, PhaseCode, db
from reports_api.schemas.milestone import MilestoneSchema


class MilestoneService:  # pylint:disable=too-few-public-methods
    """Service to manage milestones related operations"""

    @classmethod
    def find_non_decision_by_phase_id(cls, phase_id: int):
        """Find milestones by phase_id which are neither start event not end event"""
        current_app.logger.debug(
            f"find non decision making milestones by phase id {phase_id}"
        )
        milestones = Milestone.find_non_decision_by_phase_id(phase_id)
        return jsonify([item.as_dict() for item in milestones])

    @classmethod
    def find_milestone_by_id(cls, milestone_id: int):
        """Find milestone by id"""
        current_app.logger.debug(f"find milestone by id {milestone_id}")
        milestone = Milestone.find_by_id(milestone_id)
        return jsonify(milestone.as_dict())

    @classmethod
    def find_all_active_milestones(cls):
        """Find all active milestones"""
        current_app.logger.debug("Find all active milestones")
        milestones = Milestone.find_all()
        return jsonify([item.as_dict() for item in milestones])

    @classmethod
    def find_milestones_per_work_type(cls, work_type_id: int):
        """Find all active milestones"""
        current_app.logger.debug("Find all active milestones")
        milestones = db.session.query(Milestone).filter(
            Milestone.phase_id.in_(
                db.session.query(PhaseCode.id).filter(
                    PhaseCode.work_type_id == work_type_id
                )
            )
        )
        return jsonify([item.as_dict() for item in milestones])

    @classmethod
    def find_auto_milestones_per_phase(cls, phase_id):
        """Find start and end EVENTS for given phase id"""
        milestones = Milestone.find_auto_by_phase_id(phase_id)
        milestones_schema = MilestoneSchema(many=True)
        return milestones_schema.dump(milestones)
