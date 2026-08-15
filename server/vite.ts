import 'dotenv/config';
// Dev-mode Vite middleware (setupVite) and production static-file serving
// (serveStatic) - index.ts picks one based on NODE_ENV. log() is the
// timestamped console logger used across the backend.
import express, {type Express} from "express";
import fs                      from "fs";
import path                    from "path";
import {type Server}           from "http";

export function log(message: string, source = "express") {
    const formattedTime = new Date().toLocaleTimeString("en-US",
                                                        {
                                                            hour:   "numeric",
                                                            minute: "2-digit",
                                                            second: "2-digit",
                                                            hour12: true,
                                                        });
    
    console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
    // Vite is development-only. Dynamic imports keep it (and the Vite config)
    // out of the production server's runtime dependency path.
    // Keep module specifiers non-literal so esbuild does not hoist these
    // development-only packages into the production server entry module.
    const viteModule = "vite";
    const configModule = "../vite.config";
    const nanoidModule = "nanoid";
    const {createServer: createViteServer, createLogger} = await import(viteModule);
    const {default: viteConfig} = await import(configModule);
    const {nanoid} = await import(nanoidModule);
    const viteLogger = createLogger();
    const vite = await createViteServer({
                                            ...viteConfig,
                                            configFile:   false,
                                            customLogger: {
                                                ...viteLogger,
                                                error: (msg: string, options?: any) => {
                                                    viteLogger.error(msg,
                                                                     options);
                                                    process.exit(1);
                                                },
                                            },
                                            server:       {
                                                middlewareMode: true,
                                                hmr:            { server },
                                                allowedHosts:   true,
                                            },
                                            appType:      "custom",
                                        });
    
    app.use(vite.middlewares);
    app.use("*",
            async (req, res, next) => {
                const url = req.originalUrl;
                
                try {
                    const clientTemplate = path.resolve(
                        import.meta.dirname,
                        "..",
                        "client",
                        "index.html",
                    );
                    
                    // always reload the index.html file from disk in case it changes
                    let template = await fs.promises.readFile(clientTemplate,
                                                              "utf-8");
                    // Cache-bust the entry script on every request so browser dev tools
                    // never serve a stale cached version during hot-reload.
                    template = template.replace(
                        `src="/src/main.tsx"`,
                        `src="/src/main.tsx?v=${nanoid()}"`,
                    );
                    const page = await vite.transformIndexHtml(url,
                                                               template);
                    res.status(200).set({ "Content-Type": "text/html" }).end(page);
                }
                catch (e) {
                    vite.ssrFixStacktrace(e as Error);
                    next(e);
                }
            });
}

export function serveStatic(app: Express) {
    const distPath = path.resolve(import.meta.dirname,
                                  "public");
    
    if (!fs.existsSync(distPath)) {
        throw new Error(
            `Could not find the build directory: ${distPath}, make sure to build the client first`,
        );
    }
    
    app.use(express.static(distPath));
    
    // fall through to index.html if the file doesn't exist
    app.use("*",
            (_req, res) => {
                res.sendFile(path.resolve(distPath,
                                          "index.html"));
            });
}
