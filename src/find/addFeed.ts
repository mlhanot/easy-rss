async function addFeed(newfeed: Feed): Promise<void> {
	const oldFeeds: Feed[] = (await browser.storage.sync.get({ feeds: [] })).feeds;

	if (oldFeeds.some(f => f.url === newfeed.url)) {
    console.log("Refusing to add duplicate entry: ");
    console.log(newfeed);
    return;
  }
  oldFeeds.push(newfeed);
  browser.storage.sync.set({ feeds: oldFeeds as unknown as StorageValue});
}

export {addFeed};
