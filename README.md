# Valorant Tracker Scraper

This project is a web scraping tool designed to extract player data from the [Valorant Tracker](https://tracker.gg/valorant) website. It combines my hobby of playing Valorant with my interest in web scraping techniques using Puppeteer. The tool allows users to input a player's name, choose from a list of players, and retrieve their stats.

⚠️ **Note**: Web scraping may violate the terms and conditions of the website being scraped. I do not have access to, nor have I agreed to, any legal terms from Valorant Tracker. This project is for **educational purposes only**. If you choose to use or clone this project, do so at your **own risk**.

## Features

- Stealth scraping with Puppeteer to avoid detection.
- Randomized user-agent and viewport settings to simulate human browsing behavior.
- Option to search for another player or exit after each search.
- Extracts player statistics such as rank, matches, and performance.


## Installation

To start, ensure that Node.js and npm are installed on your machine.


1. Clone the repository:
   ```bash
   git clone https://github.com/WinnFreeza27/valorantrankfinder.git
   ```

2. Navigate to the project directory:
   ```bash
   cd valorant-tracker-scraper
   ```

3. Install the required dependencies:
   ```bash
   npm install
   ```

## Usage

1. Run the script:
   ```bash
   node index.js
   ```

2. Follow the on-screen instructions:
   - Enter the player’s name to search.
   - Select a player from the list of results.
   - Choose to either view the player’s stats, search for another player, or exit the program.

### Example

```
Welcome to the Valorant Tracker Scraper!
Puppeteer is starting up...
Enter player name: JohnDoe
Searching...
Found 3 players:
1. JohnDoe#1234
2. JohnDoe#5678
3. JohnDoe#9999
4. Search Another Player
0. Exit
Enter the number of your choice: 1
JohnDoe#1234 selected.
Retrieving player data...
{
username: "JohnDoe#1234",
stats: { Rating: Radiant 557RR, Level: 210 }
}
Do you want to search for another player? (Y/N): N
Scraping finished. Browser closed.
```

## How It Works

### Stealth Mode

The scraper uses the **Puppeteer Stealth Plugin** to bypass anti-bot detection. Many websites employ measures to block bots, and this plugin helps evade those checks by mimicking real user actions.

**Note**: You may want to set the `headless` option to `false` to see the browser in action. If the website blocks your access, try restarting the program. Please understand that this is for **educational purposes only**; I do not encourage using this tool to overload or attack any website.

```javascript
const browser = await puppeteer.launch({
    headless: false, // set to false to observe browser actions
    args: [
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--allow-running-insecure-content',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });
```

### Random User-Agent

To further avoid detection, the scraper assigns a random user-agent string, simulating different browsers and devices with each search.

### Player Search and Selection

- The user inputs a player’s name, and the scraper retrieves a list of matching players from Valorant Tracker.
- After selecting a player, the scraper fetches their statistics.
- Users can either search for another player or exit the program once the data is retrieved.

### Continuous Searching

After each search, the program gives users the option to search for another player or exit. The Puppeteer browser session stays open between searches to enable faster lookups.

## Legal Notice

This project is strictly for **educational purposes**. Web scraping may be against the terms of service of the websites involved. I do not support or encourage illegal or unethical scraping practices.

- I am not affiliated with Valorant Tracker or Riot Games.
- I have not agreed to any terms of service related to the Valorant Tracker website.
- Use this project at your **own risk**; I am not liable for any legal or ethical issues that may arise.

By using this project, you acknowledge that you understand the potential legal implications of web scraping and accept full responsibility for your actions.
