import puppeteer from 'puppeteer-extra'; // Import Puppeteer with extra features
import StealthPlugin from 'puppeteer-extra-plugin-stealth'; // Import stealth plugin to avoid detection
import randomUserAgent from 'random-useragent'; // Import random user agent generator
import readline from 'readline'; // Import readline to get user input from the console

// Add stealth plugin to hide Puppeteer usage
puppeteer.use(StealthPlugin());

// Function to get input from the user with a prompt
const getInput = async (prompt) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer); // Resolve the promise with the user's input
    });
  });
}

// Function to create a delay (timeout) in milliseconds
const waitForTimeout = (time) => {
  return new Promise(function(resolve) { 
      setTimeout(resolve, time); // Resolve the promise after the specified time
  });
}

// Function to display player options and get user selection
const getUserSelection = async (options) => {
  console.log('Please select a player or enter 0 to exit:');
  
  // Display the options plus the exit option at 0
  console.log(`0. Exit`);
  options.forEach((item, index) => {
    console.log(`${index + 1}. ${item}`); // List all available player options
  });

  const answer = await getInput('Enter the number of your choice: '); // Get user's choice
  const selectedIndex = parseInt(answer) - 1; // Convert input to index

  if (answer === '0') {
    return null; // Indicate that the user chose to exit
  }

  if (selectedIndex >= 0 && selectedIndex < options.length) {
    return options[selectedIndex]; // Return the selected option
  } else {
    throw new Error('Invalid selection'); // Throw error if input is invalid
  }
};

// Function to scrape player data
const scrapePlayerData = async (page) => {
  const name = await getInput('Enter player name: '); // Get player name from user input
  console.log('Searching...');

  // Clear the search box and type the player's name
  await page.evaluate(() => {
    document.querySelector('.search-box .search-box__bar form input').value = ''; // Clear input field
  });
  await page.type('.search-box .search-box__bar form input', name, { delay: 100 }); // Type player's name

  await waitForTimeout(2000); // Wait for results to load
  await page.waitForSelector('.search-box .search-box__bar form .history .results .result-set .result-set__results .info .player-handle .trn-ign__discriminator'); // Wait for player results to appear

  // Extract player names found in the search results
  const elementsNameFound = await page.evaluate(() => {
    const elements = document.querySelectorAll('.info .player-handle'); // Select player handle elements
    return Array.from(elements).map(element => {
      const ign = element.querySelector('.trn-ign__username').textContent; // Get in-game name
      if (element.querySelector('.trn-ign__discriminator') === null) return false; // Check for discriminator
      const tag = element.querySelector('.trn-ign__discriminator').textContent; // Get discriminator
      return `${ign}${tag}`; // Combine IGN and tag
    }).filter(element => element !== false); // Filter out invalid results
  });

  // Add an option to search again
  elementsNameFound.push('Search Another Player');

  if (elementsNameFound.length === 0) {
    console.log('No players found.'); // Notify if no players found
    return false; // Return false if no players found
  }
  
  console.log(`Found ${elementsNameFound.length} players`); // Log the number of players found
  const select = await getUserSelection(elementsNameFound); // Get user's selection from found players

  if (select === 'exit') {
    console.log('Exiting player selection.'); // Log exit selection
    return null; // Exit the loop
  }

  if (select === 'Search Another Player') {
    console.log('Searching for another player...'); // Log search again action
    return 'Search Another Player'; // Trigger a new search
  }

  console.log(`${select} selected`); // Log the selected player

  // Clear the search box and type the selected player's name
  await page.evaluate(() => {
    document.querySelector('.search-box .search-box__bar form input').value = ''; // Clear input field
  });
  await page.type('.search-box .search-box__bar form input', select, { delay: 100 }); // Type selected player's name

  await waitForTimeout(2000); // Wait for results to load
  await page.waitForSelector('.player-row .info .player-handle .trn-ign__discriminator'); // Wait for player row to be present
  await page.click('.player-row .info .player-handle .trn-ign__discriminator'); // Click on the selected player
  console.log('Loading player data...'); // Log loading message
  await waitForTimeout(5000); // Wait for player data to load

  // Check if player profile is private
  const isPrivate = await page.$eval('.vppn .text-40', (elem) => {
    return !!(elem && window.getComputedStyle(elem).display !== 'none' && elem.offsetHeight && elem.offsetWidth); // Check for visibility
  }).catch(() => false); // Catch any errors and return false if the element is not found

  if (isPrivate) {
    console.log('THIS PLAYER IS PRIVATE'); // Log if player is private
  }

  await page.waitForSelector('.multi-switch__item'); // Wait for profile switch items
  await page.click('.multi-switch__item'); // Click to switch profiles

  await waitForTimeout(1500); // Wait for the switch to take effect

  // Check if the player has never played ranked matches this season
  const isNotRanked = await page.$eval('.status-indicator--message .lead', (elem) => {
    return !!(elem && window.getComputedStyle(elem).display !== 'none' && elem.offsetHeight && elem.offsetWidth); // Check for visibility
  }).catch(() => false); // Catch any errors and return false if the element is not found

  if (isNotRanked) {
    console.log('THIS PLAYER NEVER PLAYED ANY RANKED MATCH THIS SEASON'); // Log if player has no ranked matches
  } else {
    // Extract player stats if the player has ranked matches
    await page.waitForSelector('.trn-profile-highlighted-content__stats .stat'); // Wait for stats to load
    const stat = await page.evaluate(() => {
      const elements = document.querySelectorAll('.trn-profile-highlighted-content__stats .stat'); // Select stat elements
      
      // Create an object with stats using reduce
      return Array.from(elements).reduce((acc, element) => {
        const name = element.querySelector('.stat__label').textContent.trim(); // Get stat name
        const value = element.querySelector('.stat__value').textContent.trim(); // Get stat value
        
        // Handle special case for "Radiant"
        if (name === "Radiant") {
          acc["Rating"] = `Radiant ${value}`; // Set "Rating" for Radiant
        } else {
          acc[name] = value; // Add other stats to the object
        }
        return acc; // Return the accumulated object
      }, {}); // Initialize as an empty object
    });

    // Extract player IGN and tag
    const ign = await page.waitForSelector('.no-card-margin .trn-ign__username');
    const tag = await page.waitForSelector('.no-card-margin .trn-ign__discriminator');
    const tagText = await tag.evaluate(el => el.textContent.trim()); // Get tag text
    const ignText = await ign.evaluate(el => el.textContent.trim()); // Get IGN text

    // Log the player's username and stats
    console.log({
      username: ignText + tagText, // Combine IGN and tag
      stat // Log stats object
    });
  }

  return true; // Return true if the search was successful
};

