# MRAZOSOFT web

Portfólio štúdia Peter Mráz — multi-page (Domov/Služby/Projekty/O mne/Kontakt), HTML/CSS/JS bez buildu, frost téma.

## Deploy
```bash
git add . && git commit -m "..." && git push
```
- **NO_AUTOPUSH** — push = GitHub Pages build (deploy ručne, NIE cez autosync)
- Na deploy použi `/ship mrazosoft`
- Live: **mrazosoft.sk**
- GitHub: petomrazo-hue/mrazosoft (PUBLIC repo)

## Kľúčové pravidlá
- Pri každej zmene HTML/CSS/JS: **bump `?v=` vo VŠETKÝCH HTML súboroch** kde je daný súbor linkovaný
- Meno na webe konzistentne: **Peter Mráz** (nie Peto, nie Peter Mraz); Peto vystupuje ako FREELANCER — žiadne IČO/obchodné meno/sídlo na webe (19.7. výslovne odmietol)
- Žiadny build step — čistý HTML/CSS/JS
- Kontaktný formulár: POST `/api/kontakt` (CF Pages Function — honeypot, ts check, Turnstile, doručenie SEB/CF Email Routing → fallback Web3Forms env → DEV_ECHO lokálne); statický náhľad bez endpointu = mailto fallback

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
- `functions/api/kontakt.js` + `wrangler.toml` + `_headers` + `_redirects` — CF Pages vrstva (od 19.7., vetva oprava-2026-07)
- URL sú extensionless (`/sluzby`), interné linky bez .html; GH Pages aj CF to servírujú
