import "./find.scss";
import { dialog } from "./dialog";
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

const div = document.createElement("div");
(div.style as { all: string }).all = "initial";
const shadow = div.attachShadow({ mode: "open" });
shadow.appendChild(dialog(
  browser.runtime.getURL("find/find.css"),
  feeds,
  reason
));
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