// Main scraping function
const scrape = async () => {
  console.log('Welcome to the Valorant Tracker scraper!'); // Welcome message
  console.log('Puppeteer is starting up...'); // Log Puppeteer startup

  // Launch a new browser instance
  const browser = await puppeteer.launch({
    headless: true, // Run in headless mode
    args: [
      '--disable-web-security', // Disable web security features
      '--disable-features=IsolateOrigins,site-per-process', // Disable isolation features
      '--allow-running-insecure-content', // Allow insecure content
      '--no-sandbox', // Disable sandbox for Chrome
      '--disable-setuid-sandbox' // Disable setuid sandbox
    ]
  });

  const page = await browser.newPage(); // Open a new page
  const userAgent = randomUserAgent.getRandom(); // Generate a random user agent
  await page.setUserAgent(userAgent); // Set the user agent for the page

  // Set a random viewport size
  await page.setViewport({
    width: Math.floor(Math.random() * (1920 - 800 + 1)) + 1080,
    height: Math.floor(Math.random() * (1080 - 600 + 1)) + 600,
    deviceScaleFactor: 1,
  });

  await page.goto("https://tracker.gg/valorant"); // Navigate to the Valorant Tracker site

  let keepSearching = true; // Flag to control the search loop
  while (keepSearching) {
    const result = await scrapePlayerData(page); // Scrape player data

    if (result === null) {
      break; // Exit the program if user selects to exit
    }

    if (result === 'Search Another Player') {
      continue; // Go back to starting the player search
    }

    // Navigate back to the starting URL
    await page.goto("https://tracker.gg/valorant", { waitUntil: "networkidle2" }); // Wait for page to load fully

    // Ask if the user wants to search for another player
    const continueSearch = await getInput('Do you want to search for another player? (Y/N): ');

    if (continueSearch.toLowerCase() !== 'Y' && continueSearch.toLowerCase() !== 'y') {
      keepSearching = false; // Exit the loop if the user doesn't want to continue
    }
  }

  await browser.close(); // Close the browser when done
  console.log('Scraping finished. Browser closed.'); // Log completion message
};

// Run the scrape function
scrape(); // Start the scraping process
