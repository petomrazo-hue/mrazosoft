# MRAZOSOFT web

Portfólio štúdia Peter Mráz — multi-page (Domov/Služby/Projekty/O mne/Kontakt), HTML/CSS/JS bez buildu, frost téma.

## Deploy
```bash
git add . && git commit -m "..." && git push
```
- **NO_AUTOPUSH pre autosync** — cron/autosync do tohto repa nepushuje (push = GitHub Pages build).
  **Od 11. 8. 2026 má Claude na mrazosoft.sk trvalé povolenie pushovať bez pýtania** (Petov pokyn,
  platí len pre tento projekt) — vždy až po zelenom `tools/qa.py` a s LIVE overením po deployi.
- Na deploy použi `/ship mrazosoft`
- Live: **mrazosoft.sk**
- GitHub: petomrazo-hue/mrazosoft (PUBLIC repo)

## Kľúčové pravidlá
- Pri každej zmene HTML/CSS/JS: **bump `?v=` vo VŠETKÝCH HTML súboroch** kde je daný súbor linkovaný
- Meno na webe konzistentne: **Peter Mráz** (nie Peto, nie Peter Mraz); Peto vystupuje ako FREELANCER — žiadne IČO/obchodné meno/sídlo na webe (19.7. výslovne odmietol)
- Žiadny build step — čistý HTML/CSS/JS
- Kontaktný formulár: POST `/api/kontakt` (CF Pages Function — honeypot, ts check, Turnstile, doručenie SEB/CF Email Routing → fallback Web3Forms env → DEV_ECHO lokálne); statický náhľad bez endpointu = mailto fallback

- **ŽIADNE CENY NA WEBE (od 11. 8. 2026).** Bez živnosti/IČO nesmie web uvádzať cenovú ponuku —
  žiadne sumy, cenníky, `Offer`/`priceRange` v JSON-LD ani objednávkové CTA. Web je portfólio.
  Čo sa odstránilo a ako to vrátiť: `CENNIK-VRATENIE.md` (tag `cennik-2026-08-11`).
  `seo-audit.html` je `noindex`, mimo menu aj sitemap — nevracať do navigácie.
- **Kurz AI Tvorca na webe NIE JE (od 11. 8. 2026, Petov pokyn).** `kurz.html`, `aikurz.html`
  a `assets/kurz/` zmazané, `/kurz` + `/aikurz` majú 301 na `/`. Nepridávať späť odkaz, kartu
  v službách ani chip v kontaktnom formulári. Produkt ako taký žije v `001projects/kurz-ai/`.

## PENDING (nespustiť do produkcie bez)
- **🔶 ROZROBENÉ — Fakturácia SAP Trade (19.7.):** Peto=freelancer, faktúry bude vystavovať Šaňova SAP Trade, s.r.o. (IČO 44 849 664, platca DPH). Hotové formulácie FAQ/ceny/zasady SK+EN čakajú v `~/LAB/003contex/mrazosoft-fakturacia-sap-trade.md` — nasadiť AŽ po Šaňovom súhlase + vyjasniť ceny s/bez DPH (pripomienka #22). Platí aj pre vetvu neo.
- **🔶 CF Pages migrácia (pripomienka #21):** hlavičky/_headers, /api/kontakt+Turnstile, Email Routing, DNS — potrebný Petov wrangler login; dovtedy formulár beží cez Web3Forms fallback v app.js.
- Vetva `oprava-2026-07` (19.7.2026): kompletná produkčná oprava rootu + príprava CF Pages — ČAKÁ na Petovo odsúhlasenie lokálnej ukážky, potom merge + CF Pages setup (projekt, Turnstile kľúče, Email Routing, DNS)
- `ANTHROPIC_API_KEY` v Firebase functions

## Kľúčové súbory
- `index.html` — Domov (splash len tu)
- `app.js` — hlavná logika, Web3Forms key, PIN chat
- `style.css` — frost design system
- `cookies.js` + `consent-core.js` — CMP (zdieľané jadro z cookie-consent projektu; od 19.7. advancedConsent:false = gtag až po súhlase, mzc-title p+role kvôli a11y — SYNC do kanonického cookie-consent repa!)
- `tools/qa.py` (QA gate, exit 1 pri kritike) + `tools/gen_sitemap.py` — spúšťať pred každým deployom
- `tools/pozicioning.py` — **volá ho `qa.py`**, takže sa nedá obísť. Stráži, že celý web hovorí
  tej istej cieľovke (majiteľ e-shopu): každá indexovaná stránka musí mať v title/h1/description
  výraz cieľovky, nesmie sľubovať inú skupinu a **nikde nesmie stáť cena** (pravidlo z 11. 8.).
  Výnimky sú v `NAVIGACNE` / `MIMO_MENU` s dôvodom; cudzia cena v deme sa priznáva atribútom
  `data-cena-ukazka="dôvod"`. Vznik 13. 8. 2026 — ceny prežili upratovanie z 11. 8. v blogovom
  článku, lebo kontrola existovala len v hlave. Čísla, podľa ktorých sa repozicioning rozhodol:
  `GSC-2026-08.md`.
- `firebase-rules.json` **NIE JE nasadený pushom** — je to len kópia toho, čo má byť vo Firebase.
  Blok `analytics` pribudol 25.6.2026 (`e0bc057`) a do konzoly sa dostal až **11.8.2026**, takže
  first-party meranie 7 týždňov ticho vracalo 401 a `/data` nemalo čo ukazovať. Po každej zmene
  tohto súboru: Firebase konzola → Realtime Database → Rules → vložiť → **Publish**, a hneď overiť
  `python3 tools/meranie-check.py` (401 = nie je nasadené; „ani jedna udalosť" = zber nebeží).
  Posledné nasadené znenie pred opravou je v `firebase-rules.nasadene-2026-08-11.bak.json`.
- **Pozor:** `analytics/.read: true` znamená, že celý denník návštev (cesty, referrery) vie cez REST
  prečítať ktokoľvek — PIN na `/data` chráni len obrazovku, nie dáta. Zámerné od 25.6., ale keď to
  má byť súkromné, treba čítanie zavrieť a dashboard prerobiť na autentifikované čítanie.
- `tools/neo-prod.py` — generuje canonical + og:url + **CSP so SHA-256 hashmi inline skriptov** pre `testovanie/`. **Po KAŽDEJ zmene inline `<script>` v testovanie/*.html ho MUSÍŠ spustiť znova**, inak CSP ten skript zablokuje a stránka spadne. Idempotentný, `--check` = dry-run. Cutover na root = zmeniť `BASE`/`DIR` hore v súbore.
- `tools/neo-verify.py` — Playwright overenie `testovanie/` (CSP porušenia, JS chyby, canonical/robots, funkčný test honeypotu). Vyžaduje bežiaci `npx serve -l 4321 .`. **Pusti pred každým deployom neo webu** — 26.7. takto chytil chýbajúci `pagead2.googlesyndication.com` v CSP, ktorý by ticho zabil meranie konverzií Google Ads (v kóde to vidieť nebolo)
- `functions/api/kontakt.js` + `wrangler.toml` + `_headers` + `_redirects` — CF Pages vrstva (od 19.7., vetva oprava-2026-07)
- URL sú extensionless (`/sluzby`), interné linky bez .html; GH Pages aj CF to servírujú
