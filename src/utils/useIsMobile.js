import { useEffect, useState } from "react";

// Mirrors Tailwind's `md` breakpoint (768px). Returns true when viewport is
// below that — i.e. the "mobile" range. Listens for resize, so layout updates
// fluidly when the window is dragged across the threshold.
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 767px)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isMobile;
}
