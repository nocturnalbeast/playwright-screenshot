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
node index.js --url <webpage-url> --output <output-dir> --browser <browser-type> --config <config-file> [--dark]
```

### Options:

- `--url, -u`: URL of the webpage to capture (required)
- `--output, -o`: Output directory for screenshots (default: "screenshots")
- `--browser, -b`: Browser to use (chromium, firefox, or webkit) (default: "chromium")
- `--config, -c`: Path to viewport configuration file (required)
- `--dark, -d`: Enable dark theme for screenshots (optional)
- `--help`: Show help information

### Example:

```bash
node index.js --url https://example.com --output screenshots --browser chromium --config viewports.json --dark
```

## Configuration File Format

Create a JSON file with viewport configurations:

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

The tool will generate screenshots in the specified output directory with filenames following the pattern:
`{viewport-name}-{theme}.png` (e.g., `mobile-light.png`, `desktop-dark.png`)
