import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

// ============================================================================
// GLOBAL BROWSER MANAGEMENT
// ============================================================================
let globalBrowser = null;
let activePagesCount = 0;
const MAX_CONCURRENT_PAGES = 10;

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
                    '--disable-gpu',
                    '--disable-software-rasterizer',
                    '--disable-extensions'
                ],
                defaultViewport: { width: 1280, height: 720 }
            });

            globalBrowser.on('disconnected', () => {
                console.warn('Browser disconnected, will reconnect on next request');
                globalBrowser = null;
                activePagesCount = 0;
            });

        } catch (error) {
            console.error('Failed to launch browser:', error);
            throw error;
        }
    }
    return globalBrowser;
};

/**
 * Managed page wrapper to handle cleanup and concurrency
 */
const withPage = async (fn, timeout = 45000) => {
    // Wait if too many pages are active
    let waitCount = 0;
    while (activePagesCount >= MAX_CONCURRENT_PAGES && waitCount < 100) {
        await new Promise(resolve => setTimeout(resolve, 200));
        waitCount++;
    }

    let page = null;
    try {
        activePagesCount++;
        const browser = await getBrowser();
        page = await browser.newPage();

        page.setDefaultTimeout(timeout);
        page.setDefaultNavigationTimeout(timeout);

        // Block heavy resources
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const type = req.resourceType();
            if (['image', 'stylesheet', 'font', 'media', 'websocket'].includes(type)) {
                req.abort();
            } else {
                req.continue();
            }
        });

        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        return await fn(page);

    } catch (error) {
        throw error;
    } finally {
        if (page) {
            try {
                await page.close();
            } catch (e) { }
        }
        activePagesCount--;
    }
};

// ============================================================================
// UTILITIES
// ============================================================================
const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
};

const BLACKLIST_EMAILS = ['example.com', 'wixpress.com', 'sentry.io', 'domain.com'];
const BLACKLIST_EXTENSIONS = /\.(png|jpg|jpeg|gif|webp|svg|css|js|woff|woff2|ttf|mp4|webm)$/i;

const cleanAndValidateEmail = (email) => {
    if (!email) return null;
    const clean = email.toLowerCase().trim();
    if (BLACKLIST_EMAILS.some(b => clean.includes(b))) return null;
    if (clean.match(BLACKLIST_EXTENSIONS)) return null;
    return validateEmail(clean) ? clean : null;
};

// ============================================================================
// EXTRACTION LOGIC
// ============================================================================

/**
 * Decode obfuscated emails like [at], (at), &#64;, etc.
 */
