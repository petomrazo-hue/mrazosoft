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
- Meno na webe konzistentne: **Peter Mráz** (nie Peto, nie Peter Mraz)
- Žiadny build step — čistý HTML/CSS/JS
- Kontaktný formulár: Web3Forms (`WEB3FORMS_KEY` v app.js — PENDING doplniť)

## PENDING (nespustiť do produkcie bez)
- `WEB3FORMS_KEY` v app.js
- `ANTHROPIC_API_KEY` v Firebase functions
- IČO v pätičke (GDPR)

## Kľúčové súbory
- `index.html` — Domov (splash len tu)
- `app.js` — hlavná logika, Web3Forms key, PIN chat
- `style.css` — frost design system
- `construction.js` — "VO VÝSTAVBE" overlay (`UC_ON=true/false`)
- `cookies.js` + `consent-core.js` — CMP (zdieľané jadro z cookie-consent projektu)
