import "./manage.scss";
import { populateFeeds } from "./populate";
import { populateCats } from "./populateCat";

// Settings section
const interval = document.getElementById("interval") as HTMLInputElement;
const intervalOutput = document.getElementById("intervalOutput")!;
const fetchDuration = document.getElementById("fetchDuration") as HTMLInputElement;
const expandMenu = document.getElementById("expandMenu") as HTMLInputElement;
const saveSettings = document.getElementById("saveSettings")!;

const minutes = (s: string) => `${s} ${s === "1" ? "minute" : "minutes"}`;

saveSettings.addEventListener("click", () => {
	browser.storage.sync.set({ interval: parseInt(interval.value, 10), 
                           fetchDuration: fetchDuration.checked,
                           expandMenu: expandMenu.checked
  });
});
interval.addEventListener("input", () => {
	intervalOutput.textContent = minutes(interval.value);
});

// Init page
const extVersion = browser.runtime.getManifest().version;
browser.storage.sync.get({ interval: 5, fetchDuration: false, expandMenu: false, feeds: [], cats: [] }).then(results => {
	interval.value = results.interval.toString();
	intervalOutput.textContent = minutes(results.interval.toString());
  fetchDuration.checked = results.fetchDuration;
  expandMenu.checked = results.expandMenu;
  populateCats(results.cats);
	populateFeeds(results.feeds);
});

browser.storage.onChanged.addListener(changes => {
  if (changes.cats) populateCats(changes.cats.newValue);
	if (changes.feeds) populateFeeds(changes.feeds.newValue);
});

// Cat section
const newCatDiagEl = document.getElementById("newCatDialog") as HTMLElement;
const newCatDiagText = newCatDiagEl.querySelector("input[type=\"text\"]") as HTMLInputElement;
document.getElementById("addCat")!.addEventListener("click", ()=> {
  newCatDiagEl.classList.remove("disabled");
  newCatDiagText.focus();
});
newCatDiagEl.querySelector("button.YES")!.addEventListener("click", async ()=> {
  const name =  newCatDiagText.value;
  newCatDiagText.value = "";
  newCatDiagEl.classList.add("disabled");
  if (name.length > 0) {
    const cats: string[] = (await browser.storage.sync.get({ cats: []})).cats;
    if (!cats.includes(name)) {
      browser.storage.sync.set({ cats: cats.concat(name) as unknown as StorageValue});
    }
  }
});
newCatDiagEl.querySelector("button.NO")!.addEventListener("click", ()=> {
  newCatDiagText.value = "";
  newCatDiagEl.classList.add("disabled");
});

// Feeds section
import { exportFeeds } from "./export";
document.getElementById("export")!.addEventListener("click", exportFeeds);

import { importFeeds } from "./import";
const upload = document.getElementById("upload") as HTMLInputElement;
const importEl = document.getElementById("import")!;
importEl.addEventListener("click", () => upload.click());
upload.addEventListener("change", importFeeds);

import { addFeedUI } from "./addFeed";
addFeedUI();
document.getElementById("addFeed")!.addEventListener("click", () => {
  document.getElementById("addFeed")!.style.pointerEvents = "none";
  document.getElementById("newfeed")!.style.display = 'block';
});

import { createMultiSelect } from "../ui/select";
document.getElementById("addFeedCatSelect")!.addEventListener("click",createMultiSelect,true);
