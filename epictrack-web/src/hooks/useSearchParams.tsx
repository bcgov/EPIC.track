import React from "react";
import { useLocation } from "react-router-dom";

export function useSearchParams<T>() {
  const { search } = useLocation();

  return React.useMemo<T>(() => new URLSearchParams(search) as T, [search]);
}
