import { useState, useEffect } from "react";

type Filter = {
  id: string;
  value: unknown;
};
export function useCachedFilters(
  storageKey: string
): [
  Filter[] | undefined,
  React.Dispatch<React.SetStateAction<Filter[] | undefined>>
] {
  const [filters, setFilters] = useState<Filter[] | undefined>(() => {
    try {
      const data = sessionStorage.getItem(storageKey);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error("Error retrieving cached filters:", error);
    }
    return undefined;
  });

  useEffect(() => {
    if (filters) {
      sessionStorage.setItem(storageKey, JSON.stringify(filters));
    } else {
      sessionStorage.removeItem(storageKey);
    }
  }, [filters]);

  return [filters, setFilters];
}
