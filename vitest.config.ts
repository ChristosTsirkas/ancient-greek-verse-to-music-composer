import {defineConfig} from "vitest/config";
import path           from "path";

export default defineConfig({
    esbuild: {
        jsx: "automatic",
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "client/src"),
            "@shared": path.resolve(__dirname, "shared"),
        },
    },
    test: {
        environment: "node",
        include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
        setupFiles: ["tests/setup.ts"],
        coverage: {
            provider: "v8",
            reporter: ["text", "html"],
            exclude: [
                "**/*.d.ts",
                "**/node_modules/**",
                "**/tests/**",
                "**/server/services/midi-generator.ts",
                "**/client/src/components/experimental-panel.tsx",
            ],
        },
    },
});
