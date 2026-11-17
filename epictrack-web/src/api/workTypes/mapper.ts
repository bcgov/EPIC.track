import { WorkType } from "models/workType";
import { TrackWorkTypeDto } from "./dto";

export const toWorkType = (dto: TrackWorkTypeDto): WorkType => ({
  id: dto.id,
  name: dto.name,
  is_active: dto.is_active,
  sort_order: dto.sort_order,
});