const decodeObfuscatedEmail = (text) => {
    if (!text) return text;
    return text
        .replace(/\s*\[at\]\s*/gi, '@')
        .replace(/\s*\(at\)\s*/gi, '@')
        .replace(/\s*\{at\}\s*/gi, '@')
        .replace(/\s*\[dot\]\s*/gi, '.')
        .replace(/\s*\(dot\)\s*/gi, '.')
        .replace(/\s*\{dot\}\s*/gi, '.')
        .replace(/&#64;/gi, '@')
        .replace(/&#46;/gi, '.')
        .replace(/\s*@\s*/g, '@')
        .replace(/\s*\.\s*/g, '.')
        .replace(/ at /gi, '@')
        .replace(/ dot /gi, '.')
        .trim();
};

const extractFromHtml = (html, baseUrl) => {
    const $ = cheerio.load(html);
    const emails = new Set();
    const socialLinks = {
        facebook: null,
        twitter: null,
        linkedin: null,
        instagram: null,
        youtube: null
    };

    // Helper to add valid email
    const addEmail = (rawEmail) => {
        const decoded = decodeObfuscatedEmail(rawEmail);
        const valid = cleanAndValidateEmail(decoded);
        if (valid) emails.add(valid);
    };

    // 1. Mailto links (highest priority)
    $('a[href^="mailto:"]').each((_, el) => {
        const href = $(el).attr('href');
        if (href) {
            const email = href.replace('mailto:', '').split('?')[0];
            addEmail(email);
        }
    });

    // 2. Check all href attributes for emails
    $('a[href]').each((_, el) => {
        const href = $(el).attr('href') || '';
        if (href.includes('@') && !href.startsWith('mailto:')) {
            // Some sites put email directly in href
            const emailMatch = href.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})/);
            if (emailMatch) addEmail(emailMatch[1]);
        }
    });

    // 3. Check data attributes for emails
    $('[data-email], [data-mail], [data-contact]').each((_, el) => {
        const dataEmail = $(el).attr('data-email') || $(el).attr('data-mail') || $(el).attr('data-contact');
        if (dataEmail) addEmail(dataEmail);
    });

    // 4. Check meta tags
    $('meta[name*="email"], meta[property*="email"], meta[content*="@"]').each((_, el) => {
        const content = $(el).attr('content');
        if (content && content.includes('@')) {
            const emailMatch = content.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})/);
            if (emailMatch) addEmail(emailMatch[1]);
        }
    });

    // 5. Check form inputs that might have email as placeholder/value
    $('input[type="email"], input[name*="email"], input[placeholder*="@"]').each((_, el) => {
        const val = $(el).attr('value') || $(el).attr('placeholder');
        if (val && val.includes('@')) {
            const emailMatch = val.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})/);
            if (emailMatch) addEmail(emailMatch[1]);
        }
    });

    // 6. Get text from specific sections likely to contain emails
    const emailSections = [
        'footer', '.footer', '#footer',
        '.contact', '#contact', '[class*="contact"]',
        '.email', '#email', '[class*="email"]',
        'address', '.address',
        '.info', '#info',
        '[class*="reach"]', '[class*="support"]'
    ];

    let targetText = '';
    emailSections.forEach(sel => {
        $(sel).each((_, el) => {
            targetText += ' ' + $(el).text();
        });
    });

    // Also get full body text as fallback
    const fullText = $('body').text();
    const combinedText = targetText + ' ' + fullText;

    // 7. Multiple regex patterns for different email formats
    const emailPatterns = [
        // Standard email
        /([a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10})/gi,
        // [at] [dot] format
        /([a-zA-Z0-9._-]+\s*\[at\]\s*[a-zA-Z0-9.-]+\s*\[dot\]\s*[a-zA-Z]{2,6})/gi,
        // (at) (dot) format
        /([a-zA-Z0-9._-]+\s*\(at\)\s*[a-zA-Z0-9.-]+\s*\(dot\)\s*[a-zA-Z]{2,6})/gi,
        // Spaced format: user @ domain . com
        /([a-zA-Z0-9._-]+\s*@\s*[a-zA-Z0-9.-]+\s*\.\s*[a-zA-Z]{2,6})/gi,
        // "at" "dot" word format
        /([a-zA-Z0-9._-]+\s+at\s+[a-zA-Z0-9.-]+\s+dot\s+[a-zA-Z]{2,6})/gi
    ];

    emailPatterns.forEach(regex => {
        const matches = combinedText.match(regex);
        if (matches) {
            matches.forEach(m => addEmail(m));
        }
    });

    // 8. Check for JavaScript-protected emails (common pattern)
    const scriptContent = $('script').text();
    const jsEmailPattern = /['"]([a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10})['"]/gi;
    const jsMatches = scriptContent.match(jsEmailPattern);
    if (jsMatches) {
        jsMatches.forEach(m => {
            const clean = m.replace(/['"]/g, '');
            addEmail(clean);
        });
    }

    // 9. Social links extraction
    $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (!href) return;
        const lowHref = href.toLowerCase();

        // More robust social link detection
        if ((lowHref.includes('facebook.com/') || lowHref.includes('fb.com/')) && !socialLinks.facebook) {
            socialLinks.facebook = href;
        }
        if ((lowHref.includes('twitter.com/') || lowHref.includes('x.com/')) && !socialLinks.twitter) {
            socialLinks.twitter = href;
        }
        if (lowHref.includes('linkedin.com/') && !socialLinks.linkedin) {
            socialLinks.linkedin = href;
        }
        if (lowHref.includes('instagram.com/') && !socialLinks.instagram) {
            socialLinks.instagram = href;
        }
        if ((lowHref.includes('youtube.com/') || lowHref.includes('youtu.be/')) && !socialLinks.youtube) {
            socialLinks.youtube = href;
        }
    });

    return { emails, socialLinks };
};

