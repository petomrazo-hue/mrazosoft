# MRAZOSOFT — prezentačná web stránka

Reprezentačné portfólio softvérového štúdia **MRAZOSOFT** (Peto Mráz). Prezentuje produkčné projekty a ponúka spoluprácu.

- **Tech:** čistý HTML / CSS / JS — žiadny framework, **žiadny build krok**
- **Dizajn:** tmavá „frost" téma (ľadovo-modrý gradient — odkaz na meno *Mráz*), glassmorphism karty
- **Jazyky:** slovenčina + angličtina (prepínač SK/EN, voľba sa pamätá v `localStorage`)
- **PWA-ready:** `manifest.json` + SVG ikona

## Štruktúra

```
mrazosoft/
├── index.html       — celá stránka (hero, služby, projekty, o nás, kontakt)
├── style.css        — frost dark téma, responsive grid
├── app.js           — i18n SK/EN, scroll-reveal, rok v pätičke
├── manifest.json    — PWA manifest
├── assets/
│   ├── logo.svg     — wordmark MRAZOSOFT + snehová vločka
│   ├── favicon.svg  — vločka (favicon / ikona)
│   └── projects/    — (voliteľné) reálne screenshoty projektov
└── README.md
```

## Spustenie lokálne

Stačí otvoriť `index.html` v prehliadači, alebo cez lokálny server:

```bash
cd /Users/petomraz/LAB/001projects/mrazosoft
python3 -m http.server 8080
# → http://localhost:8080
```

## Prezentované projekty

Rytmiko · Harmony Home · FleetView · ESOL Homeboost · Heureka Patcher.

## Ako pridať projekt

1. V `index.html` skopíruj jednu `<article class="card project">` v sekcii `#projects` a uprav názov, tagline (`data-i18n`), tagy, status a odkaz.
2. Pridaj preklad pre nový `data-i18n` kľúč do **oboch** jazykov v `app.js` (`i18n.sk` aj `i18n.en`).
3. Voliteľne pridaj farebnú dlaždicu: nová `.thumb-<nazov>` trieda v `style.css` (gradient), alebo vlož reálny screenshot do `assets/projects/`.

## Nasadenie

Stránka je statická a deploy-ready (napr. Netlify drag&drop alebo `netlify deploy`). Samotné nasadenie zatiaľ nie je súčasťou — pripravené na vyžiadanie.
