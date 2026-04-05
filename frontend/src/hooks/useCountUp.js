import { useEffect, useState } from "react";

export function useCountUp(target, { duration = 900, decimals = 0, enabled = true } = {}) {
  const t0 = Number(target) || 0;
  const [value, setValue] = useState(() => (enabled ? 0 : t0));

  useEffect(() => {
    if (!enabled) {
      setValue(t0);
      return;
    }
    let raf;
    const start = performance.now();
    const from = 0;
    const to = t0;

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      const current = from + (to - from) * eased;
      setValue(current);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [t0, duration, enabled]);

  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
