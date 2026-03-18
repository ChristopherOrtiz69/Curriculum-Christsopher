import compression from "compression";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");
const storagePath = path.join(__dirname, "storage", "contact-messages.ndjson");
const port = Number.parseInt(process.env.PORT ?? "3000", 10);

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        formAction: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "https://fonts.googleapis.com"]
      }
    },
    crossOriginEmbedderPolicy: false
  })
);

app.use(compression());
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: false, limit: "20kb" }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    message: "Demasiadas solicitudes. Intenta nuevamente en unos minutos."
  }
});

app.use("/api", apiLimiter);

const contactSchema = z.object({
  name: z.string().trim().min(2, "Nombre demasiado corto").max(80),
  email: z.string().trim().email("Email invalido").max(120),
  message: z.string().trim().min(20, "Mensaje muy corto").max(1400),
  company: z.string().trim().max(120).optional().default("")
});

app.get("/api/health", (_request, response) => {
  response.status(200).json({
    ok: true,
    service: "cv-backend",
    timestamp: new Date().toISOString()
  });
});

app.post("/api/contact", async (request, response) => {
  const parsed = contactSchema.safeParse(request.body ?? {});

  if (!parsed.success) {
    return response.status(400).json({
      ok: false,
      message: "Revisa los campos del formulario.",
      errors: parsed.error.flatten().fieldErrors
    });
  }

  const { company, ...data } = parsed.data;

  // Honeypot field: bots often fill this hidden input.
  if (company.length > 0) {
    return response.status(200).json({
      ok: true,
      message: "Mensaje recibido."
    });
  }

  const record = {
    ...data,
    createdAt: new Date().toISOString(),
    ip: request.ip,
    userAgent: request.get("user-agent") ?? "unknown"
  };

  try {
    await fs.mkdir(path.dirname(storagePath), { recursive: true });
    await fs.appendFile(storagePath, `${JSON.stringify(record)}\n`, "utf8");

    return response.status(201).json({
      ok: true,
      message: "Gracias por tu mensaje. Te respondere pronto."
    });
  } catch (error) {
    console.error("Error storing contact message:", error);
    return response.status(500).json({
      ok: false,
      message: "No fue posible enviar el mensaje en este momento."
    });
  }
});

app.use(
  express.static(publicDir, {
    extensions: ["html"],
    etag: true,
    maxAge: "1h"
  })
);

app.get("*", (_request, response) => {
  response.sendFile(path.join(publicDir, "index.html"));
});

app.listen(port, () => {
  console.log(`CV app running at http://localhost:${port}`);
});
