const catTemplate = document.getElementById("catItem") as HTMLTemplateElement;
const catListEl = document.getElementById("CatList")!;

async function populateCats(cats: string[]): Promise<void> {
	while (catListEl.lastChild) catListEl.removeChild(catListEl.lastChild);

	if (cats.length === 0) {
		const text = document.createElement("div");
		text.className = "no_feeds";
		text.textContent = "You have no cats. Go find some!";
		catListEl.appendChild(text);
	}

	cats.forEach((cat, i) => {
		const el = document.importNode(catTemplate.content, true);

		const name = el.querySelector("span") as HTMLElement;
		name.textContent = cat;
		el.querySelector(".delete")!.addEventListener("click", async () => {
      const feeds = (await browser.storage.sync.get("feeds")).feeds as unknown as Feed[];
      feeds.forEach((feed) => {
        feed.cats.forEach((feedCat,k) => {
          if (feedCat === cat) {
            feed.cats.splice(k,1);
          }
        });
      });
			cats.splice(i, 1);
			browser.storage.sync.set({ feeds: feeds as unknown as StorageValue, cats: cats as unknown as StorageValue });
		});

		catListEl.appendChild(el);
	});
}

export { populateCats };
