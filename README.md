# Accessibility Audit Tool

An automated accessibility testing tool built with Playwright and axe-core, designed to scan websites for WCAG accessibility violations and generate a detailed, color-coded HTML report.

## Features

- Scans one or multiple websites/pages for accessibility violations
- Uses [axe-core](https://github.com/dequelabs/axe-core), an industry-standard accessibility testing engine
- Generates a human-readable HTML report showing:
  - Violation severity (critical, serious, moderate, minor)
  - Affected element selectors
  - Raw HTML of the affected elements
- Built with Playwright + TypeScript

## Why I Built This

As part of learning Playwright for QA automation, I wanted to go beyond basic UI testing and explore how automated tools can catch real accessibility issues. I tested this tool against a live production website and found genuine, actionable accessibility bugs — including a site-wide issue where a logo link lacked accessible text across multiple pages.

## Tech Stack

- [Playwright](https://playwright.dev/) — browser automation
- [@axe-core/playwright](https://github.com/dequelabs/axe-core-npm) — accessibility scanning engine
- TypeScript

## Setup

1. Clone this repository
```bash
   git clone <your-repo-url>
   cd accessibility-audit-tool
```

2. Install dependencies
```bash
   npm install
```

3. Install Playwright browsers
```bash
   npx playwright install
```

## Usage

1. Open `tests/scan.spec.ts` and edit the `websitesToScan` array with the URLs you want to test:
```typescript
   const websitesToScan = [
     'https://example.com',
     'https://example.com/about',
   ];
```

2. Run the scan
```bash
   npx playwright test scan.spec.ts --project=chromium --workers=1
```

3. Open the generated report
## Sample Finding

While testing against a real hospital website, this tool identified a recurring issue across multiple pages: a logo link with no discernible text for screen readers (`alt=""` on the only child image). Because the logo appears in the shared site header, this single fix would resolve the accessibility gap site-wide — a good example of how automated scanning can surface high-impact, low-effort fixes.

## Future Improvements

- [ ] Add support for scanning an entire sitemap automatically
- [ ] Group and highlight duplicate violations across pages
- [ ] Add CI/CD integration (GitHub Actions) for scheduled scans
- [ ] Export reports in JSON/CSV for further analysis