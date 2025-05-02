import { populateEntries } from "./populate";
import "./popup.scss";

// Open settings
document.getElementById("manage")!
	      .addEventListener("click", () => browser.runtime.openOptionsPage());
  
// Open tools
const tools = document.getElementById("tools")!;
const toolsNav = document.getElementById("toolsNav")!;
const categories = document.getElementById("categories")!;
browser.storage.sync.get({expandMenu: false}).then((results) => {
  if (results.expandMenu) {
    tools.classList.add("open");
    toolsNav.classList.add("lowered");
    categories.classList.add("lowered");
  }
});

document.getElementById("openTools")!.addEventListener("click", () => {
  tools.classList.toggle("open");
  toolsNav.classList.toggle("lowered");
  categories.classList.toggle("lowered");
});

// Find feeds in page
document.getElementById("find")!.addEventListener("click", () => {
	browser.tabs.executeScript(undefined, { file: "/find/find.js" });
});

// Add new feed
const add = document.getElementById("add") as HTMLDivElement;
add.addEventListener("click", () => {
	add.textContent = "URL: ";
	const input = document.createElement("input");
	input.type = "url";
	input.addEventListener("change", async () => {
		const feeds: Feed[] = (await browser.storage.sync.get({ feeds: [] })).feeds;
		feeds.unshift({ url: input.value, name: "", cats: [] });
		browser.storage.sync.set({ feeds: feeds as unknown as StorageValue });

		add.removeChild(input);
		add.textContent = "Add new feed";
	});
	add.appendChild(input);
	input.focus();
});


// Mark all as read
document.getElementById("clear")!.addEventListener("click", async () => {
	const {
		entries,
		read
	}: { entries: Entry[]; read: string[] } = await browser.storage.local.get({
		entries: [],
		read: []
	});
  const feeds : Feed[]= (await browser.storage.sync.get({feeds: []})).feeds;
  const dispAll = document.getElementById("catAll")!.classList.contains("selected");
  const dispCats = Array.from(document.getElementById("catSelect")!.querySelectorAll(".selected"),(el)=>el.textContent);
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
		if (read.indexOf(entry.id) === -1 && (dispAll || shouldDisplay(entry.feedUrl))) read.push(entry.id);
  }
	browser.storage.local.set({ read });
});

// Cat selection
import { createMultiSelect } from "../ui/select";
const catSelectEl = document.getElementById("catSelect")!;
const catAllEl = document.getElementById("catAll")!;
const lastSelected : string[] = [];
catAllEl.classList.add("selected");
browser.storage.local.get({lastSelected : []}).then(results=> {
  const lastSelected = results.lastSelected;
  browser.storage.sync.get({cats: []}).then(results => {
    for (const cat of results.cats) {
      const text = document.createElement("div");
      text.textContent = cat;
      if (lastSelected.includes(cat)) {
        catAllEl.classList.remove("selected");
        text.classList.add("selected");
      }
      catSelectEl.appendChild(text);
    }
  });
});
catSelectEl.addEventListener("click",createMultiSelect,true);
catSelectEl.addEventListener("click",() => {
  catAllEl.classList.remove("selected");
  const lastSelected : string[] = Array.from(catSelectEl.querySelectorAll(".selected"),(el)=>el.textContent??"");
  browser.storage.local.set({lastSelected: lastSelected});
  populateEntries();
});
catAllEl.addEventListener("click",()=> {
  catSelectEl.querySelectorAll(".selected").forEach((el)=>el.classList.remove("selected"));
  catAllEl.classList.add("selected");
  browser.storage.local.set({lastSelected: []});
  populateEntries();
});

// Body
populateEntries();
browser.storage.onChanged.addListener((changes, areaName) => {
	if ((changes.read || changes.entries) && areaName === "local") {
		populateEntries();
	}
});
