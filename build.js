/* eslint-disable no-console */
const esbuild = require("esbuild");

const isWatch = process.argv.includes("--watch");

/** @type {import('esbuild').BuildOptions} */
const options = {
  entryPoints: ["code.ts"],
  bundle: true,
  outfile: "code.js",
  platform: "browser",
  target: ["es2017"],
  define: {
    __FIGMA_TOKEN__: JSON.stringify(process.env.FIGMA_TOKEN || ""),
  },
};

async function run() {
  if (isWatch) {
    const ctx = await esbuild.context(options);
    await ctx.watch();
    console.log("esbuild watching...");
  } else {
    await esbuild.build(options);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
