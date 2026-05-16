import { useState } from "react";
import { useBB } from "@/lib/bb/store";
import { BOWL_ML } from "@/lib/bb/prediction";
import type { PetType, PetSize, BowlSize } from "@/lib/bb/types";
import { X } from "lucide-react";
import { toast } from "sonner";

interface Props { open: boolean; onClose: () => void; }

export function AddPetSheet({ open, onClose }: Props) {
  const { addPet, setActivePet } = useBB();
  const [name, setName] = useState("");
  const [type, setType] = useState<PetType>("dog");
  const [size, setSize] = useState<PetSize>("medium");
  const [bowl, setBowl] = useState<BowlSize>("medium");

  if (!open) return null;

  const save = () => {
    if (!name.trim()) { toast.error("Give your pet a name"); return; }
    const p = addPet({ name: name.trim(), type, size, bowlSize: bowl, bowlMl: BOWL_ML[bowl] });
    setActivePet(p.id);
    setName(""); setType("dog"); setSize("medium"); setBowl("medium");
    onClose();
    toast.success(`${p.name} added`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-foreground/40 animate-float-up" onClick={onClose} />
      <div className="relative w-full bg-card rounded-t-3xl p-6 pb-8 safe-bottom shadow-elev animate-float-up max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl font-bold">Add a pet</h2>
          <button onClick={onClose} className="tap-44 grid place-items-center rounded-full hover:bg-muted" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <label className="text-sm font-semibold block mb-2">Name</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Bella"
          className="w-full h-12 px-4 rounded-2xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-ring mb-4"
        />

        <label className="text-sm font-semibold block mb-2">Type</label>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {(["dog", "cat", "other"] as PetType[]).map((t) => (
            <button key={t} onClick={() => setType(t)}
              className={`h-14 rounded-2xl border-2 capitalize font-semibold ${type === t ? "border-primary bg-primary/10" : "border-border"}`}>
              {t === "dog" ? "🐶" : t === "cat" ? "🐱" : "🐾"} {t}
            </button>
          ))}
        </div>

        <label className="text-sm font-semibold block mb-2">Size</label>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {(["small", "medium", "large"] as PetSize[]).map((s) => (
            <button key={s} onClick={() => setSize(s)}
              className={`h-12 rounded-2xl border-2 capitalize font-semibold ${size === s ? "border-primary bg-primary/10" : "border-border"}`}>
              {s}
            </button>
          ))}
        </div>

        <label className="text-sm font-semibold block mb-2">Bowl</label>
        <div className="grid grid-cols-3 gap-2 mb-6">
          {(["small", "medium", "large"] as BowlSize[]).map((b) => (
            <button key={b} onClick={() => setBowl(b)}
              className={`h-12 rounded-2xl border-2 capitalize font-semibold ${bowl === b ? "border-primary bg-primary/10" : "border-border"}`}>
              {b}
            </button>
          ))}
        </div>

        <button onClick={save}
          className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold shadow-water active:scale-[0.98]">
          Add pet
        </button>
      </div>
    </div>
  );
}
