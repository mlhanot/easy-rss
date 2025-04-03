import dialog from "./find.pug";
import "./find.scss";
import { addFeed } from "./addFeed";
import { findYoutube } from "./youtube";

const feedLinks: NodeListOf<HTMLLinkElement> = document.querySelectorAll(
	"link[type=\"application/rss+xml\"], link[type=\"application/atom+xml\"]"
);

const feeds: Feed[] = [];
const reason = {str : ""};
for (const f of feedLinks) {
	feeds.push({
		name: f.title,
		url: f.href,
    cats: []
	});
}

if (window.location.hostname.endsWith(".youtube.com")) {
  findYoutube(feeds,reason);
}

const html = dialog({
	css: browser.runtime.getURL("find/find.css"),
	feeds,
  reason
});

const div = document.createElement("div");
(div.style as { all: string }).all = "initial";
const shadow = div.attachShadow({ mode: "open" });
// This is safe because it goes through a template engine (pugjs) that makes sure everything is sanitized
shadow.innerHTML = html;
document.body.appendChild(div);

shadow.getElementById("exit")!.addEventListener("click", () => div.remove());
shadow.getElementById("add")!.addEventListener("click", async () => {
	for (const feed of shadow.querySelectorAll("#feeds div")) {
		const checked = feed.querySelector(".enabled") as HTMLInputElement;
		if (checked.checked) {
			const name = feed.querySelector(".name") as HTMLInputElement;
			const url = feed.querySelector(".url") as HTMLInputElement;
      addFeed({
				name: name.value,
				url: url.value,
        cats: []
			});
		}
	}

	div.remove();
});
