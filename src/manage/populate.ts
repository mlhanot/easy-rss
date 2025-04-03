const feedTemplate = document.getElementById("feed") as HTMLTemplateElement;
const catTemplate = document.getElementById("catItem") as HTMLTemplateElement;
const feedsEl = document.getElementById("feeds")!;

const addCatEl = document.getElementById("addFeedCat") as HTMLElement;
const addCatY = addCatEl.querySelector("button.YES") as HTMLElement;
const addCatN = addCatEl.querySelector("button.NO") as HTMLElement;
const addCatSelect = document.getElementById("addFeedCatSelect") as HTMLSelectElement;

async function populateFeeds(feeds: Feed[]): Promise<void> {
	while (feedsEl.lastChild) feedsEl.removeChild(feedsEl.lastChild);

	if (feeds.length === 0) {
		const text = document.createElement("div");
		text.className = "no_feeds";
		text.textContent = "You have no feeds. Go find some!";
		feedsEl.appendChild(text);
	}

	feeds.forEach((feed, i) => {
		const el = document.importNode(feedTemplate.content, true);

		const name = el.querySelector(".name") as HTMLInputElement;
		name.value = feed.name;
		name.addEventListener("change", () => {
			feeds[i].name = name.value;
			browser.storage.sync.set({ feeds: feeds as unknown as StorageValue });
		});

		const url = el.querySelector(".url") as HTMLInputElement;
		url.value = feed.url;
		url.addEventListener("change", () => {
			feeds[i].url = url.value;
			browser.storage.sync.set({ feeds: feeds as unknown as StorageValue });
		});

		el.querySelector(".delete")!.addEventListener("click", () => {
			feeds.splice(i, 1);
			browser.storage.sync.set({ feeds: feeds as unknown as StorageValue });
		});

    const catsCont = el.querySelector(".feedCat") as HTMLElement;
    feed.cats.forEach((cat,j) => {
      const elCat = document.importNode(catTemplate.content, true);
      const catName = elCat.querySelector("span") as HTMLElement;
      catName.textContent = cat;
      elCat.querySelector(".delete")!.addEventListener("click", () => {
        feeds[i].cats.splice(j,1);
			  browser.storage.sync.set({ feeds: feeds as unknown as StorageValue });
      });
      catsCont.appendChild(elCat);
    });

    // Manage add categories popup
    function clickYes() {
      const newcats = Array.from(addCatSelect.querySelectorAll(".selected"),(cat: Element)=>cat.textContent??"");
      if (newcats.length > 0) {
        feed.cats.push(...newcats); // Spread operator, transform the array into several arguments
			  browser.storage.sync.set({ feeds: feeds as unknown as StorageValue });
      }
      cleanupAddCat();
    }
    function clickNo() {
      cleanupAddCat();
    }
    function cleanupAddCat() {
      addCatEl.classList.add("disabled");
      addCatEl.querySelector("h2 > span")!.textContent = "";
      while(addCatSelect.lastChild) {
        addCatSelect.removeChild(addCatSelect.lastChild);
      }
      addCatY.removeEventListener("click",clickYes);
      addCatN.removeEventListener("click",clickNo);
    }
    el.querySelector(".add")!.addEventListener("click",async ()=>{
      addCatY.addEventListener("click",clickYes);
      addCatN.addEventListener("click",clickNo);
      const catList = (await browser.storage.sync.get("cats")).cats as string[];
      catList.forEach((cat)=> {
        if (!feed.cats.includes(cat)) {
          const opt = document.createElement("div");
          opt.textContent = cat;
          addCatSelect.appendChild(opt);
        }
      });
      addCatEl.querySelector("h2 > span")!.textContent = feed.name;
      addCatEl.classList.remove("disabled");
    });

		feedsEl.appendChild(el);
	});
}

export { populateFeeds };
