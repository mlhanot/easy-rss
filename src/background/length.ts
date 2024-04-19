const parser = new DOMParser();

async function fetchLength(entry: Entry, lengthDB: LengthDB) {
  const id = entry.id;
  if (id in lengthDB) {
    entry.duration = lengthDB[id];
  } else {
    entry.duration = "";
    if ((new URL(entry.link)).hostname.endsWith(".youtube.com")) {
      const lengthFormat = /PT([0-9]+)M([0-9]+)S/;
      const src = await (fetch(entry.link).then(
        (value) => {return value.text();},
        (reason) => {console.warn(reason); return "";}));
      if (src.length == 0) return;
      const html = parser.parseFromString(src, "text/html");
      const rawLength = html.querySelector("meta[itemprop=duration")?.getAttribute("content") ?? "";
      const matched = lengthFormat.exec(rawLength);
      if (matched === null) {
        console.log("Wrong format for video length: expected "+lengthFormat+" got: "+rawLength);
      } else {
        const h = Math.floor(Number(matched[1])/60);
        const m = Number(matched[1]) % 60;
        const s = (Number(matched[2]) > 9)? matched[2] : "0"+matched[2];
        let formatedLength = "";
        if (h > 0) {
          formatedLength = (m > 9)? h+":"+m+":"+s : h+":0"+m+":"+s;
        } else {
          formatedLength = m+":"+s;
        }
        entry.duration = formatedLength;
      }
    }
  }
}

export { fetchLength };
