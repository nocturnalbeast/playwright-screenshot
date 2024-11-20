#!/usr/bin/env node

import { chromium, firefox, webkit } from "playwright";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const __dirname = dirname(fileURLToPath(import.meta.url));

const argv = yargs(hideBin(process.argv))
  .option("url", {
    alias: "u",
    description: "URL to capture",
    type: "string",
    demandOption: true,
  })
  .option("output", {
    alias: "o",
    description: "Output directory for screenshots",
    type: "string",
    default: "screenshots",
  })
  .option("dark", {
    alias: "d",
    description: "Enable dark theme for screenshots",
    type: "boolean",
    default: false,
  })
  .option("browser", {
    alias: "b",
    description: "Browser to use (chromium, firefox, or webkit)",
    type: "string",
    default: "chromium",
    choices: ["chromium", "firefox", "webkit"],
  })
  .option("config", {
    alias: "c",
    description: "Path to viewport configuration JSON file",
    type: "string",
    demandOption: true,
  })
  .help().argv;

const configPath = argv.config;
if (!existsSync(configPath)) {
  console.error(`Error: Config file "${configPath}" does not exist!`);
  process.exit(1);
}

const config = JSON.parse(readFileSync(configPath, "utf8"));
if (!Array.isArray(config.viewports)) {
  console.error("Error: Config file must contain a 'viewports' array!");
  process.exit(1);
}

async function captureScreenshots(url, outputDir, darkMode, browserName) {
  const outputPath = join(__dirname, outputDir);
  if (!existsSync(outputPath)) {
    console.error(`Error: Output directory "${outputPath}" does not exist!`);
    process.exit(1);
  }

  const browsers = { chromium, firefox, webkit };
  const browserType = browsers[browserName];

  if (!browserType) {
    throw new Error(`Unsupported browser type: ${browserName}`);
  }

  const browser = await browserType.launch();
  const context = await browser.newContext({
    colorScheme: darkMode ? "dark" : "light",
  });
  const page = await context.newPage();

  console.log(
    `Taking screenshots of ${url} using ${browserName} (${
      darkMode ? "dark" : "light"
    } mode)`
  );

  for (const viewport of config.viewports) {
    console.log(
      `Capturing ${viewport.name} viewport (${viewport.width}x${viewport.height})`
    );

    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });

    await page.goto(url, { waitUntil: "networkidle" });

    const theme = darkMode ? "dark" : "light";
    await page.screenshot({
      path: join(outputPath, `${viewport.name}-${theme}.png`),
      fullPage: true,
    });
  }

  await browser.close();
  console.log("Screenshots captured successfully!");
}

captureScreenshots(argv.url, argv.output, argv.dark, argv.browser).catch(
  console.error
);
