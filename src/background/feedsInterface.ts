
async function getFeeds() : Promise<Feed[]> {
  const sync = await browser.storage.sync.get(null).catch((err) => {
    console.error("Failed to retrieve sync storage: ",err);
    return {};
  });
  const feedsList = Object.keys(sync).filter((str)=>str.startsWith("feeds")) as (keyof typeof sync)[];
  return feedsList.reduce((accumulator, currentValue) => accumulator.concat(sync[currentValue]),[]);
}

async function setFeeds(feeds: Feed[]) : Promise<void> {
  const maxNbFeeds = 32; // must fit in the 8kiB limit of storage sync
  const sync :StorageObject = await browser.storage.sync.get(null).catch((err) => {
    console.error("Failed to retrieve sync storage: ",err);
    return {};
  });
  const feedsList = Object.keys(sync).filter((str)=>str.startsWith("feeds"));
  const nbReqList = Math.ceil(feeds.length/maxNbFeeds);
  let newFeedsList : string[] = [];
  for (let i = 0; i < nbReqList; i++) {
    newFeedsList.push("feeds"+i)
  }
  const oldFeedsList = feedsList.filter((x)=>!newFeedsList.includes(x));
  browser.storage.sync.remove(oldFeedsList);
  const toggleChange = !(await browser.storage.local.get({"feedsChanged": false})); // Allow the rest of the code to listen for change
  let splitFeeds : StorageObject = {};
  for (let i = 0; i < nbReqList; i++) {
    splitFeeds[newFeedsList[i]] = feeds.slice(i*maxNbFeeds,(i+1)*maxNbFeeds);
  }
  browser.storage.sync.set(splitFeeds).then( () =>
    {browser.storage.local.set({"feedsChanged": toggleChange});}
  );
}

export { getFeeds, setFeeds };
