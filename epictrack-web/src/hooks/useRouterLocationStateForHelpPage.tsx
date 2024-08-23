import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const useRouterLocationStateForHelpPage = (
  callback: () => string[] | string | undefined,
  dependencies: any[]
) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const callBackValue = callback();

    let newtags: string[] = [];
    if (Array.isArray(callBackValue)) {
      newtags = callBackValue;
    } else if (callBackValue) {
      newtags = [callBackValue];
    }

    navigate(`${location.pathname}${location.search}`, {
      state: { helpPageTags: newtags },
      replace: true, // modify current entry in history stack rather than adding duplicate
    });
  }, dependencies);
};

export default useRouterLocationStateForHelpPage;
