Alright Meer — let’s do this properly, product-manager-style.
Below is a **full Product Requirements Document (PRD)** for your proposed tool — essentially a **Google-scraper + contact extractor** built in **Next.js**. I’ll treat this as a SaaS-grade foundation: organized, detailed, and engineered for future scalability.

---

## 🧭 Product Requirements Document (PRD)

**Product Name:** LeadHarvester
**Version:** 1.0
**Prepared by:** Product Manager (You)
**Framework:** Next.js (App Router)
**Backend Runtime:** Node.js (API Routes in Next.js)
**Storage:** SQLite / NoSQL-lite (for local prototype)
**External APIs:** Google Custom Search API
**Goal:** Automate lead discovery by searching Google for specific categories or industries, then scraping resulting pages for contact information (email, phone).

---

## 🎯 Product Vision

A simple yet powerful web-based assistant that helps users extract verified contact leads from the open web without manual browsing. Input a Google search (or Google Dork), get structured results — ready to export.

---

## 🌍 Core Features (Epics)

### **Epic 1: Query & Search Management**

Users can enter a search term or Google Dork, assign a category, and trigger the Google Search API to fetch results.

**User Stories**

1. **Story 1.1**: As a user, I can input a search query (or Google Dork) and select a category to classify the search.

   * **Tasks:**

     * [ ] Design query input form (query + category)
     * [ ] Connect form to backend API endpoint
     * [ ] Validate input (limit query length, category optional)
2. **Story 1.2**: As a user, I can view the list of fetched search results (URLs + snippets) before extraction.

   * **Tasks:**

     * [ ] Create SearchResults component
     * [ ] Implement pagination for Google API results
     * [ ] Save query metadata (query, category, timestamp) to database

---

### **Epic 2: Data Extraction Engine**

Automatically visit fetched URLs, scrape the page HTML, and extract emails and phone numbers.

**User Stories**

1. **Story 2.1**: As a user, I can trigger extraction for a batch of search results.

   * **Tasks:**

     * [ ] Build API route `/api/extract`
     * [ ] Implement concurrency-safe crawler (limit N requests at once)
     * [ ] Handle errors gracefully (timeouts, 403s, redirects)
2. **Story 2.2**: As a system, I should parse webpage HTML and extract email addresses and phone numbers.

   * **Tasks:**

     * [ ] Use regex to find `mailto:` links and pattern-matched emails
     * [ ] Use regex for phone patterns (international formats)
     * [ ] Remove duplicates and validate results
3. **Story 2.3**: As a user, I can see extraction progress in real time.

   * **Tasks:**

     * [ ] Add progress bar or percentage indicator
     * [ ] Add server-sent events or polling to track status
     * [ ] Log completed and failed URLs in DB

---

### **Epic 3: Data Storage & Export**

Store results and allow the user to export or view structured data.

**User Stories**

1. **Story 3.1**: As a system, I will store each extracted contact with its metadata.

   * **Tasks:**

     * [ ] Design database schema:

       ```
       Table: Leads
       id | website | email | phone | category | query | timestamp
       ```
     * [ ] Create Prisma schema (if using SQLite)
2. **Story 3.2**: As a user, I can view all extracted data in a table view.

   * **Tasks:**

     * [ ] Build ResultsTable component using TanStack Table
     * [ ] Add filters: category, query, date range
     * [ ] Add pagination and sorting
3. **Story 3.3**: As a user, I can export results to Excel or CSV.

   * **Tasks:**

     * [ ] Implement `/api/export` route
     * [ ] Use `xlsx` or `papaparse` for export
     * [ ] Auto-download file in browser

---

### **Epic 4: System Configuration & API Keys**

Enable user to configure Google API key and CX (Custom Search Engine ID).

**User Stories**

1. **Story 4.1**: As a user, I can securely save and edit my Google API key.

   * **Tasks:**

     * [ ] Build Settings page
     * [ ] Store credentials in `.env.local`
     * [ ] Validate connection before saving
2. **Story 4.2**: As a system, I can use saved API credentials to make requests.

   * **Tasks:**

     * [ ] Create wrapper for Google API client
     * [ ] Handle API quotas and rate limits

---

### **Epic 5: User Experience & Interface**

Ensure clean, intuitive, responsive design.

**User Stories**

1. **Story 5.1**: As a user, I see a dashboard showing previous queries and results.

   * **Tasks:**

     * [ ] Build Dashboard page with cards for each query
     * [ ] Add total leads count and timestamp
2. **Story 5.2**: As a user, I want a minimal dark/light theme toggle.

   * **Tasks:**

     * [ ] Implement theme provider (e.g., next-themes)
     * [ ] Save preference in localStorage

---

### **Epic 6: Security & Compliance**

Since the system touches external sites and data, ensure safe, ethical, and compliant scraping.

**User Stories**

1. **Story 6.1**: As a developer, I want to ensure scraping is polite and legal.

   * **Tasks:**

     * [ ] Respect robots.txt (skip disallowed URLs)
     * [ ] Add user agent identification
     * [ ] Include disclaimer for fair use
2. **Story 6.2**: As a user, I can delete all stored data.

   * **Tasks:**

     * [ ] Implement “Delete All Data” button
     * [ ] Wipe database safely

---

## 🧩 Technical Breakdown

| Layer            | Stack                            | Purpose                            |
| ---------------- | -------------------------------- | ---------------------------------- |
| **Frontend**     | Next.js + React + TanStack Table | UI rendering, data visualization   |
| **Backend**      | Next.js API routes (Node)        | Google API calls, scraping, export |
| **Database**     | SQLite (via Prisma ORM)          | Local storage for leads            |
| **Styling**      | Tailwind or Shadcn/UI            | Clean UI components                |
| **External API** | Google Custom Search API         | Fetch URLs from Google results     |
| **Scraper**      | Axios + Cheerio                  | Fetch and parse HTML content       |
| **Export**       | xlsx / papaparse                 | Generate CSV/Excel files           |

---

## 🧠 Future Enhancements (Backlog)

* Add proxy rotation for large-scale scraping
* Integrate email validation APIs (e.g., Hunter.io)
* Add login/auth layer (NextAuth) for multi-user version
* Allow category suggestions via GPT model
* Add integration to CRM (HubSpot, Notion, etc.)

---

## ⚙️ Example Data Flow

1. User enters query: `"dentists in London"` with category `"Health"`.
2. Backend calls Google API → returns list of URLs.
3. User triggers extraction → crawler visits each link → finds `email`, `phone`.
4. Results stored as:

   ```
   websiteLink, category, email, phone
   www.londondentist.co.uk, Health, info@londondentist.co.uk, +44 20 1234 5678
   ```
5. User exports all results to Excel.

---

Would you like me to expand this into a **developer-ready roadmap**, with week-by-week sprint plans and GitHub issue breakdowns (titles + story points)? That would make it easier to actually build and manage with a team or solo workflow.
