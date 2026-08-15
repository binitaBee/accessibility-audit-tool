import { test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as fs from 'fs';

const websitesToScan = [
  'https://nsh.com.bd/',
  'https://nsh.com.bd/about',
  'https://nagorikhospital.com/lab-tests',
  'https://nsh.com.bd/verify-virtual-card',
  'https://nsh.com.bd/pregnancy-due-calculator',

];

let allResults: any[] = [];

for (const url of websitesToScan) {
  test(`accessibility scan: ${url}`, async ({ page }) => {
    await page.goto(url);

    const results = await new AxeBuilder({ page }).analyze();

    allResults.push({
      url: url,
      violations: results.violations,
    });

    console.log(`Scanned ${url}: ${results.violations.length} violations found`);
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
    </style>
  </head>
  <body>
    <h1>Accessibility Audit Report</h1>
  `;

  data.forEach((site) => {
    html += `<div class="site"><h2>${site.url}</h2>`;
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