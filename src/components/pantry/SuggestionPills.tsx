import { Plus } from "lucide-react";

const SUGGESTIONS = [
  "🍅 tomato", "🧄 garlic", "🧅 onion", "🥚 eggs", "🧀 cheese",
  "🍗 chicken", "🍚 rice", "🍝 pasta", "🥬 spinach", "🥕 carrot",
  "🥔 potato", "🌶 chili", "🍋 lemon", "🌿 basil", "🥦 broccoli",
];

interface Props {
  exclude: string[];
  onAdd: (label: string) => void;
}

export const SuggestionPills = ({ exclude, onAdd }: Props) => {
  const lowerExclude = new Set(exclude.map((s) => s.toLowerCase()));
  const pool = SUGGESTIONS.filter((s) => {
    const name = s.split(" ").slice(1).join(" ").toLowerCase();
    return !lowerExclude.has(name) && !lowerExclude.has(s.toLowerCase());
  });
  return (
    <div className="flex flex-wrap gap-2">
      {pool.slice(0, 8).map((s) => (
        <button
          key={s}
          onClick={() => onAdd(s.split(" ").slice(1).join(" "))}
          className="flex items-center gap-1 rounded-full bg-secondary text-secondary-foreground px-3 py-1.5 text-sm font-medium active:scale-95 transition-transform"
        >
          <Plus className="h-3 w-3 opacity-60" />
          {s}
        </button>
      ))}
    </div>
  );
};
