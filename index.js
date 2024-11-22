#!/usr/bin/env node

import { chromium, firefox, webkit } from "playwright";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import chalk from "chalk";

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
    description: "Output directory for screenshots/PDFs",
    type: "string",
    default: "screenshots",
  })
  .option("pdf", {
    alias: "p",
    description: "Additionally export as PDF (only works with Chromium)",
    type: "boolean",
    default: false,
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
  .option("zoom", {
    alias: "z",
    description: "Zoom level for the page (e.g., 1.5 for 150% zoom)",
    type: "number",
    default: 1.0,
    coerce: (value) => {
      if (value <= 0) {
        throw new Error("Zoom level must be greater than 0");
      }
      return value;
    },
  })
  .option("delay", {
    description: "Delay in milliseconds before taking each screenshot",
    type: "number",
    default: 0,
    coerce: (value) => {
      if (value < 0) {
        throw new Error("Delay must be non-negative");
      }
      return value;
    },
  })
  .option("config", {
    alias: "c",
    description: "Path to viewport configuration JSON file",
    type: "string",
    demandOption: true,
  })
  .check((argv) => {
    if (argv.pdf && argv.browser !== "chromium") {
      throw new Error("PDF export is only supported with Chromium browser");
    }
    return true;
  })
  .help().argv;

const configPath = argv.config;
if (!existsSync(configPath)) {
  console.error(
    chalk.red("Error:"),
    `Config file "${configPath}" does not exist!`
  );
  process.exit(1);
}

const config = JSON.parse(readFileSync(configPath, "utf8"));
if (!Array.isArray(config.viewports)) {
  console.error(
    chalk.red("Error:"),
    'Config file must contain a "viewports" array!'
  );
  process.exit(1);
}

async function captureScreenshots(
  url,
  outputDir,
  darkMode,
  browserName,
  zoomLevel,
  delay
) {
  const outputPath = join(__dirname, outputDir);
  if (!existsSync(outputPath)) {
    console.error(
      '\x1b[31mError:\x1b[0m Output directory "%s" does not exist!',
      outputPath
    );
    process.exit(1);
  }

  const browsers = { chromium, firefox, webkit };
  const browserType = browsers[browserName];

  if (!browserType) {
    throw new Error(chalk.red(`Unsupported browser type: ${browserName}`));
  }

  const browser = await browserType.launch();
  const context = await browser.newContext({
    colorScheme: darkMode ? "dark" : "light",
  });
  const page = await context.newPage();

  console.info(
    chalk.blue("Taking screenshots:"),
    `${url} using ${browserName} (${darkMode ? "dark" : "light"} mode, ${
      zoomLevel * 100
    }% zoom${delay ? `, ${delay}ms delay` : ""})`
  );

  for (const viewport of config.viewports) {
    console.info(
      chalk.blue("Processing:"),
      `${viewport.name} viewport (${viewport.width}x${viewport.height})`
    );

    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });

    await page.goto(url, { waitUntil: "networkidle" });

    await page.evaluate(`document.body.style.zoom=${zoomLevel}`);

    if (delay > 0) {
      console.warn(chalk.yellow("Waiting:"), `${delay}ms before capture...`);
      await page.waitForTimeout(delay);
    }

    const theme = darkMode ? "dark" : "light";
    await page.screenshot({
      path: join(outputPath, `${viewport.name}-${theme}.png`),
      fullPage: true,
    });
  }

  await browser.close();
  console.info(chalk.green("Screenshots captured successfully!"));
}

async function exportPdf(url, outputDir, darkMode, zoomLevel, delay) {
  const outputPath = join(__dirname, outputDir);
  if (!existsSync(outputPath)) {
    console.error(`Error: Output directory "${outputPath}" does not exist!`);
    process.exit(1);
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({
    colorScheme: darkMode ? "dark" : "light",
  });
  const page = await context.newPage();

  console.info(
    chalk.blue("Exporting PDF:"),
    `using chromium (${darkMode ? "dark" : "light"} mode, ${
      zoomLevel * 100
    }% zoom${delay ? `, ${delay}ms delay` : ""})`
  );

  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(`document.body.style.zoom=${zoomLevel}`);

  if (delay > 0) {
    console.warn(chalk.yellow("Waiting:"), `${delay}ms before capture...`);
    await page.waitForTimeout(delay);
  }

  const theme = darkMode ? "dark" : "light";
  await page.pdf({
    path: join(outputPath, `output-${theme}.pdf`),
    format: "Letter",
    printBackground: true,
  });

  await browser.close();
  console.info(chalk.green("PDF export completed successfully!"));
}

async function main() {
  try {
    await captureScreenshots(
      argv.url,
      argv.output,
      argv.dark,
      argv.browser,
      argv.zoom,
      argv.delay
    );

    if (argv.pdf) {
      await exportPdf(argv.url, argv.output, argv.dark, argv.zoom, argv.delay);
    }
  } catch (error) {
    console.error(chalk.red("Error:"), error.message);
    process.exit(1);
  }
}

main();
