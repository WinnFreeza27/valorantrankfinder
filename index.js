import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import randomUserAgent from 'random-useragent';
import readline from 'readline';

// Add stealth plugin to hide Puppeteer usage
puppeteer.use(StealthPlugin());

const getInput = async (prompt) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

const waitForTimeout = (time) => {
  return new Promise(function(resolve) { 
      setTimeout(resolve, time);
  });
}

const getUserSelection = async (options) => {
  console.log('Please select a player or enter 0 to exit:');
  
  // Display the options plus the exit option at 0
  console.log(`0. Exit`);
  options.forEach((item, index) => {
    console.log(`${index + 1}. ${item}`);
  });

  const answer = await getInput('Enter the number of your choice: ');
  const selectedIndex = parseInt(answer) - 1;

  if (answer === '0') {
    return null; // Indicate that the user chose to exit
  }

  if (selectedIndex >= 0 && selectedIndex < options.length) {
    return options[selectedIndex]; // Return the selected option
  } else {
    throw new Error('Invalid selection'); // Throw error if input is invalid
  }
};

const scrapePlayerData = async (page) => {
  const name = await getInput('Enter player name: ');
  console.log('Searching...');

  // Clear the search box and type the player's name
  await page.evaluate(() => {
    document.querySelector('.search-box .search-box__bar form input').value = '';
  });
  await page.type('.search-box .search-box__bar form input', name, { delay: 100 });

  await waitForTimeout(2000);
  await page.waitForSelector('.search-box .search-box__bar form .history .results .result-set .result-set__results .info .player-handle .trn-ign__discriminator');

  const elementsNameFound = await page.evaluate(() => {
    const elements = document.querySelectorAll('.info .player-handle');
    return Array.from(elements).map(element => {
      const ign = element.querySelector('.trn-ign__username').textContent;
      if (element.querySelector('.trn-ign__discriminator') === null) return false;
      const tag = element.querySelector('.trn-ign__discriminator').textContent;
      return `${ign}${tag}`;
    }).filter(element => element !== false);
  });

  //add the search again option
  elementsNameFound.push('Search Another Player');

  if (elementsNameFound.length === 0) {
    console.log('No players found.');
    return false; // Return false if no players found
  }
  
  console.log(`Found ${elementsNameFound.length} players`);
  const select = await getUserSelection(elementsNameFound);

  if (select === 'exit') {
    console.log('Exiting player selection.');
    return null; // Exit the loop
  }

  if (select === 'Search Another Player') {
    console.log('Searching for another player...');
    return 'Search Another Player'; // Trigger a new search
  }

  console.log(`${select} selected`);

  // Search again for the selected player
  await page.evaluate(() => {
    document.querySelector('.search-box .search-box__bar form input').value = '';
  });
  await page.type('.search-box .search-box__bar form input', select, { delay: 100 });

  await waitForTimeout(2000);
  await page.waitForSelector('.player-row .info .player-handle .trn-ign__discriminator');
  await page.click('.player-row .info .player-handle .trn-ign__discriminator');
  console.log('Loading player data...');
  await waitForTimeout(5000);

  const isPrivate = await page.$eval('.vppn .text-40', (elem) => {
    return !!(elem && window.getComputedStyle(elem).display !== 'none' && elem.offsetHeight && elem.offsetWidth);
  }).catch(() => false);

  if (isPrivate) {
    console.log('THIS PLAYER IS PRIVATE');
  }

  await page.waitForSelector('.multi-switch__item');
  await page.click('.multi-switch__item');

  await waitForTimeout(1500);

  const isNotRanked = await page.$eval('.status-indicator--message .lead', (elem) => {
    return !!(elem && window.getComputedStyle(elem).display !== 'none' && elem.offsetHeight && elem.offsetWidth);
  }).catch(() => false);

  if (isNotRanked) {
    console.log('THIS PLAYER NEVER PLAYED ANY RANKED MATCH THIS SEASON');
  } else {
    await page.waitForSelector('.trn-profile-highlighted-content__stats .stat');
    const stat = await page.evaluate(() => {
      const elements = document.querySelectorAll('.trn-profile-highlighted-content__stats .stat');
      
      return Array.from(elements).reduce((acc, element) => {
        const name = element.querySelector('.stat__label').textContent.trim();
        const value = element.querySelector('.stat__value').textContent.trim();
        
        if (name === "Radiant") {
          acc["Rating"] = `Radiant ${value}`;
        } else {
          acc[name] = value;
        }
        return acc;
      }, {});
    });

    const ign = await page.waitForSelector('.no-card-margin .trn-ign__username');
    const tag = await page.waitForSelector('.no-card-margin .trn-ign__discriminator');
    const tagText = await tag.evaluate(el => el.textContent.trim());
    const ignText = await ign.evaluate(el => el.textContent.trim());

    console.log({
      username: ignText + tagText,
      stat
    });
  }

  return true; // Return true if the search was successful
};

const scrape = async () => {
  console.log('Welcome to the Valorant Tracker scraper!');
  console.log('Puppeteer is starting up...');

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--allow-running-insecure-content',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  const page = await browser.newPage();
  const userAgent = randomUserAgent.getRandom();
  await page.setUserAgent(userAgent);

  await page.setViewport({
    width: Math.floor(Math.random() * (1920 - 800 + 1)) + 1080,
    height: Math.floor(Math.random() * (1080 - 600 + 1)) + 600,
    deviceScaleFactor: 1,
  });

  await page.goto("https://tracker.gg/valorant");

  let keepSearching = true;
  while (keepSearching) {
    const result = await scrapePlayerData(page);

    if (result === null) {
      break; // Exit the program if user selects to exit
    }

    if (result === 'Search Another Player') {
      continue; // Go back to starting the player search
    }

    // Navigate back to the starting URL
    await page.goto("https://tracker.gg/valorant", { waitUntil: "networkidle2" });

    // Ask if they want to search for another player
    const continueSearch = await getInput('Do you want to search for another player? (Y/N): ');

    if (continueSearch.toLowerCase() !== 'Y' && continueSearch.toLowerCase() !== 'y') {
      keepSearching = false;
    }
  }

  await browser.close();
  console.log('Scraping finished. Browser closed.');
};

// Run the scrape function
scrape();
