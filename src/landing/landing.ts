type Lang = "en" | "tr";

const KEY = "dh.site.lang";
const root = document.documentElement;
const toggle = document.getElementById("lang");

function stored(): Lang | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "en" || v === "tr" ? v : null;
  } catch {
    return null;
  }
}

function apply(lang: Lang) {
  root.dataset.lang = lang;
  root.lang = lang;
  if (toggle) toggle.textContent = lang === "en" ? "TR" : "EN";
}

apply(stored() ?? (navigator.language.toLowerCase().startsWith("tr") ? "tr" : "en"));

toggle?.addEventListener("click", () => {
  const next: Lang = root.dataset.lang === "en" ? "tr" : "en";
  apply(next);
  try {
    localStorage.setItem(KEY, next);
  } catch {
    // Private mode: the choice lasts for this page only.
  }
});

document.querySelectorAll<HTMLButtonElement>(".copy").forEach((btn) => {
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy ?? "");
      btn.classList.add("done");
      setTimeout(() => btn.classList.remove("done"), 1200);
    } catch {
      // Clipboard blocked; the value is visible next to the button.
    }
  });
});
