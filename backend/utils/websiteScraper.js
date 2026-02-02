import axios from 'axios';
import cheerio from 'cheerio';

/**
 * Deep scan a business website to extract comprehensive contact information
 * Focus on extracting emails with high accuracy
 */

// Multiple email regex patterns for better accuracy
const EMAIL_PATTERNS = [
    // Standard email pattern
    /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi,
    // Email with dots and special chars
    /([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)/gi,
    // Mailto links
    /mailto:([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi
];

// Phone number patterns (international formats)
const PHONE_PATTERNS = [
    // US format: (123) 456-7890 or 123-456-7890
    /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    // International: +1234567890 or +12 345 678 9012
    /\+?\d{1,3}[-.\s]?\d{2,4}[-.\s]?\d{2,4}[-.\s]?\d{2,4}[-.\s]?\d{0,4}/g,
    // Indian: +91 12345 67890 or 1234567890
    /(\+91[-.\s]?)?[6-9]\d{9}/g
];

// Social media URL patterns
const SOCIAL_PATTERNS = {
    facebook: /(?:https?:\/\/)?(?:www\.)?(?:facebook|fb)\.com\/[a-zA-Z0-9._-]+/gi,
    instagram: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/[a-zA-Z0-9._-]+/gi,
    twitter: /(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com\/[a-zA-Z0-9._-]+/gi,
    linkedin: /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:company|in)\/[a-zA-Z0-9._-]+/gi,
    youtube: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:c|channel|user)\/[a-zA-Z0-9._-]+/gi
};

// Common spam/fake emails to filter out
const SPAM_EMAILS = [
    'example@example.com',
    'test@test.com',
    'info@example.com',
    'email@example.com',
    'user@example.com',
    'admin@example.com',
    'webmaster@example.com'
];

/**
 * Validate if an email looks legitimate
 */
function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;

    email = email.toLowerCase().trim();

    // Filter out spam/fake emails
    if (SPAM_EMAILS.includes(email)) return false;

    // Filter out image file extensions
    if (email.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/i)) return false;

    // Must have @ and valid TLD
    if (!email.includes('@')) return false;

    const parts = email.split('@');
    if (parts.length !== 2) return false;

    const [localPart, domain] = parts;

    // Basic validation
    if (localPart.length === 0 || domain.length === 0) return false;
    if (!domain.includes('.')) return false;

    // TLD should be 2-6 characters
    const tld = domain.split('.').pop();
    if (tld.length < 2 || tld.length > 6) return false;

    return true;
}

/**
 * Extract all emails from text using multiple patterns
 */
function extractEmails(text) {
    const emailsSet = new Set();

    EMAIL_PATTERNS.forEach(pattern => {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
            let email = match[1] || match[0];
            email = email.toLowerCase().trim();

            // Clean up mailto: prefix
            email = email.replace(/^mailto:/i, '');

            if (isValidEmail(email)) {
                emailsSet.add(email);
            }
        }
    });

    return Array.from(emailsSet);
}

/**
 * Extract phone numbers from text
 */
function extractPhones(text) {
    const phonesSet = new Set();

    PHONE_PATTERNS.forEach(pattern => {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
            let phone = match[0].trim();

            // Clean up and normalize
            phone = phone.replace(/\s+/g, ' ');

            // Only add if it looks like a real phone number (has enough digits)
            const digitCount = phone.replace(/\D/g, '').length;
            if (digitCount >= 10 && digitCount <= 15) {
                phonesSet.add(phone);
            }
        }
    });

    return Array.from(phonesSet);
}

/**
 * Extract social media links from HTML
 */
function extractSocialLinks(html, $) {
    const socialLinks = {};

    // Check all links in the page
    $('a[href]').each((i, elem) => {
        const href = $(elem).attr('href');
        if (!href) return;

        // Check each social platform
        Object.keys(SOCIAL_PATTERNS).forEach(platform => {
            if (!socialLinks[platform]) {
                const matches = href.match(SOCIAL_PATTERNS[platform]);
                if (matches && matches[0]) {
                    // Normalize URL
                    let url = matches[0];
                    if (!url.startsWith('http')) {
                        url = 'https://' + url;
                    }
                    socialLinks[platform] = url;
                }
            }
        });
    });

    return socialLinks;
}

