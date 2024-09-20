```markdown
# Valorant Tracker Scraper

This project is a web scraping tool designed to extract player data from the [Valorant Tracker](https://tracker.gg/valorant) website. The project combines my hobby of playing Valorant with my interest in studying web scraping techniques using Puppeteer. This tool allows users to input a player name, select from a list of found players, and retrieve their stats.

⚠️ **Note**: Web scraping may not be entirely legal, depending on the terms and conditions of the website being scraped. I do not have access to, nor have I agreed to, any legal terms from Valorant Tracker. This project is for **educational purposes only**. If you choose to clone or use this project, do so at your **own risk**.

## Features

- Stealth mode scraping using Puppeteer to bypass detection.
- Random user-agent and viewport setup to mimic human behavior.
- Option to search for another player or exit after each search.
- Extracts player statistics such as rank, matches, and performance.

## Installation

To get started with this project, you'll need Node.js and npm installed on your machine.

1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/valorant-tracker-scraper.git
   ```

2. Navigate to the project directory:
   ```bash
   cd valorant-tracker-scraper
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. Run the script:
   ```bash
   node index.js
   ```

2. Follow the on-screen prompts:
   - Enter the player's name to search.
   - Select the player from the list of found results.
   - Choose to either view the player's data, search for another player, or exit the program.

### Example

```
Welcome to the Valorant Tracker scraper!
Puppeteer is starting up...
Enter player name: JohnDoe
Searching...
Found 3 players
1. JohnDoe#1234
2. JohnDoe#5678
3. JohnDoe#9999
4. Search Another Player
0. Exit
Enter the number of your choice: 1
JohnDoe#1234 selected
Retrieving player data...
{
username: "JohnDoe#1234",
stat: { Rating: Radiant 557RR, Level: 210}
}
Do you want to search for another player? (Y/N): N
Scraping finished. Browser closed.
```

## How It Works

### Stealth Mode

This scraper uses the **Puppeteer Stealth Plugin** to avoid detection. Many websites have anti-bot measures, and the stealth plugin helps bypass these checks by mimicking real user behavior.

**Note**: You may want to set the headless to false, just to understand what actually the code doing, also sometimes the site block you from accessing their site, if this happened, please just restart the program, remember im not telling you to attack their website, please use this at your own risk.

```bash
const browser = await puppeteer.launch({
    headless: false, // here set to false
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

To further reduce the chances of detection, the scraper sets a random user-agent string, which simulates different browsers and devices.

### Player Search and Selection

- The scraper allows you to search for a player's name, and it will retrieve a list of players found on the Valorant Tracker website.
- After selecting a player, the scraper will fetch their statistics.
- You can either search for another player or exit the program after retrieving data.

### Continuous Searching

After completing one search, the program gives you the option to either search for another player or exit the program. The Puppeteer browser session remains open during this process, ensuring faster subsequent searches.

## Legal Notice

This project is purely for **educational purposes**. Web scraping may violate the terms of service of the website you are scraping. I do not encourage or endorse any illegal or unethical scraping activities. 

- I am not affiliated with Valorant Tracker or Riot Games.
- I do not have access to any agreements or terms of service related to the Valorant Tracker website.
- Use of this project is at your **own risk**, and I am not responsible for any consequences that may arise from its use.

By using this project, you acknowledge that you understand the potential legal implications of web scraping and assume full responsibility for your actions.

Make sure to replace the GitHub repository link under the `git clone` command with the actual link to your project, and if you're using an actual license like MIT, ensure to include that in your repository as well.
