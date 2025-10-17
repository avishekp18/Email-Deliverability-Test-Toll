import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "https://email-frontend-puce.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // optional if you need cookies/auth
  })
);
app.use(express.json());

// In-memory storage (replaces MongoDB)
let tests = {};

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

// Helper: Generate unique code
const generateUniqueCode = () => {
  const adjectives = ["swift", "silent", "brave", "calm", "eager"];
  const nouns = ["river", "ocean", "breeze", "spark", "flame"];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}-${
    nouns[Math.floor(Math.random() * nouns.length)]
  }-${num}`;
};

// Test inboxes
const testInboxes = [
  "testinbox.gmass@gmail.com",
  "testspam.gmass@gmail.com",
  "testpromotions.gmass@gmail.com",
  "testdeliverability@outlook.com",
  "testemail@yahoo.com",
];

// Dummy analysis
const performDummyAnalysis = (testCode) => {
  return testInboxes.map((inbox) => {
    const status = Math.random() > 0.2 ? "Received" : "Not Received";
    let folder = null;
    if (status === "Received") {
      const rand = Math.random();
      folder = rand < 0.6 ? "Inbox" : rand < 0.8 ? "Promotions" : "Spam";
    }
    return { inbox, status, folder };
  });
};

// Send report email
// const sendReportEmail = async (userEmail, testCode, results) => {
//   const mailOptions = {
//     from: process.env.SMTP_USER,
//     to: userEmail,
//     subject: `Email Deliverability Report - ${testCode}`,
//     text: `Your report for test code ${testCode}.\nResults: ${results
//       .map((r) => `${r.inbox}: ${r.status}${r.folder ? ` (${r.folder})` : ""}`)
//       .join("\n")}`,
//     html: `<h1>Email Deliverability Report</h1><p>Test Code: ${testCode}</p><p>Results: ${results
//       .map((r) => `${r.inbox}: ${r.status}${r.folder ? ` (${r.folder})` : ""}`)
//       .join("<br>")}</p>`,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`Report emailed to ${userEmail}`);
//   } catch (err) {
//     console.error("Failed to send report:", err);
//   }
// };

// Routes

// Start Test
app.post("/api/test", (req, res) => {
  const { userEmail } = req.body;
  if (!userEmail || !/^\S+@\S+\.\S+$/.test(userEmail)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const testCode = generateUniqueCode();
  const testId = Date.now().toString(); // Simple ID based on timestamp
  tests[testId] = {
    userEmail,
    testCode,
    testInboxes,
    deliveryStatus: testInboxes.reduce(
      (acc, inbox) => ({ ...acc, [inbox]: false }),
      {}
    ),
    emailsSent: false,
    results: null,
    createdAt: new Date(),
  };

  res.json({ testId, testCode, testInboxes });
});

// Confirm Emails Sent
app.post("/api/test/:testId/confirm", (req, res) => {
  const { testId } = req.params;
  if (!tests[testId]) return res.status(404).json({ error: "Test not found" });

  tests[testId].emailsSent = true;
  res.json({ success: true });
});

// Check Test
app.post("/api/check/:testId", async (req, res) => {
  const { testId } = req.params;
  if (!tests[testId]) return res.status(404).json({ error: "Test not found" });

  const test = tests[testId];
  if (!test.emailsSent)
    return res.status(400).json({ error: "Emails not sent yet" });

  try {
    if (!test.results) {
      const start = Date.now();
      const timeout = 5 * 60 * 1000; // 5 minutes
      while (Date.now() - start < timeout) {
        const results = performDummyAnalysis(test.testCode);
        if (results.some((r) => r.status === "Received")) {
          test.results = results;
          sendReportEmail(test.userEmail, test.testCode, results);
          break;
        }
        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        await sleep(30000); // Poll every 30s
      }
      if (!test.results) {
        test.results = testInboxes.map((inbox) => ({
          inbox,
          status: "Not Received",
          folder: null,
        }));
      }
    }
    res.json({
      testId,
      testCode: test.testCode,
      testInboxes: test.testInboxes,
      results: test.results,
    });
  } catch (err) {
    console.error("Error in /api/check:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get Report
app.get("/api/report/:testId", (req, res) => {
  const { testId } = req.params;
  const test = tests[testId];
  if (!test || !test.emailsSent)
    return res.status(404).json({ error: "Report not ready" });

  res.json({
    testId,
    testCode: test.testCode,
    testInboxes: test.testInboxes,
    results: test.results,
  });
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
