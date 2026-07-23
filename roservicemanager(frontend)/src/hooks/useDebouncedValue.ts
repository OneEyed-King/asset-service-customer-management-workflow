import { useEffect, useState } from "react";

/**
 * REACT CONCEPT: a custom hook.
 * Any function whose name starts with "use" and that itself calls other
 * hooks (useState/useEffect here) is a "custom hook" - a way to package up
 * reusable stateful logic. This one delays updating the returned value
 * until `delayMs` has passed without `value` changing again, so a search
 * box can fire an API call only after the user pauses typing instead of on
 * every keystroke.
 */
export function useDebouncedValue<T>(value: T, delayMs = 350): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeoutId);
  }, [value, delayMs]);

  return debounced;
}
