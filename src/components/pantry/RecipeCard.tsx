import { Clock, Flame, Users } from "lucide-react";
import type { Recipe } from "./types";

interface Props {
  recipe: Recipe;
  index: number;
  onClick: () => void;
}

export const RecipeCard = ({ recipe, index, onClick }: Props) => {
  return (
    <button
      onClick={onClick}
      style={{ animationDelay: `${index * 80}ms` }}
      className="group w-full text-left bg-gradient-card rounded-3xl p-5 shadow-soft border border-border/60 active:scale-[0.98] transition-transform animate-float-up"
    >
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 shrink-0 rounded-2xl bg-gradient-warm grid place-items-center text-3xl shadow-warm">
          {recipe.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-xl font-bold leading-tight text-balance">
            {recipe.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {recipe.description}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4 text-xs font-medium text-muted-foreground">
        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{recipe.time_minutes}m</span>
        <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5" />{recipe.difficulty}</span>
        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{recipe.servings}</span>
      </div>
    </button>
  );
};
