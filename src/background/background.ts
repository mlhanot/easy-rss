import { fetchEntries } from "./parser";
import { fetchLength } from "./length";
import { updateData } from "./updateData";

const sorter = (a: Entry, b: Entry) =>
	new Date(b.date).getTime() - new Date(a.date).getTime();

async function fetchFeeds() {
  const displayText : boolean = !(await browser.storage.sync.get({hideBadgeText: false})).hideBadgeText;
	browser.browserAction.setBadgeBackgroundColor({ color: "#3b88c3" });
  if (displayText) {
  	browser.browserAction.setBadgeText({ text: "🕒" });
  }
	const feeds: Feed[] = (await browser.storage.sync.get({ feeds: [] })).feeds;

	const toFetch: Array<Promise<Entry[]>> = [];
	for (const feed of feeds) {
		toFetch.push(fetchEntries(feed));
	}

	const entries = ([] as Entry[]).concat(...(await Promise.all(toFetch)));
	entries.sort(sorter);

	browser.storage.local.set({ entries: entries as unknown as StorageValue });

  // Fetch length after setting the other entry as it can request a lot of pages
  if (!(await browser.storage.sync.get({ fetchDuration: false})).fetchDuration) return;
  const lengthDB: LengthDB = (await browser.storage.local.get({lengthDB: {}})).lengthDB;
  const lengthPromise: Array<Promise<void>> = [];
  for (const entry of entries) {
    lengthPromise.push(fetchLength(entry,lengthDB));
  }
  await Promise.allSettled(lengthPromise);
  for (const entry of entries) {
    if (typeof entry.duration !== "undefined") lengthDB[entry.id] = entry.duration;
  }

  browser.storage.local.set({entries: entries as unknown as StorageValue, 
                             lengthDB: lengthDB as unknown as StorageValue});
}

updateData().then(()=>{
  fetchFeeds();

  browser.storage.sync.get({ interval: 5 }).then(results => {
    browser.alarms.create("fetchFeeds", { periodInMinutes: results.interval });
    browser.alarms.onAlarm.addListener(fetchFeeds);
  });

  browser.storage.onChanged.addListener(async (changes, areaName) => {
    if (changes.feeds) {
      fetchFeeds();
    }

    if (changes.interval) {
      await browser.alarms.clear("fetchFeeds");
      browser.alarms.create("fetchFeeds", {
        periodInMinutes: changes.interval.newValue
      });
    }

    if ((changes.read || changes.entries) && areaName === "local") {
      const read: string[] = changes.read && changes.read.newValue
        ? changes.read.newValue
        : (await browser.storage.local.get({ read: [] })).read;
      const entries: Entry[] = changes.entries && changes.entries.newValue
        ? changes.entries.newValue
        : (await browser.storage.local.get({ entries: [] })).entries;

      let unread = 0;
      for (const entry of entries) if (read.indexOf(entry.id) === -1) unread++;

      const hideText : boolean = (await browser.storage.sync.get({hideBadgeText: false})).hideBadgeText;
      browser.browserAction.setBadgeBackgroundColor({ color: "#dd2e44" });
      browser.browserAction.setBadgeText({
        text: (unread === 0 || hideText) ? "" : unread.toString()
      });
    }
  });
});
