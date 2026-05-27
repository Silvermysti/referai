import { useEffect, useRef, useState } from "react";

const TagInput = ({
  label,
  tags = [],
  onChange,
  placeholder = "Type and press Enter",
  suggestions = [],
}) => {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  const existingLower = new Set(tags.map((t) => t.toLowerCase()));
  const filtered = input.trim().length > 0
    ? suggestions
        .filter((s) => s.toLowerCase().includes(input.toLowerCase()) && !existingLower.has(s.toLowerCase()))
        .slice(0, 8)
    : [];

  const add = (value) => {
    const val = (value ?? input).trim();
    if (!val || existingLower.has(val.toLowerCase())) return;
    onChange([...tags, val]);
    setInput("");
    setOpen(false);
    setHighlighted(-1);
  };

  const remove = (index) => onChange(tags.filter((_, i) => i !== index));

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (highlighted >= 0 && listRef.current) {
      listRef.current.children[highlighted]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlighted]);

  return (
    <div ref={containerRef} className="relative">
      {label && <span className="mb-2 block text-sm font-bold text-main">{label}</span>}
      <div className="flex flex-wrap gap-2 rounded-lg border border-app bg-[var(--surface)] p-2">
        {tags.map((tag, i) => (
          <span
            key={i}
            className="flex items-center gap-1 rounded-md bg-[var(--surface-soft)] px-2 py-1 text-sm font-bold text-main"
          >
            {tag}
            <button
              type="button"
              onClick={() => remove(i)}
              className="ml-1 text-muted hover:text-rose-500"
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          autoComplete="off"
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
            setHighlighted(-1);
          }}
          onFocus={() => { if (filtered.length > 0) setOpen(true); }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              highlighted >= 0 ? add(filtered[highlighted]) : add();
            } else if (e.key === "Backspace" && !input && tags.length) {
              remove(tags.length - 1);
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlighted((h) => Math.max(h - 1, -1));
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="min-w-32 flex-1 bg-transparent text-sm text-main outline-none placeholder:text-muted"
        />
      </div>
      {open && filtered.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-app bg-[var(--surface)] shadow-lg"
        >
          {filtered.map((s, i) => (
            <li
              key={s}
              onMouseDown={() => add(s)}
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

export default TagInput;
