# Job Tracker

A lightweight, responsive web application for tracking job applications, visualizing application pipelines, and exporting data reports. Designed with a clean Light Mode aesthetic and zero external framework dependencies.

---

## Features

- **Application Management**: Log and edit job applications with details including Company Name, Job Title, Application Stage, Date Applied, Location, Work Mode (Remote/Hybrid/Onsite), Listing URL, and Notes.
- **Listing Link Flexibility**: Toggle option for unavailable or expired job listing links (`Link N/A or expired`).
- **Pipeline Kanban Board**: 4-stage visual board (Applied, Interviewing, Offer, Rejected) supporting native drag-and-drop status updates.
- **Tabular Data View**: Searchable and filterable table view for quick scanning and sorting.
- **Analytics & Visualizations**: Interactive stage breakdown and monthly timeline charts powered by Chart.js.
- **Export & Backup Capabilities**:
  - Export application data to CSV for spreadsheets.
  - Full database JSON Backup and JSON Restore.
- **Mobile Responsive & Accessible**: Optimized touch scroll snap for mobile devices, ARIA dialog compliance, and keyboard shortcuts (`Escape` key navigation).
- **Data Persistence**: Automatic client-side persistence using browser LocalStorage.

---

## Tech Stack

- **Frontend**: HTML5, CSS3 (CSS Custom Properties & Flexbox/Grid), Vanilla JavaScript (ES6+).
- **Visualization**: Chart.js v4 (via CDN).
- **Storage**: Browser `localStorage` API.
- **Server**: Python `http.server` (Local Development).

---

## Project Structure

```
Job Tracker/
├── index.html          # Main HTML document, SEO meta tags, and modal dialogs
├── vercel.json         # Vercel production deployment & security headers config
├── manifest.json       # Web App Manifest for mobile/desktop PWA installation
├── css/
│   └── styles.css      # Design system, light theme tokens, and responsive layout
├── js/
│   └── app.js          # Core application logic, storage, drag-and-drop, and charts
└── README.md           # Project documentation
```

---

## Getting Started

### Running Locally

1. Open your terminal in the project directory:

   ```bash
   cd "C:\Users\user\Desktop\Job Tracker"
   ```

2. Start a local server:

   ```bash
   uv run python -m http.server 8000
   ```

3. Open your browser and navigate to `http://localhost:8000`.

---

## Deploying to Vercel

### Method 1: Deploy via GitHub (Recommended)

1. Push this project repository to **GitHub**.
2. Go to [Vercel Dashboard](https://vercel.com/new) and click **"Add New"** -> **"Project"**.
3. Select your GitHub repository.
4. Click **"Deploy"**. Vercel will automatically detect `vercel.json` and host your app live on a `.vercel.app` domain with SSL.

### Method 2: Deploy via Vercel CLI

1. Install the Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. Run the deployment command in the project directory:
   ```bash
   vercel
   ```
3. Follow the prompts to deploy instantly to production.

---

## Data Privacy & Storage

All job application data entered into this application is stored locally inside your browser's `localStorage`. No data is sent to external servers or remote databases.

---

## License

MIT License. Free for personal and commercial use.

