// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const nodemailer = require("nodemailer");
const multer = require("multer");
const PDFDocument = require("pdfkit");

const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const stream = require("stream");

const app = express();
const port = process.env.PORT || 3000;
const secretKey = process.env.secretKey || "replace_this_secret";

// Basic middleware
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.origin,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// ---------- MongoDB ----------
if (!process.env.mongoconnect) {
  console.error("Missing MONGO connection string in .env (mongoconnect).");
  process.exit(1);
}

mongoose.connect(process.env.mongoconnect)
  .then(() => console.log("Mongo connected"))
  .catch(err => {
    console.error("Mongo connection error:", err);
    process.exit(1);
  });

// ---------- Nodemailer ----------
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.mailuser,
    pass: process.env.mailpass
  }
});

// ---------- Models ----------
const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true, index: true },
  password: String,
  courseval: String,
  provider: { type: String, default: "local" },
  role: { type: String, enum: ["patient", "admin"], default: "patient" }
});
const User = mongoose.model('User', userSchema);

const submissionSchema = new mongoose.Schema({
  patientName: String,
  patientId: String,
  email: String,
  note: String,
  originalImageKey: String,
  annotatedImageKey: String,
  pdfKey: String,
  status: { type: String, default: "uploaded" },
  createdAt: { type: Date, default: Date.now }
});
const Submission = mongoose.model('Submission', submissionSchema);

// ---------- S3 ----------
if (!process.env.access_key || !process.env.secret_aws || !process.env.bucket_region || !process.env.bucket_name) {
  console.error("Missing AWS env vars (access_key, secret_aws, bucket_region, bucket_name).");
}

const s3Client = new S3Client({
  region: process.env.bucket_region,
  credentials: {
    accessKeyId: process.env.access_key,
    secretAccessKey: process.env.secret_aws,
  },
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

// ---------- Helpers ----------
async function uploadBufferToS3(buffer, key, contentType) {
  const command = new PutObjectCommand({
    Bucket: process.env.bucket_name,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });
  await s3Client.send(command);
  return key;
}

async function getSignedUrlForKey(key, expiresInSec = 300) {
  if (!key) return null;
  const cmd = new GetObjectCommand({ Bucket: process.env.bucket_name, Key: key });
  const url = await getSignedUrl(s3Client, cmd, { expiresIn: expiresInSec });
  return url;
}

async function getObjectBuffer(key) {
  const command = new GetObjectCommand({ Bucket: process.env.bucket_name, Key: key });
  const response = await s3Client.send(command);
  return streamToBuffer(response.Body);
}
function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', (chunk) => chunks.push(chunk));
    readableStream.on('end', () => resolve(Buffer.concat(chunks)));
    readableStream.on('error', reject);
  });
}

// ---------- Auth Middleware ----------
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Missing token" });
  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Invalid token format" });

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: "Forbidden: insufficient permissions" });
    }
    next();
  };
}

// ---------- AUTH ROUTES ----------

