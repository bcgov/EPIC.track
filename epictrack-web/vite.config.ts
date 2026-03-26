import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(async ({ mode }) => {
  const { default: istanbul } = await import("vite-plugin-istanbul");
  const env = loadEnv(mode, process.cwd(), "");
  const publicUrl = (process.env.PUBLIC_URL || env.PUBLIC_URL || "/").trim();
  const base = publicUrl.endsWith("/") ? publicUrl : `${publicUrl}/`;

  return {
    base,
    plugins: [
      react(),
      tsconfigPaths(),
      istanbul({
        include: "src/**/*",
        extension: [".js", ".jsx", ".ts", ".tsx"],
        cypress: true,
      }),
    ],
    define: {
      global: "globalThis",
    },
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: "globalThis",
        },
      },
    },
    build: {
      // Keep CRA-compatible output folder expected by Docker/deployment.
      outDir: "build",
      emptyOutDir: true,
    },
    server: {
      port: Number(env.PORT) || 3000,
    },
    test: {
      environment: "jsdom",
      setupFiles: ["./src/setupTests.ts"],
      passWithNoTests: true,
    },
  };
});
