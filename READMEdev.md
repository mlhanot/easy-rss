# Project structure:

- background.ts defines the fecth() function
-- RSS feeds are fetched using an alarm.
-- The displayed number if recomputed whenever there is a change in the browser storage.
- The other files in the background directory implement the web parsing for the fetch operation.
- The find directory implement the logic and ui for the find feeds in page functionnality
- The popup directory implement the logic and ui for the main page (with the list of feeds)
- The manage directory implement the logic and ui for the option/manage feeds page