import { useEffect, useState } from "react";
import { useIsClient } from "shared/hooks/useIsClient";

/**
 * Custom hook for responsive design using CSS media queries
 * Avoids Next.js hydration errors by handling SSR properly
 * @param query - CSS media query string (e.g., '(max-width: 768px)')
 * @returns boolean indicating if the media query matches
 */
export const useMediaQuery = (query: string): boolean => {
  const isClient = useIsClient();

  // Always start with false to match server-side rendering
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    if (!isClient) return;

    const mediaQueryList = window.matchMedia(query);

    // Handler function for media query changes
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Set initial value after hydration
    setMatches(mediaQueryList.matches);

    // Add event listener
    mediaQueryList.addEventListener("change", handleChange);

    // Cleanup function
    return () => {
      mediaQueryList.removeEventListener("change", handleChange);
    };
  }, [query, isClient]);

  return matches;
};
