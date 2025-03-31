import "./manage.scss";
import { populateFeeds } from "./populate";

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

browser.storage.sync.get({ interval: 5, fetchDuration: false, expandMenu: false, feeds: [] }).then(results => {
	interval.value = results.interval.toString();
	intervalOutput.textContent = minutes(results.interval.toString());
  fetchDuration.checked = results.fetchDuration;
  expandMenu.checked = results.expandMenu;
	populateFeeds(results.feeds);
});

browser.storage.onChanged.addListener(changes => {
	if (changes.feeds) populateFeeds(changes.feeds.newValue);
});

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
