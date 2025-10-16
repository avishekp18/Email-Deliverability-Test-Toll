Email Deliverability Test Tool
A full-stack web application to test email deliverability. Users enter their email, receive a unique test code, send a test email to provided seed inboxes (mock or real via GlockApps), and get a report on where it lands (Inbox, Spam, Promotions).
Failed to load imageView link
Features

User-Friendly UI: Step-by-step flow: Start test → Send email → Check results → View/share report.
Mock Testing: Simulated inbox placements for quick demos (default).
Real Testing (Optional): Integration with GlockApps API for actual seed list and deliverability results across 60+ providers (requires API key).
Report Generation: Deliverability score, per-inbox placement, and shareable links.
Tech Stack:

Frontend: React 18+, Vite, Tailwind CSS, Lucide React icons.
Backend: Node.js, Express, MongoDB (Mongoose), Axios (for API calls).
State Management: React Context API.
Routing: React Router DOM.

Quick Start

Clone the Repo:
textgit clone <your-repo-url>
cd email-spam-tool

Backend Setup:

Navigate to backend/: cd backend
Install dependencies: npm install
Create .env (see Environment Variables below).
Start MongoDB (local or Atlas).
Run: npm run dev (uses Nodemon) or npm start.
Server runs on http://localhost:5000.

Frontend Setup:

Navigate to frontend/: cd ../frontend
Install dependencies: npm install
Run: npm run dev.
App runs on http://localhost:5173 (proxies API to backend).

Test the App:

Open http://localhost:5173.
Enter an email → Get test code & inboxes → (Send real email if using GlockApps) → Confirm → View report.
Share report via URL (e.g., ?report_id=...).

Project Structure
textemail-spam-tool/
├── frontend/ # React + Vite
│ ├── public/
│ │ └── index.html
│ ├── src/
│ │ ├── components/ # UI views (StartTest, SendEmail, etc.)
│ │ ├── contexts/ # AppContext for state
│ │ ├── App.jsx
│ │ └── main.jsx
│ ├── vite.config.js # Proxy to backend
│ ├── tailwind.config.js # Tailwind setup
│ └── package.json
├── backend/ # Node.js + Express
│ ├── models/ # Mongoose schemas (Test.js)
│ ├── server.js # Main server file
│ ├── .env.example # Env template
│ └── package.json
└── README.md # This file
Environment Variables
Copy backend/.env.example to backend/.env and fill in:
env# Database
MONGO_URI=mongodb://localhost:27017/emailspamdb # Or MongoDB Atlas URI

# Server

PORT=5000

# GlockApps (Optional - for real tests)

GLOCK_API_KEY=your_glockapps_api_key_here
GLOCK_PROJECT_ID=12345 # Your project ID

MongoDB: Install locally or use MongoDB Atlas (free tier).
GlockApps: Sign up at glockapps.com (free tier: 2 tests/month). Get key/project ID from dashboard (see GlockApps Setup Guide).

API Endpoints

MethodEndpointDescriptionBody/ParamsPOST/api/testStart test (create code & inboxes){ userEmail: string }POST/api/test/:testId/confirmConfirm email sent (start analysis)NonePOST/api/check/:testIdGenerate/fetch reportNoneGET/api/report/:testIdGet shared reportNone

Real Mode: If GlockApps configured, uses API for seed inboxes & results.
Mock Mode: Randomized placements (90% received, 60% Inbox, etc.).

Development

Frontend Scripts:

npm run dev: Start dev server.
npm run build: Build for production.
npm run preview: Preview build.

Backend Scripts:

npm run dev: Start with Nodemon (auto-reload).
npm start: Production start.

Tailwind: Configured via PostCSS; edit tailwind.config.js for custom themes.
Testing: Add Jest/Supertest for unit/integration tests (not included).

Deployment

Frontend: Build (npm run build) and host on Vercel/Netlify (set proxy to backend URL in vite.config.js).
Backend: Deploy to Heroku/Render (with MongoDB Atlas). Set env vars in dashboard.
Full-Stack: Use Docker for containerization or Railway for one-click deploy.
HTTPS: Enforce in production (e.g., via Vercel).

GlockApps Setup (Optional)

Sign up at glockapps.com (free tier available).
Go to Account Settings > API → Copy API key.
Create project in dashboard → Note Project ID from URL/settings.
Add to .env (see above).
Test: Restart backend; new tests will use real inboxes.

For API details: GlockApps Docs.
Free Alternatives
If avoiding GlockApps:

Mail-Tester: Integrate free API for spam scores (update performMockAnalysis to call their endpoint).
MxToolbox: Free blacklist checks via API.

Contributing

Fork the repo.
Create a feature branch (git checkout -b feature/amazing-feature).
Commit changes (git commit -m 'Add some amazing feature').
Push (git push origin feature/amazing-feature).
Open a Pull Request.

License
MIT License. See LICENSE for details.
Support

Issues: Open a GitHub issue.
Questions: Check console logs or share error traces.

Built with ❤️ by [Your Name] (2025). Questions? Reach out!