/**
 * Find contact page URL
 */
function findContactPageUrl(baseUrl, $) {
    const contactKeywords = ['contact', 'contact-us', 'contactus', 'reach-us', 'get-in-touch'];

    let contactUrl = null;

    $('a[href]').each((i, elem) => {
        const href = $(elem).attr('href');
        const text = $(elem).text().toLowerCase();

        if (!href) return;

        // Check if link text or href contains contact keywords
        const isContactLink = contactKeywords.some(keyword =>
            text.includes(keyword) || href.toLowerCase().includes(keyword)
        );

        if (isContactLink && !contactUrl) {
            // Convert relative URL to absolute
            try {
                const url = new URL(href, baseUrl);
                contactUrl = url.href;
            } catch (e) {
                // Invalid URL, skip
            }
        }
    });

    return contactUrl;
}

/**
 * Main function to scrape a website and extract contact information
 */
async function scrapeWebsite(websiteUrl) {
    try {
        console.log(`🔍 Deep scanning: ${websiteUrl}`);

        // Fetch the website with timeout
        const response = await axios.get(websiteUrl, {
            timeout: 10000, // 10 seconds
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            maxRedirects: 5
        });

        const html = response.data;
        const $ = cheerio.load(html);

        // Remove script and style elements for cleaner text
        $('script, style, noscript').remove();

        // Get all text content
        const pageText = $.text();

        // Extract information
        const emails = extractEmails(pageText);
        const phones = extractPhones(pageText);
        const socialLinks = extractSocialLinks(html, $);
        const contactPageUrl = findContactPageUrl(websiteUrl, $);

        // If contact page found, try to scrape it too for more emails
        let contactPageEmails = [];
        let contactPagePhones = [];

        if (contactPageUrl && contactPageUrl !== websiteUrl) {
            try {
                console.log(`📧 Found contact page: ${contactPageUrl}`);
                const contactResponse = await axios.get(contactPageUrl, {
                    timeout: 8000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                const contactHtml = contactResponse.data;
                const $contact = cheerio.load(contactHtml);
                $contact('script, style, noscript').remove();
                const contactText = $contact.text();

                contactPageEmails = extractEmails(contactText);
                contactPagePhones = extractPhones(contactText);

                console.log(`✉️ Found ${contactPageEmails.length} emails from contact page`);
            } catch (contactError) {
                console.log(`⚠️ Could not fetch contact page: ${contactError.message}`);
            }
        }

        // Merge emails and phones from both pages
        const allEmails = [...new Set([...emails, ...contactPageEmails])];
        const allPhones = [...new Set([...phones, ...contactPagePhones])];

        const result = {
            success: true,
            extractedEmails: allEmails,
            extractedPhones: allPhones,
            extractedSocialLinks: socialLinks,
            contactPageUrl: contactPageUrl || null,
            scannedAt: new Date(),
            metadata: {
                mainPageEmailCount: emails.length,
                contactPageEmailCount: contactPageEmails.length,
                totalEmailsFound: allEmails.length,
                phonesFound: allPhones.length,
                socialLinksFound: Object.keys(socialLinks).length
            }
        };

        console.log(`✅ Scan complete: ${allEmails.length} emails, ${allPhones.length} phones, ${Object.keys(socialLinks).length} social links`);

        return result;

    } catch (error) {
        console.error(`❌ Error scraping ${websiteUrl}:`, error.message);

        return {
            success: false,
            error: error.message,
            extractedEmails: [],
            extractedPhones: [],
            extractedSocialLinks: {},
            contactPageUrl: null,
            scannedAt: new Date()
        };
    }
}

export {
    scrapeWebsite,
    extractEmails,
    extractPhones,
    isValidEmail
};
