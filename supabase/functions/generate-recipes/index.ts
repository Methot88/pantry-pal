// Pantry: generate recipes from ingredients via Lovable AI
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const ingredients: string[] = Array.isArray(body?.ingredients) ? body.ingredients : [];
    const diet: string = typeof body?.diet === "string" ? body.diet : "any";

    const cleaned = ingredients
      .map((s) => String(s).trim())
      .filter((s) => s.length > 0 && s.length < 60)
      .slice(0, 30);

    if (cleaned.length === 0) {
      return new Response(JSON.stringify({ error: "Add at least one ingredient." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const systemPrompt = `You are a creative home chef. Given a list of ingredients a user has, suggest 3 realistic recipes they can actually make. Prefer recipes that use mostly the listed ingredients plus common pantry staples (salt, pepper, oil, water, basic spices). Keep instructions concise, friendly and mobile-readable. Diet preference: ${diet}.`;

    const userPrompt = `Ingredients on hand: ${cleaned.join(", ")}. Return 3 recipes.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_recipes",
              description: "Return 3 recipe suggestions based on the user's ingredients.",
              parameters: {
                type: "object",
                properties: {
                  recipes: {
                    type: "array",
                    minItems: 3,
                    maxItems: 3,
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        emoji: { type: "string", description: "Single food emoji" },
                        description: { type: "string", description: "1 short sentence" },
                        time_minutes: { type: "number" },
                        difficulty: { type: "string", enum: ["Easy", "Medium", "Hard"] },
                        servings: { type: "number" },
                        used_ingredients: { type: "array", items: { type: "string" } },
                        extra_ingredients: {
                          type: "array",
                          items: { type: "string" },
                          description: "Pantry staples or items the user may need to add",
                        },
                        steps: {
                          type: "array",
                          minItems: 3,
                          items: { type: "string" },
                        },
                        tip: { type: "string" },
                      },
                      required: [
                        "title", "emoji", "description", "time_minutes",
                        "difficulty", "servings", "used_ingredients",
                        "extra_ingredients", "steps", "tip",
                      ],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["recipes"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_recipes" } },
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests, slow down a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Lovable Cloud settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await resp.text();
      console.error("AI gateway error", resp.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const call = data?.choices?.[0]?.message?.tool_calls?.[0];
    const args = call?.function?.arguments;
    if (!args) throw new Error("No tool call returned");
    const parsed = JSON.parse(args);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-recipes error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
