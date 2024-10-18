import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";
import { RefObject, useEffect, useMemo, useState } from "react";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useOnScreen = (ref: RefObject<HTMLElement>) => {
  const [isOnScreen, setIsOnScreen] = useState<boolean>(false);
  const observer = useMemo(
    () =>
      new IntersectionObserver(([entry]) => {
        setIsOnScreen(entry.isIntersecting);
      }),
    [ref]
  );
  useEffect(() => {
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);
  return isOnScreen;
};
