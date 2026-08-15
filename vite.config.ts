import {defineConfig}  from "vite";
import react           from "@vitejs/plugin-react";
import path            from "path";
import {fileURLToPath} from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
                                plugins: [
                                    react(),
                                ],
                                resolve: {
                                    alias: {
                                        "@":       path.resolve(__dirname,
                                                                "client/src"),
                                        "@shared": path.resolve(__dirname,
                                                                "shared"),
                                    },
                                },
                                // Exposes the server-side GDPR_DPO_EMAIL env var to client
                                // code at build time, under a fixed global name -- keeps
                                // the env var itself un-prefixed (GDPR_DPO_EMAIL, not
                                // VITE_GDPR_DPO_EMAIL) since it's also read server-side.
                                // See docs/TODO.md, "GDPR_DPO_EMAIL / EMAIL_ADDRESS_FOR_
                                // UNLIMITED_USAGE env vars."
                                define:  {
                                    __GDPR_DPO_EMAIL__: JSON.stringify(process.env.GDPR_DPO_EMAIL || ""),
                                },
                                root:    path.resolve(__dirname,
                                                      "client"),
                                build:   {
                                    outDir:      path.resolve(__dirname,
                                                              "dist/public"),
                                    emptyOutDir: true,
                                },
                                server:  {
                                    fs: {
                                        strict: true,
                                        deny:   ["**/.*"],
                                    },
                                },
                            });
