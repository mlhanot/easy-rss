import "./manage.scss";
import { populateFeeds } from "./populate";
import { populateCats } from "./populateCat";
import { getFeeds } from "../background/feedsInterface";

// Settings section
const interval = document.getElementById("interval") as HTMLInputElement;
const intervalOutput = document.getElementById("intervalOutput")!;
const fetchBatch = document.getElementById("fetchBatch") as HTMLInputElement;
const fetchDuration = document.getElementById("fetchDuration") as HTMLInputElement;
const expandMenu = document.getElementById("expandMenu") as HTMLInputElement;
const hideBadgeTextMenu = document.getElementById("hideBadgeTextMenu") as HTMLInputElement;
const saveSettings = document.getElementById("saveSettings")!;

const minutes = (s: string) => `${s} ${s === "1" ? "minute" : "minutes"}`;

saveSettings.addEventListener("click", () => {
	browser.storage.sync.set({ interval: parseInt(interval.value, 10), 
                           batch: parseInt(fetchBatch.value, 10),
                           fetchDuration: fetchDuration.checked,
                           expandMenu: expandMenu.checked,
                           hideBadgeText: hideBadgeTextMenu.checked
  });
});
interval.addEventListener("input", () => {
	intervalOutput.textContent = minutes(interval.value);
});

// Init page
const extVersion = browser.runtime.getManifest().version;
browser.storage.sync.get({ interval: 5, batch: 10, fetchDuration: false, expandMenu: false, hideBadgeText: false, cats: [] }).then(results => {
	interval.value = results.interval.toString();
	intervalOutput.textContent = minutes(results.interval.toString());
  fetchBatch.value = results.batch.toString();
  fetchDuration.checked = results.fetchDuration;
  expandMenu.checked = results.expandMenu;
  populateCats(results.cats);
});
getFeeds().then(feeds => populateFeeds(feeds));

browser.storage.onChanged.addListener(changes => {
  if (changes.cats) populateCats(changes.cats.newValue);
	if (changes.feedsChanged) getFeeds().then(feeds => populateFeeds(feeds));
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

import { createMultiSelect } from "../ui/select";
import { markFeeds } from "./populate";
const catSelectEl = document.getElementById("catSelect")!;
const catAllEl = document.getElementById("catAll")!;
const catNoneEl = document.getElementById("catNone")!;
catAllEl.classList.add("selected");
catSelectEl.addEventListener("click",createMultiSelect,true);
catSelectEl.addEventListener("click",() => {
  catAllEl.classList.remove("selected");
  catNoneEl.classList.remove("selected");
  markFeeds();
});
catAllEl.addEventListener("click",()=> {
  catSelectEl.querySelectorAll(".selected").forEach((el)=>el.classList.remove("selected"));
  catAllEl.classList.add("selected");
  catNoneEl.classList.remove("selected");
  markFeeds();
});
catNoneEl.addEventListener("click",()=> {
  catSelectEl.querySelectorAll(".selected").forEach((el)=>el.classList.remove("selected"));
  catNoneEl.classList.add("selected");
  catAllEl.classList.remove("selected");
  markFeeds();
});

import { addFeedUI } from "./addFeed";
addFeedUI();
document.getElementById("addFeed")!.addEventListener("click", () => {
  document.getElementById("addFeed")!.style.pointerEvents = "none";
  document.getElementById("newfeed")!.style.display = 'block';
});

document.getElementById("addFeedCatSelect")!.addEventListener("click",createMultiSelect,true);
