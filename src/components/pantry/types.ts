export interface Recipe {
  title: string;
  emoji: string;
  description: string;
  time_minutes: number;
  difficulty: "Easy" | "Medium" | "Hard";
  servings: number;
  used_ingredients: string[];
  extra_ingredients: string[];
  steps: string[];
  tip: string;
}
