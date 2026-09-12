"use client";

import { ChevronDown, Check, Search } from "lucide-react";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/shared/lib/cn";

export type DropdownOption = {
  value: string;
  label: string;
  /** บรรทัดรองใต้ชื่อ เช่น ทะเบียน · คนขับ */
  hint?: string;
  /** จุดสีหน้าตัวเลือก (ใช้กับรายการที่มีสถานะ) */
  color?: string;
};

/** จำนวนแถวสูงสุดที่วาดพร้อมกัน — รายชื่อคนขับมีเป็นร้อย แต่ตาคนอ่านได้ทีละไม่กี่แถว */
const VISIBLE_LIMIT = 40;

/** เปิดช่องค้นหาอัตโนมัติเมื่อรายการยาวเกินกว่าจะกวาดตาหาเอง */
const SEARCH_THRESHOLD = 8;

type Props = {
  options: readonly DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  panelClassName?: string;
  icon?: ReactNode;
  compact?: boolean;
};

/**
 * Dropdown ของระบบ — เขียนเองแทน <select> ของเบราว์เซอร์
 *
 * <select> วาดรายการด้วยธีมของ OS ซึ่งบนวินโดวส์เป็นพื้นขาวเสมอ
 * ทำให้หลุดธีมมืดของแอปทันทีที่กด ตัวนี้จึงคุมหน้าตาเองทั้งหมด
 * และยืมรูปแบบเดียวกับตัวเลือกรถในหน้า history (ไอคอน + สองบรรทัด + ค้นหา)
 */
export function Dropdown({
  options,
  value,
  onChange,
  label,
  placeholder = "เลือก…",
  searchPlaceholder = "ค้นหา…",
  className,
  panelClassName,
  icon,
  compact,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const deferredQuery = useDeferredValue(query);
  const searchable = options.length > SEARCH_THRESHOLD;
  const selected = options.find((option) => option.value === value);

  const matches = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    if (!needle) return options.slice(0, VISIBLE_LIMIT);
    const found: DropdownOption[] = [];
    for (const option of options) {
      if (
        option.label.toLowerCase().includes(needle) ||
        option.hint?.toLowerCase().includes(needle)
      ) {
        found.push(option);
        if (found.length === VISIBLE_LIMIT) break;
      }
    }
    return found;
  }, [deferredQuery, options]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  const choose = useCallback(
    (next: string) => {
      onChange(next);
      close();
    },
    [close, onChange],
  );

  /** เปิดแล้ววางเคอร์เซอร์ไว้ที่ตัวเลือกปัจจุบัน จะได้กดลูกศรต่อได้เลย */
  const toggle = useCallback(() => {
    setOpen((current) => {
      if (current) return false;
      setCursor(Math.max(0, matches.findIndex((option) => option.value === value)));
      return true;
    });
  }, [matches, value]);

  // ปิดเมื่อคลิกนอกกล่องหรือกด Escape — พฤติกรรมเดียวกับหน้า history
  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  // เลื่อนรายการตามลูกศรขึ้น/ลง
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector(`[data-index="${cursor}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [cursor, open]);

  const onTriggerKeyDown = (event: React.KeyboardEvent) => {
    if (!open && (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      toggle();
    }
  };

  const onListKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor((current) => Math.min(matches.length - 1, current + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor((current) => Math.max(0, current - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const option = matches[cursor];
      if (option) choose(option.value);
    }
  };

  return (
    <div ref={rootRef} className={cn("relative min-w-0", className)}>
      <button
        type="button"
        onClick={toggle}
        onKeyDown={onTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        className={cn(
          "flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-[10px] border bg-surface-2 px-2.5 text-left",
          "transition-colors duration-150 hover:border-line-strong",
          compact ? "h-8" : "h-9",
          open ? "border-[var(--accent-line)]" : "border-line",
        )}
      >
        {icon ? (
          <span className="grid size-[22px] shrink-0 place-items-center rounded-md bg-surface-3 text-dim">
            {icon}
          </span>
        ) : null}
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block truncate text-[12px] leading-tight",
              selected ? "text-content" : "text-dim",
            )}
          >
            {selected?.label ?? placeholder}
          </span>
          {selected?.hint ? (
            <span className="block truncate text-[10px] leading-tight text-dim">
              {selected.hint}
            </span>
          ) : null}
        </span>
        <ChevronDown
          aria-hidden
          className={cn(
            "size-4 shrink-0 text-dim transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div
          className={cn(
            "absolute top-[calc(100%+6px)] left-0 z-50 flex w-full min-w-[220px] flex-col overflow-hidden",
            "rounded-xl border border-line bg-[#0e141c] shadow-[0_18px_44px_rgba(0,0,0,0.55)]",
            panelClassName,
          )}
          onKeyDown={onListKeyDown}
        >
          {searchable ? (
            <div className="flex items-center gap-2 border-b border-line px-2.5 py-2">
              <Search aria-hidden className="size-3.5 shrink-0 text-dim" />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setCursor(0);
                }}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="w-full bg-transparent text-[12px] text-content outline-none placeholder:text-dim"
              />
            </div>
          ) : null}

          <div
            ref={listRef}
            role="listbox"
            id={listId}
            aria-label={label}
            className="max-h-[268px] overflow-y-auto overscroll-contain py-1"
          >
            {matches.length === 0 ? (
              <p className="px-3 py-4 text-center text-[12px] text-dim">ไม่พบรายการที่ค้นหา</p>
            ) : (
              matches.map((option, index) => {
                const active = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={active}
                    data-index={index}
                    onClick={() => choose(option.value)}
                    onMouseEnter={() => setCursor(index)}
                    className={cn(
                      "flex w-full items-center gap-2 px-2.5 py-1.5 text-left transition-colors duration-100",
                      active && "bg-[var(--accent-soft)] shadow-[inset_2px_0_0_var(--accent)]",
                      !active && index === cursor && "bg-surface-2",
                    )}
                  >
                    {option.color ? (
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ background: option.color }}
                      />
                    ) : null}
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block truncate text-[12px] leading-tight",
                          active ? "text-[var(--accent)]" : "text-content",
                        )}
                      >
                        {option.label}
                      </span>
                      {option.hint ? (
                        <span className="block truncate text-[10px] leading-tight text-dim">
                          {option.hint}
                        </span>
                      ) : null}
                    </span>
                    {active ? (
                      <Check aria-hidden className="size-3.5 shrink-0 text-[var(--accent)]" />
                    ) : null}
                  </button>
                );
              })
            )}
          </div>

          {searchable ? (
            <p className="border-t border-line px-2.5 py-1.5 text-[10px] text-dim tabular-nums">
              แสดง {matches.length} / {options.length}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
