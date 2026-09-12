"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

type Options = {
  count: number;
  rowHeight: number;
  overscan?: number;
};

/**
 * แสดงเฉพาะแถวที่อยู่ในสายตา
 *
 * รายการรถอาจมีเป็นพันคัน แต่ DOM จะมีแค่ประมาณ 20 แถวเสมอ —
 * เขียนเองเพราะกติกาเราง่ายมาก (ความสูงแถวเท่ากันหมด) ไม่คุ้มที่จะลงไลบรารี
 */
export function useVirtualRows(
  containerRef: RefObject<HTMLElement | null>,
  { count, rowHeight, overscan = 6 }: Options,
) {
  const [scrollTop, setScrollTop] = useState(0);
  const [viewport, setViewport] = useState(640);
  const frame = useRef(0);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const onScroll = () => {
      if (frame.current) return;
      frame.current = window.requestAnimationFrame(() => {
        frame.current = 0;
        setScrollTop(node.scrollTop);
      });
    };

    const observer = new ResizeObserver(([entry]) => {
      setViewport(entry.contentRect.height);
    });

    observer.observe(node);
    node.addEventListener("scroll", onScroll, { passive: true });
    setViewport(node.clientHeight);

    return () => {
      observer.disconnect();
      node.removeEventListener("scroll", onScroll);
      if (frame.current) window.cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, [containerRef]);

  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const visible = Math.ceil(viewport / rowHeight) + overscan * 2;
  const end = Math.min(count, start + visible);

  return {
    start,
    end,
    /** ความสูงรวมของรายการทั้งหมด ใช้ทำให้แถบเลื่อนยาวถูกต้อง */
    totalHeight: count * rowHeight,
    /** ระยะที่ต้องดันแถวแรกลงมา */
    offsetY: start * rowHeight,
  };
}
