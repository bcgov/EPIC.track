import { useState, useEffect } from "react";

export function useCachedState<StateType>(
  storageKey: string,
  defaultValue: StateType
): [StateType, React.Dispatch<React.SetStateAction<StateType>>] {
  const [state, setState] = useState<StateType>(() => {
    try {
      const data = sessionStorage.getItem(storageKey);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error("Error retrieving cached filters:", error);
    }
    return defaultValue;
  });

  useEffect(() => {
    if (state) {
      sessionStorage.setItem(storageKey, JSON.stringify(state));
    } else {
      sessionStorage.removeItem(storageKey);
    }
  }, [state]);

  return [state, setState];
}
