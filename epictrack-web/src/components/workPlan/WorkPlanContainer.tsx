import React from "react";
import { ETHeading2, EpicTrackPageGridContainer } from "../shared";
import workService from "../../services/workService/workService";
import { Work } from "../../models/work";
import { useSearchParams } from "../../hooks/SearchParams";
import { Palette } from "../../styles/theme";

interface WorkPlanContainerRouteParams extends URLSearchParams {
  work_id: string;
}
const WorkPlanContainer = () => {
  const [work, setWork] = React.useState<Work>();
  const [loading, setLoading] = React.useState<boolean>(true);
  // const { search } = useLocation();
  // const searchParams = React.useMemo(
  //   () => new URLSearchParams(search) as WorkPlanContainerRouteParams,
  //   [search]
  // );
  const query = useSearchParams<WorkPlanContainerRouteParams>();

  const work_id = React.useMemo(() => query.get("work_id"), [query]);
  React.useEffect(() => {
    getWorkById();
  }, [work_id]);

  const getWorkById = React.useCallback(async () => {
    if (work_id) {
      const work = await workService.getById(String(work_id));
      setWork(work.data as Work);
      setLoading(false);
    }
  }, [work_id]);
  return (
    <>
      {!loading && (
        <EpicTrackPageGridContainer>
          <ETHeading2 color={Palette.primary.accent.main}>
            {work?.title}
          </ETHeading2>
        </EpicTrackPageGridContainer>
      )}
    </>
  );
};

export default WorkPlanContainer;
