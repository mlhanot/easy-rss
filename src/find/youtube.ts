function findYoutube(feeds: Feed[], reason: {str: string;}) {
  const matchId = /channel\/([A-Za-z0-9_-]+)/;
	if (window.location.pathname.match(/^\/@/) ||
    window.location.pathname.match(/^\/user\//) ||
    window.location.pathname.match(/^\/channel\//) ) {
		// Assume channel page
		console.log("Searching channel id from channel page");
		// Try to get info from meta on channel pages
		const title = document.querySelector("meta[property='og:title']")?.getAttribute("content");
		const url = document.querySelector("meta[property='og:url']")?.getAttribute("content") ?? "";
		const matched = matchId.exec(url);
		if (title !== null && title !== undefined && matched !== null) {
			feeds.push({
				name: title,
				url: "https://www.youtube.com/feeds/videos.xml?channel_id=" + matched[1]
			});
		}
  } else {
		// Assume watch page
		console.log("Searching channel id from watch page");
    // Try to get info from anchor
    const ytfeeds: NodeListOf<HTMLAnchorElement> = document.querySelectorAll(".ytp-ce-channel-title");
    for (const f of ytfeeds) {
      const matched = matchId.exec(f.href);
      if (matched === null) {
        continue;
      }
      feeds.push({
        name: f.text,
        url: "https://www.youtube.com/feeds/videos.xml?channel_id=" + matched[1]
      });
    }
    if (feeds.length == 0) {
      reason.str = "Please try again from the channel page";
    }
	}
}

export { findYoutube };
