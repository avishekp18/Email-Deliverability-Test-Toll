# Email Spam Report Tool

A web app to test email deliverability. Users send an email with a unique code to 5 test inboxes, and the app generates a report in <5 minutes using dummy data.

## Live App URL

- [Update with deployment URL](#)

## Features

- Displays 5 test inboxes (e.g., testinbox.gmass@gmail.com).
- Generates a unique test code.
- Simulates report generation with dummy data.
- Generates a shareable report and emails it to the user.
- Modern UI with loading, empty, and success states.

## How It Works

1. User enters email and starts test.
2. App provides code and inboxes; user sends email with code (optional).
3. User confirms; app generates dummy report in ~2 minutes.
4. Report is shareable and emailed.

## Setup

- Clone: `git clone <repo-url>`
- Backend: `cd backend`, `npm install`, set `.env`, `node server.js`.
- Frontend: `cd frontend`, `npm install`, `npm run dev`.
- `.env` Example:
  PORT=5000
  SMTP_USER=yourgmail@gmail.com
  SMTP_PASS=your-gmail-app-password

- SMTP: Use a Gmail App Password with 2FA enabled.

## Limitations

- **No Database**: Uses in-memory storage, resetting on server restart.
- **Non-Compliance**: Uses dummy data instead of real mailbox APIs due to time constraints and lack of authorized inboxes.
- **500 Error Fix**: Removed MongoDB and Gmail API to avoid crashes; ensure valid SMTP credentials.

## What’s Missing or Could Be Improved

- Real mailbox API integration (e.g., Gmail API with OAuth 2.0).
- Persistent storage (e.g., MongoDB).
- Multi-provider support (Outlook, Yahoo).
- PDF export, open/click tracking.

## License

MIT
