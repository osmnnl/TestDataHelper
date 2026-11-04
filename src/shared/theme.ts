import { getSettings, type Settings } from "../storage/favorites";

export type ThemePref = NonNullable<Settings["theme"]>;

const CACHE_KEY = "dh.theme";

function resolve(pref: ThemePref): "light" | "dark" {
  if (pref !== "auto") return pref;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(pref: ThemePref) {
  document.documentElement.dataset.theme = resolve(pref);
  try {
    localStorage.setItem(CACHE_KEY, pref);
  } catch {
    /* önbellek yoksa her açılışta storage'dan okunur */
  }
}

/** İlk boyamada titreme olmasın diye önce yerel önbellek, sonra kayıtlı ayar */
export function initTheme() {
  let cached: ThemePref = "light";
  try {
    cached = (localStorage.getItem(CACHE_KEY) as ThemePref | null) ?? "light";
  } catch {
    /* yok say */
  }
  applyTheme(cached);
  void getSettings().then((s) => applyTheme(s.theme ?? "light"));
}
