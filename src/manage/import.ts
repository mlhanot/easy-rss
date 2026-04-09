import { getFeeds, setFeeds } from "../background/feedsInterface";

const input = document.getElementById("upload") as HTMLInputElement;

async function importFeeds(): Promise<void> {
	if (!(input.files && input.files[0])) return;
	const file = input.files[0];
	const reader = new FileReader();
	reader.onload = async () => {
		const src = reader.result as string;
		const parser = new DOMParser();
		const xml = parser.parseFromString(src, "application/xml");
		const feeds: Feed[] = [];
    if (xml.querySelector("head title")?.textContent === "Easier-rss save") {
      // Parser for this application opml generated files
      for (const node of xml.querySelectorAll("outline[type=\"rss\"]")) { 
        feeds.push({
          name: node.getAttribute("text")!,
          url: node.getAttribute("xmlUrl")!,
          cats: Array.from(node.querySelectorAll("outline[type=\"cat\"]"),(cat)=>cat.getAttribute("text")??"")
        });
      }
    } else {
      // Generic parser, compatible with legacy saves
      for (const node of xml.querySelectorAll("body outline[xmlUrl]")) { 
        feeds.push({
          name: node.getAttribute("title")??node.getAttribute("text")??"",
          url: node.getAttribute("xmlUrl")!,
          cats: []
        });
      }
    }

		const oldFeeds = await getFeeds();
		// Remove duplicates
		let i = oldFeeds.length;
		while (i--)
			if (feeds.some(f => f.url === oldFeeds[i].url)) oldFeeds.splice(i, 1);

    const catList = xml.querySelector("body outline[type=\"catList\"]");
    const cats: string[] = (catList)? Array.from(catList.querySelectorAll("outline[type=\"cat\"]"),
                                                (cat)=>cat.getAttribute("text")??"")
                                    : [];
    setFeeds(oldFeeds.concat(feeds));
		browser.storage.sync.set({ cats: cats as unknown as StorageValue });
		location.reload();
	};
	reader.readAsText(file);
}

export { importFeeds };
