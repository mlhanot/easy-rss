import { fetchEntries } from "./parser";
import { fetchLength } from "./length";
import { updateData } from "./updateData";
import { getFeeds } from "./feedsInterface";

async function updateBadge(read: string[], entries: Entry[], missingPerms: string[]) {
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

const sorter = (a: Entry, b: Entry) =>
	new Date(b.date).getTime() - new Date(a.date).getTime();

async function fetchFeeds() {
  const syncStore = await browser.storage.sync.get({hideBadgeText: false, batch: 10});
  const displayText : boolean = !syncStore.hideBadgeText;
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
  
  const {feedsCounters, fetchCounter } = await browser.storage.local.get({feedsCounters: [], fetchCounter: 0});
	const toFetch: Array<Promise<Entry[]>> = [];
  let pushed = 0;
	for (const feed of feeds) {
    const feedIndex = feedsCounters.findIndex((el: FetchCounter)=>el.url===feed.url);
    if (feedIndex < 0) {
      pushed = pushed + 1;
      feedsCounters.push({url: feed.url, counter: fetchCounter});
  		toFetch.push(fetchEntries(feed));
      if (pushed === syncStore.batch) break;
    } else if (feedsCounters[feedIndex].counter !== fetchCounter) {
      pushed = pushed + 1;
      feedsCounters[feedIndex].counter = fetchCounter;
  		toFetch.push(fetchEntries(feed));
      if (pushed === syncStore.batch) break;
    }
	}
  if (pushed < syncStore.batch) {
    browser.storage.local.set({feedsCounters: feedsCounters, fetchCounter: fetchCounter + 1});
  } else {
    browser.storage.local.set({feedsCounters: feedsCounters});
  }

  const entries : Entry[] = (await browser.storage.local.get({entries: []})).entries;
	const newEntries = ([] as Entry[]).concat(...(await Promise.all(toFetch)));
  newEntries.forEach((nE) => (entries.some((cE) => nE.id === cE.id) ? null : entries.push(nE)));
	entries.sort(sorter);

  browser.storage.local.get({ read: [] }).then((results)=>updateBadge(results.read,entries,missingPerms));
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

    if ((changes.read || changes.missingPerms) && areaName === "local") {
      const read: string[] = changes.read && changes.read.newValue
        ? changes.read.newValue
        : (await browser.storage.local.get({ read: [] })).read;
      const entries: Entry[] = (await browser.storage.local.get({ entries: [] })).entries;
      const missingPerms: string[] = changes.missingPerms && changes.missingPerms.newValue
        ? changes.missingPerms.newValue
        : (await browser.storage.local.get({ missingPerms: [] })).missingPerms;
      updateBadge(read,entries,missingPerms);
    }
  });
});
