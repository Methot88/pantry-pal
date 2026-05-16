import { useBB } from "@/lib/bb/store";
import type { PetType } from "@/lib/bb/types";
import { Plus, ChevronDown } from "lucide-react";
import { useState } from "react";
import { AddPetSheet } from "./AddPetSheet";

const emojiFor = (t: PetType) => (t === "dog" ? "🐶" : t === "cat" ? "🐱" : "🐾");

export function PetSwitcher() {
  const { state, activePet, setActivePet } = useBB();
  const [open, setOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  if (!activePet) return null;

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 px-3 h-11 rounded-2xl bg-card border border-border shadow-soft tap-44 active:scale-95 transition"
          aria-label="Switch pet"
        >
          <span className="text-xl">{emojiFor(activePet.type)}</span>
          <span className="font-display font-bold text-lg max-w-[140px] truncate">
            {activePet.name}'s bowl
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
            <div className="absolute top-full left-0 mt-2 w-64 bg-popover border border-border rounded-2xl shadow-elev z-30 p-2 animate-float-up">
              {state.pets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setActivePet(p.id); setOpen(false); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl tap-44 hover:bg-muted ${
                    p.id === activePet.id ? "bg-primary/10" : ""
                  }`}
                >
                  <span className="text-2xl">{emojiFor(p.type)}</span>
                  <div className="text-left flex-1">
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">{p.size} {p.type}</div>
                  </div>
                </button>
              ))}
              <button
                onClick={() => { setOpen(false); setAddOpen(true); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl tap-44 hover:bg-muted text-primary font-semibold"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 grid place-items-center">
                  <Plus className="h-4 w-4" />
                </div>
                Add another pet
              </button>
            </div>
          </>
        )}
      </div>
      <AddPetSheet open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}
