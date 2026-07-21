/**
 * Vercel Serverless API Entry Point
 * 
 * يقوم بتشغيل خادم Express كـ Serverless Function على Vercel
 * جميع مسارات API تبدأ بـ /api/*
 */

import express from "express";
import serverless from "serverless-http";
import recitersRouter from "../src/server/routes/reciters";
import quranReflectionRouter from "../src/server/routes/quran-reflection";
import sakeenahAiRouter from "../src/server/routes/sakeenah-ai";

const app = express();

// Middleware
app.use(express.json());

// API Routes — كلها تحت /api/ مباشرة
app.use("/api", recitersRouter);
app.use("/api/quran", quranReflectionRouter);
app.use("/api/sakeenah-ai", sakeenahAiRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "sakina", version: "0.1.0" });
});

// تصدير الـ Handler الخاص بـ Vercel
export const handler = serverless(app);

// للاختبار المحلي
export default app;
