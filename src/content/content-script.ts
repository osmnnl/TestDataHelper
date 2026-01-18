/**
 * Content Script
 * Sayfalara inject olur ve input alanlarına değer yazar
 */

interface FillInputMessage {
  type: "FILL_INPUT";
  value: string;
}

// Son sağ tıklanan elementi sakla
let lastRightClickedElement: HTMLElement | null = null;

// Sağ tıklama olayını yakala (context menu açılmadan ÖNCE)
document.addEventListener(
  "contextmenu",
  (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target.getAttribute("contenteditable") === "true"
    ) {
      lastRightClickedElement = target;
    }
  },
  true,
);

// Mesaj dinle
chrome.runtime.onMessage.addListener((message: FillInputMessage) => {
  if (message.type !== "FILL_INPUT") {
    return;
  }

  const targetElement = lastRightClickedElement;

  if (!targetElement) {
    return;
  }

  // Input veya textarea kontrolü
  if (
    targetElement instanceof HTMLInputElement ||
    targetElement instanceof HTMLTextAreaElement
  ) {
    // Değeri yaz
    targetElement.value = message.value;

    // React/Vue gibi framework'lerin değişikliği algılaması için event'leri tetikle
    targetElement.dispatchEvent(new Event("input", { bubbles: true }));
    targetElement.dispatchEvent(new Event("change", { bubbles: true }));

    // Focus'u geri ver
    targetElement.focus();
  }

  // contenteditable elementler için
  if (targetElement.getAttribute("contenteditable") === "true") {
    targetElement.textContent = message.value;
    targetElement.dispatchEvent(new Event("input", { bubbles: true }));
    targetElement.focus();
  }
});
