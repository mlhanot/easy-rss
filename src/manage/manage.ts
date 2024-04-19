import "./manage.scss";
import { populateFeeds } from "./populate";

const interval = document.getElementById("interval") as HTMLInputElement;
const intervalOutput = document.getElementById("intervalOutput")!;
const fetchDuration = document.getElementById("fetchDuration") as HTMLInputElement;
const saveSettings = document.getElementById("saveSettings")!;

const minutes = (s: string) => `${s} ${s === "1" ? "minute" : "minutes"}`;

saveSettings.addEventListener("click", () => {
	browser.storage.sync.set({ interval: parseInt(interval.value, 10), fetchDuration: fetchDuration.checked });
});

interval.addEventListener("input", () => {
	intervalOutput.textContent = minutes(interval.value);
});

browser.storage.sync.get({ interval: 5, fetchDuration: false, feeds: [] }).then(results => {
	interval.value = results.interval.toString();
	intervalOutput.textContent = minutes(results.interval.toString());
  fetchDuration.checked = results.fetchDuration;
	populateFeeds(results.feeds);
});

browser.storage.onChanged.addListener(changes => {
	if (changes.feeds) populateFeeds(changes.feeds.newValue);
});

import { sync } from "./sync";
document.getElementById("sync")!.addEventListener("click", sync);

import { exportFeeds } from "./export";
document.getElementById("export")!.addEventListener("click", exportFeeds);

import { importFeeds } from "./import";
const upload = document.getElementById("upload") as HTMLInputElement;
const importEl = document.getElementById("import")!;
importEl.addEventListener("click", () => upload.click());
upload.addEventListener("change", importFeeds);
