import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "public")));

// API Routes - dynamically import handlers
app.post("/api/register", async (req, res) => {
  const handler = (await import("./api/register.js")).default;
  return handler(req, res);
});

app.post("/api/signin", async (req, res) => {
  const handler = (await import("./api/signin.js")).default;
  return handler(req, res);
});

app.post("/api/verify-otp", async (req, res) => {
  const handler = (await import("./api/verify-otp.js")).default;
  return handler(req, res);
});

app.post("/api/forgot-password", async (req, res) => {
  const handler = (await import("./api/forgot-password.js")).default;
  return handler(req, res);
});

// Handle 404 - serve index.html for client-side routing
app.use((req, res) => {
  if (req.path.endsWith('.html') || req.path === '/') {
    res.sendFile(path.join(__dirname, "public", req.path));
  } else {
    res.status(404).send("Not found");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 HawkGuard Dashboard Server Running`);
  console.log(`📍 Local:   http://localhost:${PORT}`);
  console.log(`📂 Public:  ${path.join(__dirname, "public")}`);
  console.log(`🔌 API:     http://localhost:${PORT}/api`);
  console.log(`\n✅ Ready to accept requests\n`);
});
