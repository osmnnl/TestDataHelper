/**
 * Background Service Worker
 * Context menü oluşturur ve yönetir
 */

import { DATA_ITEMS_CONFIG, type DataItemConfig } from "./data-config";

// Context menu oluştur
function createContextMenus(): void {
  // Ana menü
  chrome.contextMenus.create({
    id: "data-helper-root",
    title: "Data Helper",
    contexts: ["editable"],
  });

  // Kategori grupları
  const categories = [
    { id: "financial", title: "💳 Finansal" },
    { id: "personal", title: "👤 Kişisel" },
    { id: "text", title: "📝 Metin" },
  ];

  categories.forEach((category) => {
    chrome.contextMenus.create({
      id: `category-${category.id}`,
      parentId: "data-helper-root",
      title: category.title,
      contexts: ["editable"],
    });
  });

  // Veri öğeleri
  DATA_ITEMS_CONFIG.forEach((item: DataItemConfig) => {
    chrome.contextMenus.create({
      id: `generate-${item.id}`,
      parentId: `category-${item.category}`,
      title: item.label,
      contexts: ["editable"],
    });
  });
}

// Extension yüklendiğinde menüleri oluştur
chrome.runtime.onInstalled.addListener(() => {
  createContextMenus();
});

// Menü tıklandığında
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!info.menuItemId.toString().startsWith("generate-")) {
    return;
  }

  const itemId = info.menuItemId.toString().replace("generate-", "");
  const item = DATA_ITEMS_CONFIG.find((i: DataItemConfig) => i.id === itemId);

  if (!item || !tab?.id) {
    return;
  }

  const generatedValue = item.generator();

  // frameId ile doğru frame'e mesaj gönder
  chrome.tabs.sendMessage(
    tab.id,
    {
      type: "FILL_INPUT",
      value: generatedValue,
    },
    { frameId: info.frameId },
  );
});
