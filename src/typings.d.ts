interface Feed {
	name: string;
	url: string;
  cats: string[];
}

interface Entry {
	id: string;
	title: string;
	link: string;
	date: string;
	icon: string;
	author: string;
  feedUrl: string;
	thumbnail?: string;
  duration?: string;
}

interface LengthDB {
  [key: string]: string;
}

type StorageValue = browser.storage.StorageValue;

interface StorageObject {
  [key: string]: any;
}
