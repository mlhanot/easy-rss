import {getFeeds, setFeeds} from "../background/feedsInterface";

async function addFeed(newfeed: Feed): Promise<void> {
	const oldFeeds = await getFeeds();

	if (oldFeeds.some(f => f.url === newfeed.url)) {
    console.log("Refusing to add duplicate entry: ");
    console.log(newfeed);
    return;
  }
  oldFeeds.push(newfeed);
  setFeeds(oldFeeds);
}

export {addFeed};
