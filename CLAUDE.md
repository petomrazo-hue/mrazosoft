# MRAZOSOFT web

Portfólio štúdia Peter Mráz — multi-page (Domov/Služby/Projekty/O mne/Kontakt), HTML/CSS/JS bez buildu, **frozen cosmos** téma (od 8.7.2026): Three.js slnečná sústava v hero na indexe, hviezdy namiesto snehu, gradient cyan→indigo→violet.

## Interná stratégia
- Audit ponuky + produktová matica + social plán: `../google-reklamy/MRAZOSOFT-AUDIT-2026-07.md` (NIKDY nekopírovať do tohto PUBLIC repa)

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
- Kontaktný formulár: Web3Forms (kľúč je v app.js — funkčný)

## PENDING (nespustiť do produkcie bez)
- `ANTHROPIC_API_KEY` v Firebase functions (PIN chat backend)
- IČO v pätičke (GDPR)

## Kľúčové súbory
- `index.html` — Domov (splash + Three.js hero sústava len tu; solar.js sa importuje dynamicky až po window.load)
- `app.js` — hlavná logika: i18n dict, initShowreel (presunuté hero video), initEmbeds (YouTube nocookie fasády), hviezdny canvas
- `assets/js/solar.js` — Three.js slnečná sústava (realistické planéty, fallbacky reduced-motion/no-WebGL cez `html.solar-fallback`)
- `assets/vendor/three.module.min.js` + `three.core.min.js` — vendorovaný three.js 0.185.1 (MIT, viď CREDITS.md)
- `assets/yt/*.jpg` — lokálne thumbnaily SkyVlog videí (GDPR click-to-load fasády na sluzby.html#video)
- `style.css` — frozen cosmos design system
- `construction.js` — "VO VÝSTAVBE" overlay (`UC_ON=true/false`); solar.js rešpektuje `window.__UC__`
- `cookies.js` + `consent-core.js` — CMP (zdieľané jadro z cookie-consent projektu)

## Služby na webe (4 kategórie, sluzby.html)
`#weby` (web 390 / starter 199 / PWA 1200 / e-shop 1200) · `#ai` (AI impl. 490 / n8n 350 / Python 250) · `#video` (dron od 290) · `#sprava` (retainer 50/mes · CMS 45/h)
