import 'dotenv/config';
// Main server entry point: sets up Express, CORS, request logging, wires
// in the routes, then starts listening. Run this to start the app.
import express, {NextFunction, type Request, Response} from "express";
import cors                                            from "cors";
import {registerRoutes}                                from "./routes";
import {log, serveStatic, setupVite}                   from "./vite";

const app = express();

// --- CORS configuration for Google OAuth and dev localhost ---
const corsOrigins = [
    process.env.CORS_ORIGIN,
    'https://accounts.google.com',
    'http://localhost:5000',
].filter((origin): origin is string => typeof origin === 'string');

app.use(cors({
                 origin:         corsOrigins,
                 credentials:    true,
                 methods:        ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                 allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
             }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- Request logging middleware ---
app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined;
    
    // Monkey-patch res.json so we can log what each API response actually
    // sent back, without changing how any route handler works.
    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res,
                                     [bodyJson, ...args]);
    };
    
    res.on("finish",
           () => {
               const duration = Date.now() - start;
               if (path.startsWith("/api")) {
                   let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
                   if (capturedJsonResponse) logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
                   if (logLine.length > 80) logLine = logLine.slice(0,
                                                                    79) + "…";
                   log(logLine);
               }
           });
    
    next();
});

(
    async () => {
        const server = await registerRoutes(app);
        
        // --- Global error handler ---
        app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
            const status = err.status || err.statusCode || 500;
            const message = err.message || "Internal Server Error";
            
            res.status(status).json({ message });
            throw err;
        });
        
        // --- Setup Vite in development, static serving in production ---
        if (process.env.NODE_ENV === "development") {
            await setupVite(app,
                            server);
        } else {
            serveStatic(app);
        }
        
        // --- Port and host selection ---
        const port = Number(process.env.PORT) || 3000;
        const host = process.platform === "win32" ? (
            process.env.HOST || "127.0.0.1"
        ) : "0.0.0.0";
        
        server.listen(port, host, () => {
            log(`Server listening on ${host}:${port} [NODE_ENV=${process.env.NODE_ENV}]`);
        });
        
        
        // --- Graceful shutdown ---
        const shutdown = () => {
            log("Shutting down server...");
            server.close(() => process.exit(0));
        };
        
        process.on("SIGINT",
                   shutdown);
        process.on("SIGTERM",
                   shutdown);
    }
)();
