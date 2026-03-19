import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const publicUrl = (process.env.PUBLIC_URL || env.PUBLIC_URL || "/").trim();
  const base = publicUrl.endsWith("/") ? publicUrl : `${publicUrl}/`;
  const reactAppEnv = Object.fromEntries(
    Object.entries(env).filter(([key]) => key.startsWith("REACT_APP_")),
  );
  const processEnvCompat = {
    ...reactAppEnv,
    NODE_ENV: mode,
  };

  return {
    base,
    plugins: [react(), tsconfigPaths()],
    define: {
      global: "globalThis",
      // Preserve existing process.env.REACT_APP_* usage without touching app code.
      "process.env": processEnvCompat,
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
