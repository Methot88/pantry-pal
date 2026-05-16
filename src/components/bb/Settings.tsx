import { Link } from "react-router-dom";
import { ChevronLeft, Trash2 } from "lucide-react";
import { useBB } from "@/lib/bb/store";
import type { AlertTone, Sensitivity } from "@/lib/bb/types";
import { playTone, requestNotificationPermission } from "@/lib/bb/notifications";
import { toast } from "sonner";

const TONES: { v: AlertTone; label: string }[] = [
  { v: "drop", label: "💧 Water drop" },
  { v: "bell", label: "🔔 Gentle bell" },
  { v: "bark", label: "🐶 Soft bark" },
  { v: "meow", label: "🐱 Soft meow" },
  { v: "chime", label: "🎐 Chime" },
];

const SENS: { v: Sensitivity; label: string; sub: string }[] = [
  { v: "low", label: "Low", sub: "Mild climate" },
  { v: "medium", label: "Medium", sub: "Default" },
  { v: "high", label: "High", sub: "Hot or dry homes" },
];

export function SettingsPage() {
  const { state, activePet, updatePet, updateSettings, removePet } = useBB();
  const s = state.settings;

  return (
    <div className="min-h-screen bg-gradient-sky pb-12">
      <header className="safe-top px-5 pb-2 flex items-center gap-2">
        <Link to="/" className="h-11 w-11 grid place-items-center rounded-2xl hover:bg-muted tap-44" aria-label="Back">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="font-display text-2xl font-bold">Settings</h1>
      </header>

      <div className="px-5 space-y-6 mt-4">
        {activePet && (
          <section className="bg-card rounded-3xl p-5 shadow-soft border border-border">
            <h2 className="font-display text-xl font-bold mb-3">{activePet.name}'s bowl</h2>
            <label className="text-sm font-semibold block mb-2">Bowl size — {activePet.bowlMl} ml</label>
            <input
              type="range" min={100} max={2500} step={50} value={activePet.bowlMl}
              onChange={(e) => updatePet(activePet.id, { bowlMl: Number(e.target.value) })}
              className="w-full accent-primary"
              aria-label="Bowl size in milliliters"
            />
            <div className="flex justify-between text-xs text-muted-foreground"><span>XS</span><span>XL</span></div>
          </section>
        )}

        <section className="bg-card rounded-3xl p-5 shadow-soft border border-border space-y-3">
          <h2 className="font-display text-xl font-bold">Reminders</h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">Notifications</div>
              <div className="text-sm text-muted-foreground">Friendly nudges before the bowl runs dry</div>
            </div>
            <button
              onClick={async () => {
                if (!s.notificationsEnabled) {
                  const ok = await requestNotificationPermission();
                  updateSettings({ notificationsEnabled: ok });
                  if (!ok) toast.error("Permission denied in browser");
                } else updateSettings({ notificationsEnabled: false });
              }}
              className={`w-14 h-8 rounded-full p-1 transition-colors ${s.notificationsEnabled ? "bg-primary" : "bg-muted"}`}
              aria-pressed={s.notificationsEnabled}
              aria-label="Toggle notifications"
            >
              <span className={`block h-6 w-6 rounded-full bg-card shadow transition-transform ${s.notificationsEnabled ? "translate-x-6" : ""}`} />
            </button>
          </div>

          <div>
            <div className="font-semibold mb-2">Temperature sensitivity</div>
            <div className="grid grid-cols-3 gap-2">
              {SENS.map(({ v, label, sub }) => (
                <button key={v} onClick={() => updateSettings({ sensitivity: v })}
                  className={`p-3 rounded-2xl border-2 text-left ${s.sensitivity === v ? "border-primary bg-primary/10" : "border-border"}`}>
                  <div className="font-bold">{label}</div>
                  <div className="text-xs text-muted-foreground">{sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="font-semibold mb-2">Alert tone</div>
            <div className="space-y-2">
              {TONES.map(({ v, label }) => (
                <button key={v}
                  onClick={() => { updateSettings({ tone: v }); playTone(v); }}
                  className={`w-full text-left p-3 rounded-2xl border-2 tap-44 ${s.tone === v ? "border-primary bg-primary/10" : "border-border"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <div className="font-semibold text-sm mb-1">Quiet from</div>
              <select value={s.nightStart} onChange={(e) => updateSettings({ nightStart: Number(e.target.value) })}
                className="w-full h-12 px-3 rounded-2xl bg-background border border-border">
                {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                  <option key={h} value={h}>{h.toString().padStart(2, "0")}:00</option>
                ))}
              </select>
            </label>
            <label className="block">
              <div className="font-semibold text-sm mb-1">Quiet until</div>
              <select value={s.nightEnd} onChange={(e) => updateSettings({ nightEnd: Number(e.target.value) })}
                className="w-full h-12 px-3 rounded-2xl bg-background border border-border">
                {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                  <option key={h} value={h}>{h.toString().padStart(2, "0")}:00</option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="bg-card rounded-3xl p-5 shadow-soft border border-border space-y-3">
          <h2 className="font-display text-xl font-bold">Appearance</h2>
          <div className="grid grid-cols-3 gap-2">
            {(["auto", "light", "dark"] as const).map((m) => (
              <button key={m} onClick={() => updateSettings({ darkMode: m })}
                className={`h-12 rounded-2xl border-2 capitalize font-semibold ${s.darkMode === m ? "border-primary bg-primary/10" : "border-border"}`}>
                {m}
              </button>
            ))}
          </div>
          <Toggle label="Large text" sub="Bigger labels for easier reading" value={s.largeText} onChange={(v) => updateSettings({ largeText: v })} />
          <Toggle label="High contrast" sub="Stronger borders and colors" value={s.highContrast} onChange={(v) => updateSettings({ highContrast: v })} />
        </section>

        {state.pets.length > 1 && (
          <section className="bg-card rounded-3xl p-5 shadow-soft border border-border space-y-3">
            <h2 className="font-display text-xl font-bold">Pets</h2>
            {state.pets.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-2xl bg-muted">
                <span className="text-2xl">{p.type === "dog" ? "🐶" : p.type === "cat" ? "🐱" : "🐾"}</span>
                <div className="flex-1">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{p.size} · {p.bowlMl} ml bowl</div>
                </div>
                <button onClick={() => { if (confirm(`Remove ${p.name}?`)) removePet(p.id); }}
                  className="tap-44 grid place-items-center text-destructive" aria-label={`Remove ${p.name}`}>
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </section>
        )}

        <p className="text-center text-xs text-muted-foreground py-4">Bowl Buddy · made with 💧</p>
      </div>
    </div>
  );
}

function Toggle({ label, sub, value, onChange }: { label: string; sub?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="font-semibold">{label}</div>
        {sub && <div className="text-sm text-muted-foreground">{sub}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-14 h-8 rounded-full p-1 transition-colors ${value ? "bg-primary" : "bg-muted"}`}
        aria-pressed={value} aria-label={label}
      >
        <span className={`block h-6 w-6 rounded-full bg-card shadow transition-transform ${value ? "translate-x-6" : ""}`} />
      </button>
    </div>
  );
}
