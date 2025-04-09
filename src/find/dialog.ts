function dialog(css: string, feeds: Feed[], reason: {str: string}) {
  const div = document.createElement("div");
  div.id = "dialog";
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = css;
  div.appendChild(link);
  if (feeds.length === 0) {
    const h2 = document.createElement("h2");
    h2.textContent = "Sorry, no feeds were found";
    div.appendChild(h2);
    if (reason.str.length > 0) {
      const p = document.createElement("p");
      p.textContent = reason.str;
      div.appendChild(p);
    }
    const exit = document.createElement("button");
    exit.id = "exit";
    exit.textContent = "Ok";
    div.appendChild(exit);
  } else {
    const h2 = document.createElement("h2");
    h2.textContent = "Add the following feeds?";
    div.appendChild(h2);
    const feedsEl = document.createElement("div");
    feedsEl.id = "feeds";
    feeds.forEach((feed)=> {
      const feedDiv = document.createElement("div");
      const checkbox = document.createElement("input");
      const text = document.createElement("input");
      const url = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.classList.add("enabled");
      text.type = "text";
      text.value = feed.name;
      text.classList.add("name");
      url.type = "hidden";
      url.classList.add("url");
      url.value = feed.url;
      feedDiv.appendChild(checkbox);
      feedDiv.appendChild(text);
      feedDiv.appendChild(url);
      feedsEl.appendChild(feedDiv);
    });
    div.appendChild(feedsEl);
    const buttons = document.createElement("div");
    buttons.id = "buttons";
    const add = document.createElement("button");
    const exit = document.createElement("button");
    add.id = "add";
    add.textContent = "Yes";
    exit.id = "exit";
    exit.textContent = "No";
    buttons.appendChild(add);
    buttons.appendChild(exit);
    div.appendChild(buttons);
  }
  return div;
}

export { dialog };
