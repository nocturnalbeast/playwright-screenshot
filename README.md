# playwright-screenshot

A command-line tool to capture screenshots of web pages at multiple viewport sizes using Playwright.

## Installation

1. Clone this repository
2. Install dependencies:
```bash
npm install
```
3. Install browser dependencies:
```bash
npm run install-browsers
```

## Usage

```bash
node index.js --url <webpage-url> [options]
```

### Options:

- `--url, -u`: URL of the webpage to capture (required)
- `--output, -o`: Output directory for screenshots/PDFs (default: "screenshots")
- `--dark, -d`: Enable dark theme for captures (default: false)
- `--browser, -b`: Browser to use (chromium, firefox, or webkit) (default: "chromium")
- `--zoom, -z`: Zoom level for the page (e.g., 1.5 for 150% zoom) (default: 1.0)
- `--delay`: Delay in milliseconds before taking each capture (default: 0)
- `--config, -c`: Path to viewport configuration file (required)
- `--pdf, -p`: Additionally export as PDF (only works with Chromium) (default: false)
- `--help`: Show help information

### Example:

```bash
node index.js --url https://example.com --output captures --browser firefox --dark --zoom 1.2 --delay 1000 --config viewports.json --pdf
```

## Configuration File Format

Create a JSON file (e.g., `viewports.json`) with your viewport configurations:

```json
{
	"viewports": [
		{
			"name": "mobile",
			"width": 375,
			"height": 667
		},
		{
			"name": "tablet",
			"width": 768,
			"height": 1024
		},
		{
			"name": "desktop",
			"width": 1920,
			"height": 1080
		}
	]
}
```

## Output

### Screenshots
Screenshots are saved in the specified output directory with filenames following the pattern:
`{viewport-name}-{theme}.png` (e.g., `mobile-light.png`, `desktop-dark.png`)

### PDFs
When using the `--pdf` option (Chromium only), a single PDF is generated in Letter format (8.5" x 11") with the filename following the pattern:
`output-{theme}.pdf` (e.g., `output-light.pdf`, `output-dark.pdf`)
