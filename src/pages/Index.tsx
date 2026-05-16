import { useEffect } from "react";
import { useBB } from "@/lib/bb/store";
import { Onboarding } from "@/components/bb/Onboarding";
import { Home } from "@/components/bb/Home";

export default function Index() {
  const { state, updateSettings } = useBB();

  // Apply appearance settings to <html>
  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const useDark =
        state.settings.darkMode === "dark" ||
        (state.settings.darkMode === "auto" && mq.matches);
      root.classList.toggle("dark", useDark);
      root.classList.toggle("hc", state.settings.highContrast);
      root.classList.toggle("big-text", state.settings.largeText);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [state.settings.darkMode, state.settings.highContrast, state.settings.largeText]);

  // ensure default settings persist
  useEffect(() => { updateSettings({}); }, []); // eslint-disable-line

  if (!state.onboarded || state.pets.length === 0) return <Onboarding />;
  return <Home />;
}
