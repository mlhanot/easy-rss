import { addFeed } from "../find/addFeed";

const feedTemplate = document.getElementById("feed") as HTMLTemplateElement;
const feedEl = document.getElementById("newfeed")!;

async function addFeedUI(): Promise<void> {
  const el = document.importNode(feedTemplate.content, true);
  const fd = el.querySelector(".feed") as HTMLElement;
  fd.style.marginTop = "-6px";
  const name = el.querySelector(".name") as HTMLInputElement;
  const url = el.querySelector(".url") as HTMLInputElement;
  const check = el.querySelector(".delete") as HTMLImageElement;
  check.src = "../assets/check.svg";
  check.addEventListener("click", () => {
    addFeed({name: name.value, url: url.value});
    name.value = '';
    url.value = '';
    feedEl.style.display = 'none';
    document.getElementById("addFeed")!.style.pointerEvents = "auto";
  });
  feedEl.style.display = 'none';
  feedEl.appendChild(el);
}

export { addFeedUI };
