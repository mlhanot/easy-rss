import { setFeeds } from "./feedsInterface";

function semverCompare(a: string, b: string) {
    if (a.startsWith(b + "-")) return -1; // "x.y.z-rc0" comes before "x.y.z";
    if (b.startsWith(a + "-")) return  1;
    return a.localeCompare(b, "en", { numeric: true, sensitivity: "base"});
}

function updatePreTov2d1d0(oldSave: StorageObject) {
  oldSave.cats = [];
  oldSave.feeds.forEach((feed: StorageObject)=>{feed.cats = [];});
}
function update2d1d0To2d2d1(oldSave: StorageObject) {
  const maxNbFeeds = 32;
  const nbReqList = Math.ceil(oldSave.feeds.length/maxNbFeeds);
  for (let i = 0; i < nbReqList; i++) {
    oldSave["feeds"+i] = oldSave.feeds.slice(i*maxNbFeeds,(i+1)*maxNbFeeds);
  }
  delete oldSave.feeds;
}

async function updateData(): Promise<void> {
  const sV = ((await browser.storage.sync.get("version")).version??"0.0.0") as string;
  const cV = browser.runtime.getManifest().version as string;
  if (semverCompare(sV,cV) < 0) {
    const oldSave = await browser.storage.sync.get(null)??{};
    const oldKeys = Object.keys(oldSave);
    if (!oldSave.feeds) {
      oldSave.feeds = [];
    }
    if (semverCompare(sV,"2.1.0") < 0) {
      updatePreTov2d1d0(oldSave);
    }
    if (semverCompare(sV,"2.2.1") < 0) {
      update2d1d0To2d2d1(oldSave);
    }
    oldSave.version = cV;
    await browser.storage.sync.remove(oldKeys).then(() => {
      browser.storage.sync.set(oldSave);
    });
  }
}

export { updateData };
