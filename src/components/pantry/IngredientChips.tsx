import { X } from "lucide-react";

interface Props {
  ingredients: string[];
  onRemove: (i: number) => void;
}

export const IngredientChips = ({ ingredients, onRemove }: Props) => {
  if (ingredients.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {ingredients.map((ing, i) => (
        <button
          key={`${ing}-${i}`}
          onClick={() => onRemove(i)}
          className="group flex items-center gap-1.5 rounded-full bg-surface-elevated border border-border px-3.5 py-1.5 text-sm font-medium text-foreground shadow-soft animate-pop-in active:scale-95 transition-transform"
        >
          <span>{ing}</span>
          <X className="h-3.5 w-3.5 text-muted-foreground group-hover:text-destructive transition-colors" />
        </button>
      ))}
    </div>
  );
};
