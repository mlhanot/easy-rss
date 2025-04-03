const link = document.getElementById("download") as HTMLAnchorElement;

const validXML10regex = /[^\u{0009}\u{000A}\u{000D}\u{0020}-\u{007E}\u{0085}\u{00A0}-\u{D7FF}\u{E000}-\u{FFFD}\u{10000}-\u{10FFFF}]/gu;
function escapeXml(input: string): string {
	return input
		.replace("&", "&amp;")
		.replace("\"", "&quot;")
		.replace("'", "&apos;")
		.replace("<", "&lt;")
		.replace(">", "&gt;")
    .replace(validXML10regex,"");
}

function genXMLFeedEntry(f: Feed) {
  return `<outline type="rss" text="${escapeXml(f.name)}" xmlUrl="${escapeXml(f.url)}">
      ${f.cats.map((cat) => `<outline type="cat" text="${escapeXml(cat)}" />`).join("\n      ")}
    </outline>`;
}

async function exportFeeds(): Promise<void> {
  const data = await browser.storage.sync.get({ feeds: [], cats: [] });
	const feeds: Feed[] = data.feeds;
  const cats: string[] = data.cats;

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>Easier-rss save</title>
  </head>
  <body>
    ${feeds.map(f => genXMLFeedEntry(f)).join("\n    ")}
    <outline type="catList" text="List of available categories">
      ${cats.map(cat => `<outline type="cat" text="${escapeXml(cat)}" />`).join("\n      ")}
    </outline>
  </body>
</opml>`;
	const blob = new Blob([xml], { type: "text/xml" });

	link.href = URL.createObjectURL(blob);
	link.click();
	URL.revokeObjectURL(link.href);
}

export { exportFeeds };
