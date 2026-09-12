"use client";

import { useEffect, useState } from "react";

/** หน่วงค่าที่พิมพ์เร็ว ๆ ไม่ให้ไป trigger งานหนัก (เช่น filter 1,000 คัน) ทุกคีย์ */
export function useDebouncedValue<T>(value: T, delayMs = 180) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    if (value === debounced) return;
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delayMs]);

  return debounced;
}
