import { useState } from "react";

const TagInput = ({ label, tags = [], onChange, placeholder = "Type and press Enter" }) => {
  const [input, setInput] = useState("");

  const add = () => {
    const value = input.trim();
    if (!value) return;
    if (!tags.map((t) => t.toLowerCase()).includes(value.toLowerCase())) {
      onChange([...tags, value]);
    }
    setInput("");
  };

  const remove = (index) => onChange(tags.filter((_, i) => i !== index));

  return (
    <div>
      {label && <span className="mb-2 block text-sm font-bold text-main">{label}</span>}
      <div className="flex flex-wrap gap-2 rounded-lg border border-app bg-[var(--surface)] p-2">
        {tags.map((tag, i) => (
          <span key={i} className="flex items-center gap-1 rounded-md bg-[var(--surface-soft)] px-2 py-1 text-sm font-bold text-main">
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
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); add(); }
            if (e.key === "Backspace" && !input && tags.length) remove(tags.length - 1);
          }}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="min-w-32 flex-1 bg-transparent text-sm text-main outline-none placeholder:text-muted"
        />
      </div>
    </div>
  );
};

export default TagInput;
