# doc/ — lead magnety

## preco-vas-web-nezaraba.pdf

Ebook „Prečo váš web nezarába" (v1.0, júl 2026) — lead magnet pre zber emailov, landing `/web-nezaraba`.
Leady chodia cez Web3Forms (subject „Ebook lead: Prečo váš web nezarába") → Gmail + Sheet (lead pipeline).

**Zdroj:** `ebook-src.html` (A4 print CSS, self-hosted fonty z `../assets/fonts/`).

**Regenerovanie PDF** (Playwright chromium, spúšťať z priečinka s nainštalovaným playwright, napr. `001projects/tester-lab`):

```bash
node -e "
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://$PWD/doc/ebook-src.html', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.pdf({ path: 'doc/preco-vas-web-nezaraba.pdf', format: 'A4', printBackground: true, margin: {top:0,bottom:0,left:0,right:0} });
  await b.close();
})();"
```

Pozor: `background-clip:text` gradienty v PDF tlači kreslia svetlý obdĺžnik za textom — v ebooku používať plné farby (nález 26.7.2026). Headless Chrome (`--headless=new --print-to-pdf`) na Macu visí, Playwright funguje.
