import { useState, useRef, useEffect } from "react";
import { Sparkles, Plus, ChefHat, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { IngredientChips } from "@/components/pantry/IngredientChips";
import { SuggestionPills } from "@/components/pantry/SuggestionPills";
import { RecipeCard } from "@/components/pantry/RecipeCard";
import { RecipeDetail } from "@/components/pantry/RecipeDetail";
import { RecipeSkeleton } from "@/components/pantry/RecipeSkeleton";
import type { Recipe } from "@/components/pantry/types";
import heroImg from "@/assets/hero-ingredients.jpg";

const STORAGE_KEY = "pantry.ingredients.v1";

const Index = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState<Recipe | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setIngredients(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ingredients)); } catch {}
  }, [ingredients]);

  const addIngredient = (raw: string) => {
    const v = raw.trim().toLowerCase();
    if (!v) return;
    if (v.length > 50) { toast.error("That's a long ingredient name"); return; }
    if (ingredients.some((i) => i.toLowerCase() === v)) {
      toast.info(`${v} is already in your pantry`); return;
    }
    setIngredients((p) => [...p, v]);
    setInput("");
  };

  const removeIngredient = (i: number) =>
    setIngredients((p) => p.filter((_, idx) => idx !== i));

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addIngredient(input.replace(/,$/, ""));
    } else if (e.key === "Backspace" && input === "" && ingredients.length) {
      setIngredients((p) => p.slice(0, -1));
    }
  };

  const generate = async () => {
    if (ingredients.length === 0) {
      toast.error("Add some ingredients first");
      inputRef.current?.focus();
      return;
    }
    setLoading(true);
    setRecipes([]);
    try {
      const { data, error } = await supabase.functions.invoke("generate-recipes", {
        body: { ingredients },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const list: Recipe[] = data?.recipes ?? [];
      if (list.length === 0) throw new Error("No recipes returned");
      setRecipes(list);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not generate recipes";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (active) return <RecipeDetail recipe={active} onBack={() => setActive(null)} />;

  return (
    <div className="min-h-screen bg-gradient-sunset">
      {/* Hero */}
      <header className="safe-top px-5 pb-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-9 w-9 rounded-xl bg-gradient-warm grid place-items-center shadow-warm">
            <ChefHat className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">Pantry</span>
        </div>

        <div className="relative rounded-3xl overflow-hidden mb-6 shadow-elev">
          <img
            src={heroImg}
            alt="Fresh ingredients on a warm cream surface"
            width={1280}
            height={896}
            className="w-full h-44 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h1 className="font-display text-3xl font-black leading-[1.05] text-balance text-foreground">
              What's in your<br />kitchen tonight?
            </h1>
          </div>
        </div>

        <p className="text-muted-foreground text-base">
          Add ingredients you have. We'll cook up <span className="text-foreground font-semibold">3 recipes</span> instantly.
        </p>
      </header>

      {/* Input */}
      <section className="px-5 space-y-4">
        <div className="bg-surface-elevated rounded-2xl p-2 pl-4 flex items-center gap-2 shadow-soft border border-border/60 focus-within:ring-2 focus-within:ring-primary/40 transition-shadow">
          <Plus className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="e.g. chicken, garlic, rice…"
            inputMode="text"
            autoCapitalize="none"
            autoCorrect="off"
            className="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground/70 py-3"
          />
          <button
            onClick={() => addIngredient(input)}
            disabled={!input.trim()}
            className="h-10 px-4 rounded-xl bg-foreground text-background text-sm font-semibold disabled:opacity-30 active:scale-95 transition-transform"
          >
            Add
          </button>
        </div>

        <IngredientChips ingredients={ingredients} onRemove={removeIngredient} />

        {ingredients.length < 3 && (
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">
              Quick add
            </p>
            <SuggestionPills exclude={ingredients} onAdd={addIngredient} />
          </div>
        )}
      </section>

      {/* Generate */}
      <div className="px-5 pt-6 pb-4 sticky bottom-0 z-10">
        <button
          onClick={generate}
          disabled={loading || ingredients.length === 0}
          className="group w-full h-14 rounded-2xl bg-gradient-warm text-primary-foreground font-bold text-base shadow-warm flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:shadow-soft transition-all"
        >
          {loading ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              Cooking up ideas…
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 group-active:rotate-12 transition-transform" />
              {recipes.length ? "Generate again" : "Generate recipes"}
            </>
          )}
        </button>
      </div>

      {/* Results */}
      <section ref={resultsRef} className="px-5 pb-12 space-y-3 safe-bottom">
        {loading && <RecipeSkeleton />}
        {!loading && recipes.length > 0 && (
          <>
            <h2 className="font-display text-2xl font-bold pt-2">Tonight's menu</h2>
            {recipes.map((r, i) => (
              <RecipeCard key={i} recipe={r} index={i} onClick={() => setActive(r)} />
            ))}
          </>
        )}
      </section>
    </div>
  );
};

export default Index;
