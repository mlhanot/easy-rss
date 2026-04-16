import { fetchEntries } from "./parser";
import { fetchLength } from "./length";
import { updateData } from "./updateData";
import { getFeeds } from "./feedsInterface";

const sorter = (a: Entry, b: Entry) =>
	new Date(b.date).getTime() - new Date(a.date).getTime();

async function fetchFeeds() {
  const displayText : boolean = !(await browser.storage.sync.get({hideBadgeText: false})).hideBadgeText;
	browser.browserAction.setBadgeBackgroundColor({ color: "#3b88c3" });
  if (displayText) {
  	browser.browserAction.setBadgeText({ text: "🕒" });
  }
	const feeds = await getFeeds();
  // Check for existing permissions
  const allowedHosts = (await browser.permissions.getAll()).origins??[];
  const missingPerms: Array<string> = [];
  for (const feed of feeds) {
    const host = (new URL(feed.url)).origin + "/*";
    if (! allowedHosts.includes(host)) {
      missingPerms.push(host);
    }
  }
  
	const toFetch: Array<Promise<Entry[]>> = [];
	for (const feed of feeds) {
		toFetch.push(fetchEntries(feed));
	}

  const entries : Entry[] = (await browser.storage.local.get({entries: []})).entries;
	const newEntries = ([] as Entry[]).concat(...(await Promise.all(toFetch)));
  newEntries.forEach((nE) => (entries.some((cE) => nE.id === cE.id) ? null : entries.push(nE)));
	entries.sort(sorter);

  if (entries.length == 0) { // onChanged is not fired when nothing is pushed
    if (missingPerms.length == 0) {
      browser.browserAction.setBadgeBackgroundColor({ color: "#dd2e44" });
      browser.browserAction.setBadgeText({ text: "" });
    } else {
      browser.browserAction.setBadgeBackgroundColor({ color: "#dddd0d" });
      browser.browserAction.setBadgeText({ text: "⚠" });
    }
	  browser.storage.local.set({ missingPerms: missingPerms as unknown as StorageValue });
    return;
  }
	browser.storage.local.set({ entries: entries as unknown as StorageValue, missingPerms: missingPerms as unknown as StorageValue });

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

function permissionHandle(permissions: browser.permissions.Permissions) {
  console.log("New permissions added: ",permissions);
  fetchFeeds();
}

updateData().then(()=>{
  fetchFeeds();

  browser.permissions.onAdded.addListener(permissionHandle);

  browser.storage.sync.get({ interval: 5 }).then(results => {
    browser.alarms.create("fetchFeeds", { periodInMinutes: results.interval });
    browser.alarms.onAlarm.addListener(fetchFeeds);
  });

  browser.storage.onChanged.addListener(async (changes, areaName) => {
    if (changes.feedsChanged) {
      fetchFeeds();
    }

    if (changes.interval) {
      await browser.alarms.clear("fetchFeeds");
      browser.alarms.create("fetchFeeds", {
        periodInMinutes: changes.interval.newValue
      });
    }

    if ((changes.read || changes.entries || changes.missingPerms) && areaName === "local") {
      const read: string[] = changes.read && changes.read.newValue
        ? changes.read.newValue
        : (await browser.storage.local.get({ read: [] })).read;
      const entries: Entry[] = changes.entries && changes.entries.newValue
        ? changes.entries.newValue
        : (await browser.storage.local.get({ entries: [] })).entries;
      const missingPerms: Entry[] = changes.missingPerms && changes.missingPerms.newValue
        ? changes.missingPerms.newValue
        : (await browser.storage.local.get({ missingPerms: [] })).missingPerms;

      if (missingPerms.length > 0) {
        browser.browserAction.setBadgeBackgroundColor({ color: "#dddd0d" });
        browser.browserAction.setBadgeText({ text: "⚠" });
      } else {
        let unread = 0;
        for (const entry of entries) if (read.indexOf(entry.id) === -1) unread++;

        const hideText : boolean = (await browser.storage.sync.get({hideBadgeText: false})).hideBadgeText;
        browser.browserAction.setBadgeBackgroundColor({ color: "#dd2e44" });
        browser.browserAction.setBadgeText({
          text: (unread === 0 || hideText) ? "" : unread.toString()
        });
      }
    }
  });
});