// ============================================================================
// MAIN SCRAPER
// ============================================================================
export const extractContacts = async (url) => {
    if (!url || url === 'N/A') return { email: null, socialLinks: {} };

    // Standardize URL
    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;

    const allEmails = new Set();
    let finalSocialLinks = {
        facebook: null,
        twitter: null,
        linkedin: null,
        instagram: null,
        youtube: null
    };

    try {
        console.log(`[Scraper] Processing: ${targetUrl}`);

        // 1. SCRAPE HOMEPAGE
        const homepageData = await withPage(async (page) => {
            await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });
            await new Promise(r => setTimeout(r, 1000));
            return await page.content();
        });

        const { emails: homeEmails, socialLinks: homeSocial } = extractFromHtml(homepageData, targetUrl);
        homeEmails.forEach(e => allEmails.add(e));
        finalSocialLinks = { ...homeSocial };

        // 2. CHECK COMMON SUBDOMAINS (contact.domain.com, info.domain.com, etc.)
        const internalLinks = new Set();
        const urlObj = new URL(targetUrl);
        const baseDomain = urlObj.hostname.replace(/^www\./, ''); // Remove www if present
        const protocol = urlObj.protocol;

        // Common subdomains that often contain contact information
        const commonSubdomains = ['contact', 'info', 'support', 'help', 'team', 'about'];

        console.log(`[Scraper] Checking subdomains for: ${baseDomain}`);

        for (const subdomain of commonSubdomains) {
            const subdomainUrl = `${protocol}//${subdomain}.${baseDomain}`;
            try {
                // Quick probe to see if subdomain exists
                const exists = await withPage(async (page) => {
                    try {
                        const response = await page.goto(subdomainUrl, {
                            waitUntil: 'domcontentloaded',
                            timeout: 10000
                        });
                        return response && response.ok();
                    } catch (e) {
                        return false;
                    }
                }, 12000);

                if (exists) {
                    console.log(`[Scraper] ✅ Found active subdomain: ${subdomainUrl}`);
                    internalLinks.add(subdomainUrl);
                }
            } catch (e) {
                // Subdomain doesn't exist or timed out
            }
        }

        // 3. DISCOVER INTERNAL LINKS FROM HOMEPAGE
        const $ = cheerio.load(homepageData);
        // Expanded keywords to find more pages with potential emails
        const contactKeywords = [
            'contact', 'about', 'reach', 'support', 'connect',
            'team', 'staff', 'people', 'email', 'mail',
            'help', 'get-in-touch', 'inquir', 'info',
            'location', 'office', 'headquarters', 'hq',
            'impressum', 'legal', 'imprint'
        ];

        $('a[href]').each((_, el) => {
            const href = $(el).attr('href');
            const linkText = $(el).text().toLowerCase();
            if (!href) return;

            const isContact = contactKeywords.some(k => href.toLowerCase().includes(k) || linkText.includes(k));
            if (isContact) {
                try {
                    const absolute = new URL(href, targetUrl).href;
                    if (absolute.startsWith(new URL(targetUrl).origin)) {
                        internalLinks.add(absolute);
                    }
                } catch (e) { }
            }
        });

        // Add fallback standard contact page URLs if not many found
        if (internalLinks.size < 3) {
            const baseOrigin = new URL(targetUrl).origin;
            const standardPages = ['/contact', '/about', '/contact-us', '/about-us', '/team', '/impressum', '/kontakt'];
            standardPages.forEach(page => {
                internalLinks.add(baseOrigin + page);
            });
        }

        // 4. SCRAPE UP TO 6 PAGES (subdomains + internal contact pages)
        const pagesToScrape = Array.from(internalLinks).slice(0, 6);
        console.log(`[Scraper] Found ${internalLinks.size} potential pages, scraping top ${pagesToScrape.length}...`);

        for (const pageUrl of pagesToScrape) {
            try {
                const pageData = await withPage(async (page) => {
                    await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
                    return await page.content();
                }, 25000);

                const { emails: pEmails, socialLinks: pSocial } = extractFromHtml(pageData, pageUrl);
                pEmails.forEach(e => allEmails.add(e));
                // Fill missing social links
                Object.keys(finalSocialLinks).forEach(k => {
                    if (!finalSocialLinks[k] && pSocial[k]) finalSocialLinks[k] = pSocial[k];
                });

                console.log(`[Scraper] Scraped ${pageUrl} - Found ${pEmails.size} emails`);
            } catch (e) {
                // Silently skip failed subpages
                console.log(`[Scraper] Skipped ${pageUrl}: ${e.message}`);
            }
        }

        return {
            email: allEmails.size > 0 ? Array.from(allEmails).join(', ') : null,
            socialLinks: finalSocialLinks
        };

    } catch (error) {
        console.error(`[Scraper] Failed ${url}: ${error.message}`);
        return { email: null, socialLinks: {} };
    }
};