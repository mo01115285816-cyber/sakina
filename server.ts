import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini client lazily
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY is not set. AI reflection features will have a beautiful offline fallback.");
    }
    aiClient = new GoogleGenAI({ 
      apiKey: key || "PLACEHOLDER_KEY"
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies
  app.use(express.json());

  // Proxy endpoint for mp3quran reciters to bypass CORS
  app.get("/api/reciters", async (req, res) => {
    try {
      const response = await fetch("https://www.mp3quran.net/api/v3/reciters?language=ar");
      if (!response.ok) {
        throw new Error(`Failed to fetch from mp3quran: ${response.statusText}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("Proxy fetch reciters error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch reciters" });
    }
  });

  // AI-powered Quran verse Tadabbur (reflection) endpoint
  app.post("/api/quran/reflection", async (req, res) => {
    try {
      const { verseText, surahName, verseNumber, tafsirText } = req.body;
      
      if (!verseText || !surahName || !verseNumber) {
        res.status(400).json({ error: "Missing required fields: verseText, surahName, verseNumber" });
        return;
      }

      const key = process.env.GEMINI_API_KEY;
      if (!key) {
        // Beautiful fallback reflection when API key is not present
        res.json({
          reflection: `تدبر في قوله تعالى: { ${verseText} } - سورة ${surahName}، آية ${verseNumber}. تفكر في عظمة هذه الكلمات الربانية، فكل حرف في كتاب الله يحمل هداية ونوراً لطريقك، فاستلهم من معانيها السامية ما يقوي إيمانك ويرشد سلوكك اليومي.`
        });
        return;
      }

      const ai = getGeminiClient();
      const prompt = `أنت عالم مفسر فقيه متبحر في علوم القرآن الكريم وتدبر آياته العظيمة بأسلوب يمس القلوب والوجدان.
مطلوب منك صياغة خاطرة تدبرية إيمانية واحدة عميقة ومؤثرة جداً للآية الكريمة التالية وتفسيرها الميسر المرفق.

الآية الكريمة: "${verseText}"
سورة: "${surahName}"، الآية رقم: ${verseNumber}
التفسير الميسر المعتمد: "${tafsirText || "غير متوفر حالياً"}"

القواعد والتعليمات الإلزامية:
1. يجب أن تكون الخاطرة التدبرية واقعية، عملية، ومؤثرة جداً، ترشد المسلم إلى تطبيق الآية في حياته اليومية وعلاقته بربه وبنفسه وبالخلق.
2. اكتب بلغة عربية فصحى عذبة بليغة ومشرقة للغاية تخاطب الروح والقلب مباشرة.
3. ممنوع تماماً كتابة أي مقدمات (مثل: أهلاً بك، هذه خاطرة، إليك تفصيل...) أو لواحق أو تحيات، ابدأ بالخاطرة التدبرية مباشرة دون أي تمهيد.
4. صِغ الخاطرة في فقرة واحدة مكثفة ومتماسكة (لا تتجاوز 2 إلى 3 أسطر).
5. تأكد من صحة المعنى الإيماني وتوافقه مع تفسير السلف الصالح بنسبة 100%.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      const reflectionText = response.text?.trim() || "";
      res.json({ reflection: reflectionText });
    } catch (error: any) {
      console.error("Gemini reflection endpoint error:", error);
      res.status(500).json({ error: "Failed to generate AI reflection points" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
