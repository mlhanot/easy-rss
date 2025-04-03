function semverCompare(a: string, b: string) {
    if (a.startsWith(b + "-")) return -1
    if (b.startsWith(a + "-")) return  1
    return a.localeCompare(b, "en", { numeric: true, sensitivity: "base"})
}

function updatePreTov2d1d0(oldSave: StorageObject) {
  oldSave.cats = [];
  oldSave.feeds.forEach((feed: StorageObject)=>{feed.cats = [];});
}

async function updateData(): Promise<void> {
  const sV = ((await browser.storage.sync.get("version")).version??"0.0.0") as string;
  const cV = browser.runtime.getManifest().version as string;
  if (semverCompare(sV,cV) < 0) {
    const oldSave = await browser.storage.sync.get()??{};
    if (!oldSave.feeds) {
      oldSave.feeds = [];
    }
    if (semverCompare(sV,"2.1.0") < 0) {
      updatePreTov2d1d0(oldSave);
    }
    oldSave.version = cV;
    browser.storage.sync.set(oldSave);
  }
}

export { updateData };
