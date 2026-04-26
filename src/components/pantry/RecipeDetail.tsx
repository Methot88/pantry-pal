import { ArrowLeft, Clock, Flame, Users, Lightbulb } from "lucide-react";
import type { Recipe } from "./types";

interface Props {
  recipe: Recipe;
  onBack: () => void;
}

export const RecipeDetail = ({ recipe, onBack }: Props) => {
  return (
    <div className="min-h-screen bg-background animate-float-up">
      <div className="bg-gradient-warm safe-top px-5 pb-12 rounded-b-[2.5rem] shadow-warm">
        <button
          onClick={onBack}
          className="text-primary-foreground/90 active:scale-95 transition-transform inline-flex items-center gap-1.5 text-sm font-medium mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="text-6xl mb-3">{recipe.emoji}</div>
        <h1 className="font-display text-3xl font-black text-primary-foreground text-balance leading-tight">
          {recipe.title}
        </h1>
        <p className="text-primary-foreground/85 mt-2 text-base">{recipe.description}</p>
        <div className="mt-5 flex gap-2">
          <Stat icon={<Clock className="h-3.5 w-3.5" />} label={`${recipe.time_minutes} min`} />
          <Stat icon={<Flame className="h-3.5 w-3.5" />} label={recipe.difficulty} />
          <Stat icon={<Users className="h-3.5 w-3.5" />} label={`${recipe.servings} serv`} />
        </div>
      </div>

      <div className="px-5 py-6 space-y-6 safe-bottom">
        <section>
          <h2 className="font-display text-xl font-bold mb-3">You'll need</h2>
          <div className="space-y-2">
            <IngredientGroup title="From your pantry" items={recipe.used_ingredients} tone="accent" />
            {recipe.extra_ingredients?.length > 0 && (
              <IngredientGroup title="Plus" items={recipe.extra_ingredients} tone="muted" />
            )}
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold mb-3">Steps</h2>
          <ol className="space-y-3">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex gap-3 bg-surface-elevated rounded-2xl p-4 shadow-soft border border-border/60">
                <span className="shrink-0 h-7 w-7 rounded-full bg-gradient-warm text-primary-foreground grid place-items-center text-sm font-bold shadow-warm">
                  {i + 1}
                </span>
                <p className="text-foreground/90 leading-relaxed pt-0.5">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        {recipe.tip && (
          <section className="bg-gradient-basil text-accent-foreground rounded-2xl p-4 flex gap-3 shadow-elev">
            <Lightbulb className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm uppercase tracking-wide opacity-80">Chef tip</p>
              <p className="text-sm mt-1 leading-relaxed">{recipe.tip}</p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

const Stat = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="bg-primary-foreground/15 backdrop-blur-sm text-primary-foreground rounded-full px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5">
    {icon}{label}
  </div>
);

const IngredientGroup = ({
  title, items, tone,
}: { title: string; items: string[]; tone: "accent" | "muted" }) => (
  <div className="bg-surface-elevated border border-border/60 rounded-2xl p-4 shadow-soft">
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{title}</p>
    <div className="flex flex-wrap gap-1.5">
      {items.map((it, i) => (
        <span
          key={i}
          className={
            tone === "accent"
              ? "bg-accent/10 text-accent rounded-full px-2.5 py-1 text-sm font-medium"
              : "bg-muted text-muted-foreground rounded-full px-2.5 py-1 text-sm font-medium"
          }
        >
          {it}
        </span>
      ))}
    </div>
  </div>
);
