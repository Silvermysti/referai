import { useEffect, useRef, useState } from "react";

const AutocompleteInput = ({
  value = "",
  onChange,
  suggestions = [],
  placeholder = "",
  className = "field",
}) => {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => { setQuery(value || ""); }, [value]);

  const filtered = query.trim().length > 0
    ? suggestions.filter((s) => s.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : [];

  const commit = (val) => {
    onChange(val);
    setQuery(val);
    setOpen(false);
    setHighlighted(-1);
  };

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlighted >= 0 && listRef.current) {
      const item = listRef.current.children[highlighted];
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlighted]);

  return (
    <div ref={containerRef} className="relative">
      <input
        className={className}
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setOpen(true);
          setHighlighted(-1);
        }}
        onFocus={() => { if (filtered.length > 0) setOpen(true); }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlighted((h) => Math.max(h - 1, -1));
          } else if (e.key === "Enter" && highlighted >= 0) {
            e.preventDefault();
            commit(filtered[highlighted]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {open && filtered.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-app bg-[var(--surface)] shadow-lg"
        >
          {filtered.map((s, i) => (
            <li
              key={s}
              onMouseDown={() => commit(s)}
              className={`cursor-pointer px-4 py-2.5 text-sm transition-colors ${
                i === highlighted
                  ? "bg-[var(--surface-soft)] font-bold text-main"
                  : "text-muted hover:bg-[var(--surface-soft)] hover:text-main"
              }`}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteInput;
