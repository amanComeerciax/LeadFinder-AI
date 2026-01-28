<div align="center">

# 🚀 LeadFinder AI
### Advanced Google Maps Scraper & Lead Generation Tool

<p>
  <img src="https://img.shields.io/badge/Node.js-v18+-green.svg" />
  <img src="https://img.shields.io/badge/React-v18-blue.svg" />
  <img src="https://img.shields.io/badge/Puppeteer-Headless-orange.svg" />
  <img src="https://img.shields.io/badge/MongoDB-Database-green.svg" />
  <img src="https://img.shields.io/badge/Redis-Caching-red.svg" />
</p>

<p>
  <b>Extract Business Data, Find Emails, and Export Leads Automatically.</b>
  <br>
  <i>Built with specialized strategies for high-precision data extraction.</i>
</p>

</div>

<br>

## 🔥 Key Features

### 1. Smart Business Search (Google Maps API)
- **High-Volume Extraction:** Fetches up to 60+ businesses per keyword.
- **Smart Looping:** Automatically navigates through search result, iterating results.
- **Real-time Visualization:** See businesses pop up on an interactive 3D Globe.

### 2. Advanced Email Discovery (Aggressive Mode)
- **Puppeteer Integration:** Uses a headless browser to render JavaScript-heavy sites (React, Angular).
- **Multi-Page Crawling:** Scans Homepage, Contact, About, and Support pages automatically.
- **Obfuscation Handling:** Decodes hidden emails (e.g., `user [at] domain [dot] com`).
- **Deep Extraction:** Collects *all* unique emails found, not just the first one.

### 3. Intelligent Deduplication (Bloom Filter)
- **Duplicate Prevention:** Uses probabilistic data structures (Bloom Filters) to ban previously seen businesses.
- **Efficiency:** Prevents re-crawling the same website URL twice, saving huge resources.
- **Redis Backed:** Filter state is persistent across restarts.

### 4. Lead Management
- **Dashboard:** Interactive UI to view, search, and manage leads.
- **CSV Export:** Download your curated list of leads with one click.
- **Search History:** Track your past scraping jobs.

---

## 🛠 Tech Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| **Frontend** | React, Vite, TailwindCSS | Fast, responsive dashboard with Glassmorphism UI. |
| **Backend** | Node.js, Express | Robust REST API. |
| **Scraping** | Puppeteer, Cheerio | Hybrid scraping engine (Static + Dynamic). |
| **Queue** | BullMQ, Redis | Background job processing for scraping tasks. |
| **Database** | MongoDB | Persistent storage for businesses and jobs. |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or Atlas URI)
- Redis (Running locally for queues)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/amanComeerciax/LeadFinder-AI.git
   cd LeadFinder-AI
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create .env file based on .env.example
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the Dashboard**
   Open `http://localhost:3000` in your browser.

---

## ⚙️ Logic & Architecture

### Scraping Workflow
1. **User Request:** User enters "Dentists in New York".
2. **Search Worker:** Background job starts searching Google Maps via SerpAPI/Custom Engine.
3. **Deduplication:** Place IDs are checked against the Bloom Filter.
4. **Enrichment:**
   - Worker checks if website URL is new.
   - **Puppeteer** launches to crawl the website.
   - Scraper looks for emails on main page + subpages (`/contact`, `/about`).
5. **Storage:** Enriched data (Phone, Email, Socials) is saved to MongoDB.
6. **Live Update:** Frontend receives real-time progress updates.

---

<div align="center">
  <p>Built with ❤️ by Commerciax Team</p>
</div>
