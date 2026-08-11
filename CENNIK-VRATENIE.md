# Cenník je z webu dočasne preč — ako ho vrátiť

**Kedy:** 11. 8. 2026 · **Prečo:** bez živnosti/IČO nesmie web verejne uvádzať cenovú
ponuku za služby. Web je odvtedy **portfólio** — stránky služieb popisujú, čo robím,
ale neuvádzajú žiadnu sumu ani objednávku. Podklad k riešeniu identifikácie:
`IDENTIFIKACIA-ROZHODNUTIE.md`.

## Čo sa odstránilo

| Vrstva | Kde |
|---|---|
| Cenníkové mriežky | `sluzby.html`, `en/services.html`, `index.html`, `en/index.html` |
| Celá sekcia `#cena` | 7 podstránok služieb (`tvorba-web-stranok`, `tvorba-eshopov`, `pwa-aplikacie`, `prestashop-upravy`, `ai-automatizacia`, `ai-asistent`, `seo-audit`) |
| JSON-LD `Offer` / `minPrice` | tých istých 7 stránok + `kurz.html` (`Product` → `price 49`) |
| microdata `priceRange` | `index.html`, `en/index.html` |
| Sumy v title/OG/description | `seo-audit`, `ai-asistent`, `tvorba-web-stranok`, `tvorba-eshopov`, `prestashop-upravy`, `ai-automatizacia`, `pwa-aplikacie`, `sluzby`, `en/services`, `kurz` |
| Objednávkové CTA | „Objednať audit za 149 €", „Kúpiť kurz za 49 €" a odkazy naň (`pomixuje`, `web-nezaraba`, `doc/ebook-src`) |
| i18n kľúče s cenou | `app.js` — `services.*.price`, `pkg.*.price`, `pkg.note`, `services.price`, `services.from` (SK aj EN) |
| Karty Audit a Kurz | zo zoznamu služieb (`sluzby.html`, `en/services.html`) |

**Skryté, nie zmazané:** `kurz.html` a `seo-audit.html` majú `noindex,nofollow`, nie sú
v menu ani v `sitemap.xml`. Na svojich URL fungujú ďalej — dajú sa poslať linkom.

## Vrátenie

Stav tesne pred zmenou je pod tagom **`cennik-2026-08-11`**.

```bash
cd ~/LAB/001projects/mrazosoft
git revert <commit tejto zmeny>          # celé naraz
# alebo len vybrané súbory:
git checkout cennik-2026-08-11 -- sluzby.html en/services.html index.html app.js
python3 tools/qa.py && python3 tools/gen_sitemap.py   # a bumpni ?v=
```

Pred vrátením musí byť vyriešená identifikácia dodávateľa (živnosť / autorská
registrácia na daňovom úrade / fakturácia cez SAP Trade) — inak sa vracia presne ten
stav, kvôli ktorému sa cenník odstraňoval.
