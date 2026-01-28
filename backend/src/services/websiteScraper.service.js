import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

let globalBrowser = null;

const getBrowser = async () => {
    if (!globalBrowser || !globalBrowser.isConnected()) {
        try {
            globalBrowser = await puppeteer.launch({
                headless: 'new',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--single-process',
                    '--disable-gpu'
                ]
            });
        } catch (error) {
            console.error('Failed to launch browser:', error);
            throw error;
        }
    }
    return globalBrowser;
};

const closeBrowser = async () => {
    if (globalBrowser) {
        await globalBrowser.close();
        globalBrowser = null;
    }
};

const extractContacts = async (url) => {
    if (!url || url === 'N/A') return { email: null, socialLinks: {} };

    // Regex to validate email
    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    let page = null;
    try {
        // Ensure protocol
        if (!url.startsWith('http')) {
            url = 'http://' + url;
        }

        const browser = await getBrowser();
        page = await browser.newPage();

        // Block resources to speed up loading
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36');

        // Timeout 15s to avoid hanging
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

        // Wait a bit for JS to render contacts
        // await page.waitForTimeout(1000); // waitForTimeout is deprecated
        await new Promise(r => setTimeout(r, 1000));

        const content = await page.content();
        const $ = cheerio.load(content);
        const text = $('body').text();

        const contacts = {
            email: null,
            socialLinks: {
                facebook: null,
                twitter: null,
                linkedin: null,
                instagram: null,
                youtube: null
            }
        };

        const foundEmails = new Set();

        // Helper function to extract contacts from HTML/Text
        const extractFromPage = ($, text) => {
            // 1. Find mailto links
            $('a[href^="mailto:"]').each((i, el) => {
                const href = $(el).attr('href');
                if (href) {
                    const email = href.replace('mailto:', '').split('?')[0];
                    if (validateEmail(email)) foundEmails.add(email.toLowerCase());
                }
            });

            // 2. Regex search in body text
            const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})|([a-zA-Z0-9._-]+\s*\[at\]\s*[a-zA-Z0-9.-]+\s*\[dot\]\s*[a-zA-Z]{2,6})|([a-zA-Z0-9._-]+\s*@\s*[a-zA-Z0-9.-]+\s*\.\s*[a-zA-Z]{2,6})/gi;

            const matches = text.match(emailRegex);
            if (matches && matches.length > 0) {
                matches.forEach(match => {
                    let cleanEmail = match
                        .replace(/\s*\[at\]\s*/i, '@')
                        .replace(/\s*\[dot\]\s*/i, '.')
                        .replace(/\s*@\s*/, '@')
                        .replace(/\s*\.\s*/, '.')
                        .toLowerCase();

                    if (!cleanEmail.includes('example.com') &&
                        !cleanEmail.match(/\.(png|jpg|jpeg|gif|webp|svg|css|js|wixpress)$/i)) {
                        if (validateEmail(cleanEmail)) {
                            foundEmails.add(cleanEmail);
                        }
                    }
                });
            }

            // 3. Social Media Links
            $('a').each((i, el) => {
                const href = $(el).attr('href');
                if (!href) return;

                if (href.includes('facebook.com') && !contacts.socialLinks.facebook) contacts.socialLinks.facebook = href;
                if ((href.includes('twitter.com') || href.includes('x.com')) && !contacts.socialLinks.twitter) contacts.socialLinks.twitter = href;
                if (href.includes('linkedin.com') && !contacts.socialLinks.linkedin) contacts.socialLinks.linkedin = href;
                if (href.includes('instagram.com') && !contacts.socialLinks.instagram) contacts.socialLinks.instagram = href;
                if (href.includes('youtube.com') && !contacts.socialLinks.youtube) contacts.socialLinks.youtube = href;
            });
        };

        // Extract from Homepage
        extractFromPage($, text);

        // If email not found, try crawling contact/about pages using Smart Link Discovery
        if (!contacts.email) {
            const internalLinks = [];
            const keywords = ['contact', 'about', 'support', 'reach', 'connect', 'help'];

            $('a[href]').each((i, el) => {
                const href = $(el).attr('href');
                const text = $(el).text().toLowerCase();

                if (href && (href.startsWith('/') || href.includes(url))) {
                    // Check if keyword exists in URL or Anchor Text
                    if (keywords.some(k => href.toLowerCase().includes(k) || text.includes(k))) {
                        let fullUrl = href.startsWith('http') ? href : (url.endsWith('/') ? url + href.substring(1) : url + href);

                        // Handle relative paths starting with /
                        if (href.startsWith('/')) {
                            try {
                                const baseUrl = new URL(url).origin;
                                fullUrl = baseUrl + href;
                            } catch (e) {
                                fullUrl = url + href; // Fallback
                            }
                        }
                        internalLinks.push(fullUrl);
                    }
                }
            });

            // Remove duplicates and prioritize 'contact' pages
            const uniqueLinks = [...new Set(internalLinks)];

            // Sort links: put 'contact' links first
            uniqueLinks.sort((a, b) => {
                if (a.toLowerCase().includes('contact')) return -1;
                if (b.toLowerCase().includes('contact')) return 1;
                return 0;
            });

            // Limit to first 3 distinct pages
            const pagesToVisit = uniqueLinks.slice(0, 3);

            for (const pageUrl of pagesToVisit) {
                let subPage = null;
                try {
                    // console.log(`Smart Crawling: ${pageUrl}`);
                    const browser = await getBrowser();
                    subPage = await browser.newPage();

                    // Block heavy resources
                    await subPage.setRequestInterception(true);
                    subPage.on('request', (req) => {
                        if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
                            req.abort();
                        } else {
                            req.continue();
                        }
                    });

                    // Short timeout for subpages
                    await subPage.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });

                    const subContent = await subPage.content();
                    const $sub = cheerio.load(subContent);
                    const subText = $sub('body').text();

                    extractFromPage($sub, subText);
                } catch (err) {
                    continue;
                } finally {
                    if (subPage) await subPage.close();
                }
            }


        }

        if (foundEmails.size > 0) {
            contacts.email = Array.from(foundEmails).join(', ');
        }



        return contacts;

    } catch (error) {
        // console.error(`Failed to scrape ${url}: ${error.message}`);
        return { email: null, socialLinks: {} };
    }
};

const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};

export { extractContacts };
