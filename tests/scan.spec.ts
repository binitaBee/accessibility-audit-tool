import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as fs from 'fs';

const configData = fs.readFileSync('config.json', 'utf-8');
const config = JSON.parse(configData);
const websitesToScan: string[] = config.websitesToScan;

let allResults: any[] = [];

for (const url of websitesToScan) {
  test(`accessibility scan: ${url}`, async ({ page }) => {
    try {
      await page.goto(url, { timeout: 15000 });
    } catch (error) {
      console.log(`❌ Could not load ${url}: ${(error as Error).message}`);
      allResults.push({
        url: url,
        violations: [],
        loadError: true,
      });
      throw new Error(`Page failed to load: ${url}`);
    }

    const results = await new AxeBuilder({ page }).analyze();

    allResults.push({
      url: url,
      violations: results.violations,
    });

    console.log(`Scanned ${url}: ${results.violations.length} violations found`);

    const highImpactViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    if (highImpactViolations.length > 0) {
      console.log(
        `⚠️  Found ${highImpactViolations.length} high-impact violation(s) on ${url}`
      );
    }

    expect(highImpactViolations.length).toBe(0);
  });
}

test.afterAll(async () => {
  generateHtmlReport(allResults);
});

function generateHtmlReport(data: any[]) {
  let html = `
  <html>
  <head>
    <title>Accessibility Audit Report</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h1 { color: #333; }
      .site { margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
      .violation { margin: 10px 0; padding: 10px; border-radius: 5px; }
      .critical { background: #fdd; border-left: 5px solid red; }
      .serious { background: #fee5cc; border-left: 5px solid orange; }
      .moderate { background: #fff8cc; border-left: 5px solid #d4b800; }
      .minor { background: #e6f2ff; border-left: 5px solid #3399ff; }
      .load-error { background: #f0f0f0; border-left: 5px solid #888; padding: 10px; }
    </style>
  </head>
  <body>
    <h1>Accessibility Audit Report</h1>
  `;

  data.forEach((site) => {
    html += `<div class="site"><h2>${site.url}</h2>`;

    if (site.loadError) {
      html += `<div class="load-error">⚠️ This page could not be loaded (unreachable or timed out)</div>`;
      html += `</div>`;
      return;
    }

    html += `<p>Total violations: ${site.violations.length}</p>`;

    site.violations.forEach((v: any) => {
      let nodesHtml = '';
      v.nodes.forEach((node: any) => {
        nodesHtml += `
          <div style="background:#fff; margin:8px 0; padding:8px; border:1px solid #ccc; border-radius:4px; font-family:monospace; font-size:13px;">
            <strong>Selector:</strong> ${node.target.join(', ')}<br>
            <strong>HTML:</strong> ${node.html.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
          </div>
        `;
      });

      html += `
        <div class="violation ${v.impact}">
          <strong>[${v.impact}]</strong> ${v.description}<br>
          <small>Affected elements: ${v.nodes.length}</small>
          ${nodesHtml}
        </div>
      `;
    });

    html += `</div>`;
  });

  html += `</body></html>`;

  fs.writeFileSync('accessibility-report.html', html);
  console.log('Report generated: accessibility-report.html');
}