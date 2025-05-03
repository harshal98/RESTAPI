// build.js
const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    platform: "node",
    target: "node20",
    outfile: "dist/index.js",
    external: [], // Remove 'node-fetch' from here so it gets bundled
    minify: false,
    sourcemap: true,
  })
  .then(() => {
    console.log("✅ Build completed.");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
