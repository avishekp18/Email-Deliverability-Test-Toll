import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Connect DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection failed:", err));

// Schema
const TestSchema = new mongoose.Schema({
  userEmail: String,
  testCode: String,
  testInboxes: [String],
  deliveryStatus: { type: Object, default: {} },
  emailsSent: { type: Boolean, default: false },
  results: [Object],
  createdAt: { type: Date, default: Date.now },
});

const Test = mongoose.model("Test", TestSchema);

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

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

// Dummy analysis (fallback if API not implemented)
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
const sendReportEmail = async (userEmail, testCode, results) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: userEmail,
    subject: `Email Deliverability Report - ${testCode}`,
    text: `Your report for test code ${testCode}.\nResults: ${results
      .map((r) => `${r.inbox}: ${r.status}${r.folder ? ` (${r.folder})` : ""}`)
      .join("\n")}`,
    html: `<h1>Email Deliverability Report</h1><p>Test Code: ${testCode}</p><p>Results: ${results
      .map((r) => `${r.inbox}: ${r.status}${r.folder ? ` (${r.folder})` : ""}`)
      .join("<br>")}</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Report emailed to ${userEmail}`);
  } catch (err) {
    console.error("Failed to send report:", err);
  }
};

// Routes

// Start Test
app.post("/api/test", async (req, res) => {
  const { userEmail } = req.body;
  if (!userEmail || !/^\S+@\S+\.\S+$/.test(userEmail)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const testCode = generateUniqueCode();
  const deliveryStatus = testInboxes.reduce(
    (acc, inbox) => ({ ...acc, [inbox]: false }),
    {}
  );

  const test = await Test.create({
    userEmail,
    testCode,
    testInboxes,
    deliveryStatus,
  });

  res.json({ testId: test._id, testCode, testInboxes });
});

// Confirm Emails Sent
app.post("/api/test/:testId/confirm", async (req, res) => {
  const { testId } = req.params;
  const test = await Test.findById(testId);
  if (!test) return res.status(404).json({ error: "Test not found" });

  test.emailsSent = true;
  await test.save();
  res.json({ success: true });
});

// Check Test
app.post("/api/check/:testId", async (req, res) => {
  const { testId } = req.params;
  const test = await Test.findById(testId);
  if (!test) return res.status(404).json({ error: "Test not found" });

  if (!test.emailsSent)
    return res.status(400).json({ error: "Emails not sent yet" });

  try {
    if (!test.results || test.results.length === 0) {
      const start = Date.now();
      const timeout = 5 * 60 * 1000; // 5 minutes
      while (Date.now() - start < timeout) {
        const results = performDummyAnalysis(test.testCode); // Dummy fallback
        if (results.some((r) => r.status === "Received")) {
          test.results = results;
          await test.save();
          await sendReportEmail(test.userEmail, test.testCode, results);
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 30000)); // Poll every 30s
      }
      if (!test.results) {
        test.results = testInboxes.map((inbox) => ({
          inbox,
          status: "Not Received",
          folder: null,
        }));
        await test.save();
      }
    }
    res.json({
      testId: test._id,
      testCode: test.testCode,
      testInboxes: test.testInboxes,
      results: test.results,
    });
  } catch (err) {
    console.error("Error in /api/check:", err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
});

// Get Report
app.get("/api/report/:testId", async (req, res) => {
  const { testId } = req.params;
  const test = await Test.findById(testId);
  if (!test || !test.emailsSent)
    return res.status(404).json({ error: "Report not ready" });

  res.json({
    testId: test._id,
    testCode: test.testCode,
    testInboxes: test.testInboxes,
    results: test.results,
  });
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