// Signup
app.post('/signup', async (req, res) => {
  try {
    const { email, password, confirmPassword, role, username } = req.body;
    if (!email || !password || !confirmPassword) return res.status(400).json({ error: "email/password required" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: "Email already exists" });

    // password check
    if (password !== confirmPassword) return res.status(400).json({ error: "Passwords do not match" });

    const user = new User({ email, password, role: role || "patient", username });
    await user.save();

    const token = jwt.sign({ email: user.email, role: user.role }, secretKey, { expiresIn: '2h' });
    res.json({ message: "registered", token, role: user.role });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error during signup" });
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });
    if (user.password !== password) return res.status(401).json({ error: "Wrong password" });

    const token = jwt.sign({ email: user.email, role: user.role }, secretKey, { expiresIn: '2h' });
    res.json({ message: "login successful", token, role: user.role }); // ✅ now includes role
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// Google Auth
// Google Auth
app.post('/google-auth', async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ error: "email required" });

    // 👇 check ANY account with this email, regardless of provider
    let user = await User.findOne({ email });
    
    if (!user) {
      // If no user, create a new one as google
      user = new User({
        email,
        username: name || email,
        provider: "google",
        role: "patient"
      });
      await user.save();
    } else if (user.provider === "local") {
      // If user exists but with local provider → just update provider if needed
      user.provider = "google";
      await user.save();
    }

    const token = jwt.sign(
      { email: user.email, role: user.role },
      secretKey,
      { expiresIn: '2h' }
    );

    res.json({ message: "Google login success", token, role: user.role });

  } catch (err) {
    console.error("Google auth error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// Forgot password
const otpStore = {};
app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "email required" });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };

    await transporter.sendMail({
      from: process.env.mailuser,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is ${otp}. It will expire in 5 minutes.`
    });

    res.json({ message: "OTP sent" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Reset password
app.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;
    if (!email || !otp || !newPassword || !confirmPassword) return res.status(400).json({ error: "Missing fields" });

    const rec = otpStore[email];
    if (!rec) return res.status(400).json({ error: "OTP not requested" });
    if (rec.expires < Date.now()) return res.status(400).json({ error: "OTP expired" });
    if (rec.otp != otp) return res.status(400).json({ error: "Invalid OTP" });
    if (newPassword !== confirmPassword) return res.status(400).json({ error: "Passwords do not match" });

    await User.updateOne({ email }, { $set: { password: newPassword } });
    delete otpStore[email];
    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ------------------- PATIENT ROUTES -------------------
app.post("/patient/upload", authMiddleware, requireRole("patient"), upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Image file is required (field name: image)" });

    const { patientName, patientId, note } = req.body;
    const key = `uploads/${Date.now()}_${req.file.originalname}`;

    await uploadBufferToS3(req.file.buffer, key, req.file.mimetype);

    const submission = new Submission({
      patientName: patientName || req.user.email,
      patientId: patientId || `PID-${Date.now()}`,
      email: req.user.email,
      note: note || "",
      originalImageKey: key,
      status: "uploaded"
    });
    await submission.save();

    res.json({ message: "Uploaded successfully", submissionId: submission._id });
  } catch (err) {
    console.error("Patient upload error:", err);
    res.status(500).json({ error: "Error uploading file" });
  }
});

app.get("/patient/history", authMiddleware, requireRole("patient"), async (req, res) => {
  try {
    const submissions = await Submission.find({ email: req.user.email }).sort({ createdAt: -1 });
    const result = await Promise.all(submissions.map(async s => ({
      id: s._id,
      note: s.note,
      date: s.createdAt,
      imageUrl: s.originalImageKey ? await getSignedUrlForKey(s.originalImageKey, 300) : null,
      annotatedImageUrl: s.annotatedImageKey ? await getSignedUrlForKey(s.annotatedImageKey, 300) : null,
      reportUrl: s.pdfKey ? await getSignedUrlForKey(s.pdfKey, 300) : null,
      status: s.status
    })));
    res.json(result);
  } catch (err) {
    console.error("Patient history error:", err);
    res.status(500).json({ error: "Error fetching history" });
  }
});

// ------------------- ADMIN ROUTES -------------------
app.get("/admin/submissions", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const submissions = await Submission.find().sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) {
    console.error("Admin submissions error:", err);
    res.status(500).json({ error: "Error fetching submissions" });
  }
});

app.post("/admin/annotate/:id", authMiddleware, requireRole("admin"), upload.single("annotated"), async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await Submission.findById(id);
    if (!submission) return res.status(404).json({ error: "Submission not found" });
    if (!req.file) return res.status(400).json({ error: "Annotated image file required (field: annotated)" });

    const key = `annotated/${Date.now()}_${req.file.originalname}`;
    await uploadBufferToS3(req.file.buffer, key, req.file.mimetype);

    submission.annotatedImageKey = key;
    submission.status = "annotated";
    await submission.save();

    res.json({ message: "Annotation saved", annotatedKey: key });
  } catch (err) {
    console.error("Annotate error:", err);
    res.status(500).json({ error: "Error saving annotation" });
  }
});

app.post("/admin/generate-report/:id", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await Submission.findById(id);
    if (!submission) return res.status(404).json({ error: "Submission not found" });

    const doc = new PDFDocument({ autoFirstPage: true });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', async () => {
      const pdfBuffer = Buffer.concat(chunks);
      const pdfKey = `reports/${Date.now()}_${submission.patientId || submission._id}.pdf`;

      await uploadBufferToS3(pdfBuffer, pdfKey, 'application/pdf');
      submission.pdfKey = pdfKey;
      submission.status = "reported";
      await submission.save();

      const reportUrl = await getSignedUrlForKey(pdfKey, 300);
      res.json({ message: "Report generated", pdfKey, reportUrl });
    });

    doc.fontSize(20).text("Patient Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Name: ${submission.patientName || "N/A"}`);
    doc.text(`Patient ID: ${submission.patientId || submission._id}`);
    doc.text(`Email: ${submission.email}`);
    doc.text(`Note: ${submission.note || ""}`);
    doc.text(`Uploaded At: ${submission.createdAt.toISOString()}`);
    doc.moveDown();

    if (submission.annotatedImageKey) {
      try {
        const imgBuffer = await getObjectBuffer(submission.annotatedImageKey);
        doc.moveDown();
        doc.image(imgBuffer, { fit: [450, 400], align: 'center' });
      } catch (err) {
        console.warn("Could not fetch annotated image for PDF:", err);
      }
    } else if (submission.originalImageKey) {
      try {
        const imgBuffer = await getObjectBuffer(submission.originalImageKey);
        doc.moveDown();
        doc.image(imgBuffer, { fit: [450, 400], align: 'center' });
      } catch (err) {
        console.warn("Could not fetch original image for PDF:", err);
      }
    }

    doc.end();
  } catch (err) {
    console.error("Generate report error:", err);
    res.status(500).json({ error: "Error generating report" });
  }
});
// Utility: Get signed URL for any S3 object
app.get("/get-url", authMiddleware, async (req, res) => {
  try {
    const { key } = req.query;
    if (!key) return res.status(400).json({ error: "Key is required" });

    const url = await getSignedUrlForKey(key, 300); // 5 minutes expiry
    res.json({ url });
  } catch (err) {
    console.error("Error getting signed URL:", err);
    res.status(500).json({ error: "Failed to get signed URL" });
  }
});



// ---------- Root ----------
app.get('/', (req, res) => res.send('Hello World!'));

// Start
app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});
