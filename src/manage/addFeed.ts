import { addFeed } from "../find/addFeed";

const feedTemplate = document.getElementById("feed") as HTMLTemplateElement;
const catTemplate = document.getElementById("catItem") as HTMLTemplateElement;
const feedEl = document.getElementById("newfeed")!;

const addCatEl = document.getElementById("addFeedCat") as HTMLElement;
const addCatY = addCatEl.querySelector("button.YES") as HTMLElement;
const addCatN = addCatEl.querySelector("button.NO") as HTMLElement;
const addCatSelect = document.getElementById("addFeedCatSelect") as HTMLSelectElement;

async function addFeedUI(): Promise<void> {
  const el = document.importNode(feedTemplate.content, true);
  const fd = el.querySelector(".feed") as HTMLElement;
  fd.style.marginTop = "-6px";
  const name = el.querySelector(".name") as HTMLInputElement;
  const url = el.querySelector(".url") as HTMLInputElement;
  const catList = el.querySelector(".feedCat") as HTMLElement;
  const check = el.querySelector(".delete") as HTMLImageElement;
  check.src = "../assets/check.svg";
  check.style.width = "100%";
  function getCatsArray() {
    return Array.from(catList.getElementsByClassName("cloud_item"),(catItem) =>
                      catItem.getElementsByTagName("span")[0].textContent??"");
  }
  check.addEventListener("click", () => {
    addFeed({name: name.value, url: url.value, 
            cats: getCatsArray()});
    name.value = '';
    url.value = '';
    while (catList.lastChild) {
      catList.removeChild(catList.lastChild);
    }
    feedEl.style.display = 'none';
    document.getElementById("addFeed")!.style.pointerEvents = "auto";
  });
  // Manage add categories popup
  const catsCont = el.querySelector(".feedCat") as HTMLElement;
  function clickYes() {
    const newcats = Array.from(addCatSelect.querySelectorAll(".selected"),(cat: Element)=>cat.textContent??"");
    newcats.forEach((cat) => { // Create elements in the html page instead of using storage
      const elCat = document.importNode(catTemplate.content,true);
      const elCatContent = elCat.firstElementChild as HTMLElement;
      const catName = elCat.querySelector("span") as HTMLElement;
      catName.textContent = cat;
      elCat.querySelector(".delete")!.addEventListener("click", () => {
        elCatContent.remove();
      });
      catsCont.appendChild(elCat);
    });
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
    const selectedCats = getCatsArray();
    catList.forEach((cat)=> {
      if (!selectedCats.includes(cat)) {
        const opt = document.createElement("div");
        opt.textContent = cat;
        addCatSelect.appendChild(opt);
      }
    });
    addCatEl.querySelector("h2 > span")!.textContent = name.value;
    addCatEl.classList.remove("disabled");
  });

  // Hide the element and add it to the page
  feedEl.style.display = 'none';
  feedEl.appendChild(el);
}

export { addFeedUI };
