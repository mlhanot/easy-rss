interface Option {
  selector: string;
  attribute?: string;
}

type Key = "id" | "title" | "link" | "date" | "icon" | "author";

const attributes: { [x: string]: Option[] } = {
	author: [{ selector: "author name" }, { selector: "author" }],
	date: [
		{ selector: "published" },
		{ selector: "updated" },
		{ selector: "pubDate" }
	],
	id: [{ selector: "id" }, { selector: "guid" }],
	link: [{ selector: "link", attribute: "href" }, { selector: "link" }],
	title: [{ selector: "title" }]
};

function parse(el: Element, feed: Feed) {
	const entry: Entry = {
		id: "",
		title: "",
		link: "",
		date: "",
		icon: "",
		author: "",
    feedUrl: "",
	};

	for (const attribute in attributes) {
		const options = attributes[attribute];
		for (const option of options) {
			if (entry[attribute as Key]) continue;
			const element = el.querySelector(option.selector);
			if (element) {
				if (option.attribute)
					entry[attribute as Key] = element.getAttribute(option.attribute)??"";
				else entry[attribute as Key] = element.textContent??"";
			}
		}
	}

  // Mark origin
  entry.feedUrl= feed.url;
	// Get icon
	const domain = (new URL(feed.url)).origin;
	entry.icon = domain + "/favicon.ico";

	// Get thumbnail
	const thumbnail = el.getElementsByTagName("media:thumbnail")[0];
	if (thumbnail) entry.thumbnail = thumbnail.getAttribute("url")??"";

	return entry as Entry;
}

const parser = new DOMParser();

async function fetchEntries(feed: Feed): Promise<Entry[]> {
	const entries: Entry[] = [];
	const src = await (fetch(feed.url).then(
    (value) => {
    if (value.ok) {
      return value.text();
    } else {
      console.warn("Failed to retrieve rss feed from ",feed.url);
      console.warn("Got ",value.status);
      return "";
    }},
    (reason) => {
      console.warn("Failed to retrieve rss feed from ",feed.url);
      console.warn(reason); 
      return "";
    }));
  if (src.length == 0) return entries;
	const xml = parser.parseFromString(src, "application/xml");
	for (const el of xml.querySelectorAll("entry, item"))
		entries.push(parse(el, feed));
	return entries;
}

export { fetchEntries };
