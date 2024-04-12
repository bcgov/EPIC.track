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
    });
  }, dependencies);
};

export default useRouterLocationStateForHelpPage;
