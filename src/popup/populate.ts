const entryTemplate = document.getElementById("entry") as HTMLTemplateElement;
const entriesEl = document.getElementById("entries")!;

async function populateEntries(): Promise<void> {
	const {
		entries,
		read
	}: { entries: Entry[]; read: string[] } = await browser.storage.local.get({
		entries: [],
		read: []
	});

	while (entriesEl.lastChild) entriesEl.removeChild(entriesEl.lastChild);

	let unread = 0;
	for (const entry of entries) if (read.indexOf(entry.id) === -1) unread++;
	if (unread === 0) {
		const text = document.createElement("div");
		text.className = "empty";
		text.textContent = "You are all caught up!";
		entriesEl.appendChild(text);
    return;
	}

	let i = 0;
  const displayDuration = (await browser.storage.sync.get("fetchDuration")).fetchDuration;
  const dispAll = document.getElementById("catAll")!.classList.contains("selected");
  const dispCats = Array.from(document.getElementById("catSelect")!.querySelectorAll(".selected"),(el)=>el.textContent);
  const feeds : Feed[]= (await browser.storage.sync.get({feeds: []})).feeds;
  function shouldDisplay(url : string) {
    const feed = feeds.find((el)=>el.url === url);
    if (!feed) return false;
    for (const cat of feed.cats) {
      if (dispCats.includes(cat)) {
        return true;
      }
    }
    return false;
  }
	for (const entry of entries) {
		if (i > 100) break;
		if (read.indexOf(entry.id) !== -1) continue;
    if (!(dispAll || shouldDisplay(entry.feedUrl))) continue;

		const el = document.importNode(entryTemplate.content, true);
		const entryEl = el.querySelector(".entry")!;

		el.querySelector(".icon")!.setAttribute("src", entry.icon);
		el.querySelector(".title")!.textContent = entry.title;
		el.querySelector(".author")!.textContent = entry.author;
		el.querySelector(".date")!.textContent = new Date(
			entry.date
		).toLocaleDateString();
		if (entry.thumbnail)
			el.querySelector(".thumbnail img")!.setAttribute("src", entry.thumbnail);
    if (displayDuration && entry.duration)
      el.querySelector(".thumbnail .duration")!.textContent = entry.duration;

		entryEl.addEventListener("click", async e => {
			read.push(entry.id);
			browser.storage.local.set({ read });

			// Only open new tab if user didn't click the "mark as read" button
			if ((e.target as Element).className !== "read")
				browser.tabs.create({ url: entry.link });
		});

		entriesEl.appendChild(el);
		i++;
	}
	if (i === 0) {
		const text = document.createElement("div");
		text.className = "empty";
		text.textContent = "No entries for the selected categories";
		entriesEl.appendChild(text);
	}
}

export { populateEntries };
