import { Link } from "react-router-dom";
import { ChevronLeft, Droplets } from "lucide-react";
import { useBB } from "@/lib/bb/store";
import { useMemo } from "react";

export function HistoryPage() {
  const { state, clearHistory } = useBB();

  const groups = useMemo(() => {
    const map = new Map<string, typeof state.history>();
    for (const h of state.history) {
      const d = new Date(h.at);
      const key = d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
      const arr = map.get(key) ?? [];
      arr.push(h);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [state.history]);

  const weekly = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 3_600_000;
    const count = state.history.filter((h) => h.at >= weekAgo).length;
    return { count, perDay: (count / 7).toFixed(1) };
  }, [state.history]);

  return (
    <div className="min-h-screen bg-gradient-sky pb-12">
      <header className="safe-top px-5 pb-2 flex items-center gap-2">
        <Link to="/" className="h-11 w-11 grid place-items-center rounded-2xl hover:bg-muted tap-44" aria-label="Back">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="font-display text-2xl font-bold">History</h1>
        {state.history.length > 0 && (
          <button onClick={() => { if (confirm("Clear all history?")) clearHistory(); }}
            className="ml-auto text-sm text-muted-foreground tap-44 px-3">Clear</button>
        )}
      </header>

      <div className="px-5 mt-4 space-y-6">
        {state.history.length > 0 && (
          <div className="rounded-3xl bg-gradient-water text-primary-foreground p-5 shadow-water">
            <div className="text-sm uppercase tracking-wider opacity-80 font-bold">This week</div>
            <div className="font-display text-3xl font-black mt-1">{weekly.count} refills</div>
            <div className="text-sm opacity-90">That's {weekly.perDay}× a day on average.</div>
          </div>
        )}

        {state.history.length === 0 && (
          <div className="text-center py-20">
            <Droplets className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No refills logged yet. Tap the big button on the home screen to get started.</p>
          </div>
        )}

        {groups.map(([date, items]) => (
          <section key={date}>
            <h2 className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">{date}</h2>
            <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
              {items.map((h, i) => (
                <div key={h.id} className={`flex items-center gap-3 p-4 ${i ? "border-t border-border" : ""}`}>
                  <div className="h-10 w-10 rounded-full bg-primary/10 grid place-items-center">
                    <Droplets className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{h.petName}'s bowl refilled</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(h.at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
