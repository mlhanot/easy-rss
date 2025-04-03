# Project structure:

- background.ts defines the fecth() function
-- RSS feeds are fetched using an alarm.
-- The displayed number if recomputed whenever there is a change in the browser storage.
- The other files in the background directory implement the web parsing for the fetch operation.
- The find directory implement the logic and ui for the find feeds in page functionnality
- The popup directory implement the logic and ui for the main page (with the list of feeds)
- The manage directory implement the logic and ui for the option/manage feeds page

# Save data structure history:

The save data is an XML file. It does not store the entries (including the list of already viewed item).
Invalid XML characters are removed.
- v1.0 Store feeds url and name as attributes inside outline.
- v1.1 Updated OPML to version 2. Store feeds in outline of type rss, and their associated categories as child outline of type cat.
The list of categories is stored as child of the outline of type catList (assumed unique).
The save format is identified by its title in the head component (currently "Easier-rss save").
If the title do not match, a generic parser is used to import it.

## Compatibility:

The saved data is automatically converted from old versions. 
Legacy savefiles can be imported to the current version (keeping only the feeds name and urls).

# Notes: 

- When a category is removed, it is also removed from all feeds.
It is possible to desync the categories list and the categories on feeds, but this should be harmless. 
The categories list is the on used to short entries, any category presents on a feed but not on the list is ignored.
