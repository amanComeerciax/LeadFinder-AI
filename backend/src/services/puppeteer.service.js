import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

/**
 * Scrape Google Maps using Puppeteer
 * @param {string} keyword - Business type (e.g. "IT Services")
 * @param {string} location - Location (e.g. "Zundal, Gujarat")
 * @returns {Array} - List of business objects
 */
export const scrapeGoogleMaps = async (keyword, location) => {
    console.log(`🚀 [Puppeteer] Starting scrape for "${keyword}" in "${location}"`);

    // Launch browser
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    });

    try {
        const page = await browser.newPage();

        // Set viewport to look like a desktop
        await page.setViewport({ width: 1366, height: 768 });

        // Navigate to Google Maps
        const query = encodeURIComponent(`${keyword} in ${location}`);
        const url = `https://www.google.com/maps/search/${query}`;

        console.log(`🔗 [Puppeteer] Navigating to: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // Handle consent form
        try {
            const consentButton = await page.$('button[aria-label="Accept all"]');
            if (consentButton) {
                await consentButton.click();
                await page.waitForNavigation({ waitUntil: 'networkidle2' });
            }
        } catch (e) {
            // Ignore consent errors
        }

        // Wait for results
        try {
            await page.waitForSelector('div[role="feed"]', { timeout: 10000 });
        } catch (e) {
            console.log('⚠️ [Puppeteer] Could not find feed selector. Might be zero results.');
            const content = await page.content();
            if (content.includes("No results found")) {
                console.log('❌ [Puppeteer] Zero results found.');
                return [];
            }
        }

        console.log('📜 [Puppeteer] Scrolling through results...');
        await autoScroll(page);

        // Extract Data
        console.log('⛏️  [Puppeteer] Extracting data...');
        const businesses = await page.evaluate((keyword, location) => {
            const results = [];
            const items = document.querySelectorAll('div[role="article"]');

            items.forEach(item => {
                try {
                    const link = item.querySelector('a[href^="https://www.google.com/maps/place"]');
                    if (!link) return;

                    const url = link.href;

                    // Name
                    let name = link.getAttribute('aria-label');
                    if (!name) {
                        const header = item.querySelector('.fontHeadlineSmall');
                        if (header) name = header.innerText;
                    }
                    if (!name) {
                        const text = item.innerText.split('\n')[0];
                        if (text) name = text;
                    }

                    if (!name) return;

                    // Image
                    let photoUrl = null;
                    const img = item.querySelector('img[src*="googleusercontent.com"]');
                    if (img) photoUrl = img.src;

                    // Rating & Reviews
                    let rating = 0;
                    let totalReviews = 0;
                    const ratingSpan = item.querySelector('span[role="img"][aria-label*="stars"]');
                    if (ratingSpan) {
                        const ariaLabel = ratingSpan.getAttribute('aria-label');
                        const ratingMatch = ariaLabel.match(/([0-9.]+)\s+stars/);
                        const reviewMatch = ariaLabel.match(/([0-9,]+)\s+Reviews/i) || ariaLabel.match(/\(([\d,]+)\)/);

                        if (ratingMatch) rating = parseFloat(ratingMatch[1]);
                        if (reviewMatch) totalReviews = parseInt(reviewMatch[1].replace(/,/g, ''));
                    }

                    // Text Content for Phone extraction
                    const textContent = item.innerText;
                    const lines = textContent.split('\n');

                    let address = 'N/A';
                    let phone = 'N/A';
                    let website = 'N/A';
                    let category = keyword;

                    // Phone Regex
                    const phoneRegex = /(\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}/;
                    for (const line of lines) {
                        if (phoneRegex.test(line)) {
                            phone = line.match(phoneRegex)[0];
                            break;
                        }
                    }

                    // Website
                    const websiteLink = item.querySelector('a[aria-label*="Website"]');
                    if (websiteLink) website = websiteLink.href;
                    if (website && website.includes('google.com/url?q=')) {
                        const urlParams = new URLSearchParams(new URL(website).search);
                        website = urlParams.get('q');
                    }

                    // Place ID
                    let place_id = null;
                    const dataMatch = url.match(/!1s(0x[0-9a-f]+:0x[0-9a-f]+)/);
                    if (dataMatch) {
                        place_id = dataMatch[1];
                    } else {
                        place_id = name.replace(/\s+/g, '_').toLowerCase();
                    }

                    results.push({
                        name,
                        address: address !== 'N/A' ? address : location,
                        phone,
                        website,
                        rating,
                        totalReviews,
                        location,
                        keyword,
                        place_id,
                        googleMapsUrl: url,
                        photoUrl,
                        category,
                        source: 'puppeteer'
                    });

                } catch (err) {
                    // Skip bad items
                }
            });

            return results;
        }, keyword, location);

        console.log(`✅ [Puppeteer] Found ${businesses.length} businesses`);
        return businesses;

    } catch (error) {
        console.error('❌ [Puppeteer] Error:', error.message);
        throw error;
    } finally {
        await browser.close();
    }
};

async function autoScroll(page) {
    console.log('📜 [Puppeteer] Auto-scrolling to load results...');

    try {
        const feedSelector = 'div[role="feed"]';

        // Initial wait
        await page.waitForSelector(feedSelector, { timeout: 10000 });

        let previousHeight = await page.evaluate((selector) => {
            const element = document.querySelector(selector);
            return element ? element.scrollHeight : 0;
        }, feedSelector);

        let noChangeCount = 0;
        const MAX_NO_CHANGE = 3;

        while (true) {
            // Scroll down
            await page.evaluate((selector) => {
                const element = document.querySelector(selector);
                if (element) {
                    element.scrollTo(0, element.scrollHeight);
                }
            }, feedSelector);

            // Wait
            await new Promise(r => setTimeout(r, 2000));

            // Check
            const newHeight = await page.evaluate((selector) => {
                const element = document.querySelector(selector);
                return element ? element.scrollHeight : 0;
            }, feedSelector);

            if (newHeight === previousHeight) {
                noChangeCount++;
                console.log(`⏳ [Puppeteer] No new items loaded (${noChangeCount}/${MAX_NO_CHANGE})`);
                if (noChangeCount >= MAX_NO_CHANGE) {
                    break;
                }
            } else {
                noChangeCount = 0;
                previousHeight = newHeight;
                // Log progress
                const count = await page.evaluate(() => document.querySelectorAll('div[role="article"]').length);
                console.log(`📜 [Puppeteer] Loaded ~${count} items...`);
            }
        }
    } catch (e) {
        console.warn('⚠️ [Puppeteer] Auto-scroll partial error:', e.message);
    }
}
