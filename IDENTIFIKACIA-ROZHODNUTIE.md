# Identifikácia prevádzkovateľa na mrazosoft.sk — podklad na rozhodnutie

## Rozhodovací podklad (5 riadkov)

1. **Dnešný stav je vedomé rozhodnutie, nie opomenutie** — 19. 7. 2026 ste povedali
   „žiadne IČO/obchodné meno/sídlo na webe" a v pätičke je len *„Prevádzkovateľ:
   Peter Mráz · Poprad, Slovensko"*. Nič som na tom nezmenil.
2. **Variant A — SAP Trade, s.r.o. (Šaňova firma):** klient dostane riadnu faktúru
   od platcu DPH, vy nemusíte zakladať živnosť ani riešiť DPH. Cena: **čakáte na
   Šaňov súhlas** a musíte rozhodnúť, či ceny na webe (199 / 390 / 1 200 / 149 €)
   sú **s DPH alebo bez** — dnes to na webe nie je napísané nikde.
3. **Variant B — vlastná živnosť:** ste nezávislý od Šaňa a ceny ostávajú konečné bez
   DPH, kým obrat nepresiahne **50 000 €/rok** (vtedy sa platcom stávate od 1. januára
   nasledujúceho roka; pri **62 500 €** okamžite — overené 4. 8. 2026). Cena: ohlásenie
   voľnej živnosti **elektronicky cez slovensko.sk je zadarmo** (osobne 5 € za živnosť),
   pár dní vybavenia; navyše zdravotné odvody hneď a sociálne od druhého roka.
4. **Variant C — nechať tak a predávať cez Lemon Squeezy:** pri platbe kartou je
   oficiálnym **predajcom Lemon Squeezy** (Merchant of Record) — oni vystavia faktúru,
   odvedú EÚ DPH a sú uvedení na doklade. Na predaj Auditu 149 € a Kurzu 49 €
   **nepotrebujete IČO vôbec** a webu stačí dnešná pätička. Vám chodí výplata.
5. **Moje odporúčanie ako CEO:** ísť **C teraz** (odblokuje predaj tento týždeň,
   nula administratívy) a **A alebo B až keď príde prvá väčšia zákazka na faktúru** —
   živnosť sa dá založiť za pár dní, kým sa dohaduje rozsah projektu. Rozhodovať to
   dnes je predčasná optimalizácia; chýbajúci predaj je akútnejší problém než chýbajúce IČO.

> Právne k C: pri službách objednaných na diaľku od fyzickej osoby-nepodnikateľa je
> aj tak slušnosť (a pri opakovanom predaji povinnosť) uviesť, kto je dodávateľ.
> Preto pri variante C odporúčam **aspoň vetu „Platbu spracúva Lemon Squeezy, LLC
> ako oficiálny predajca"** pri tlačidle — pripravím ju spolu s checkout URL.

---

## Ako sa to nasadí (jeden príkaz, po vašom rozhodnutí)

Pripravil som `tools/ident.py`. Doplní **naraz a konzistentne**:

- riadok identifikácie v pätičke **všetkých 25 HTML** (SK aj EN),
- novú stránku **`/fakturacia`** so zákonnými údajmi (kto dodáva, kto fakturuje,
  ceny, platba, dodanie, reklamácie, odstúpenie do 14 dní, SOI),
- odkaz **„Fakturačné údaje"** do právnej navigácie v pätičke,
- riadok o príjemcovi do **`zasady.html` §4** (len variant SAP Trade).

```bash
cd ~/LAB/001projects/mrazosoft
python3 tools/ident.py --rezim sap --check    # ukáže, čo by sa zmenilo (nič nezapíše)
python3 tools/ident.py --rezim sap            # variant A — SAP Trade
python3 tools/ident.py --rezim zivnost        # variant B — vlastná živnosť
python3 tools/ident.py --vratit               # späť na dnešný stav
```

**Overené 4. 8. 2026 reálnym behom, nie čítaním kódu:**

| Test | Výsledok |
|---|---|
| `--rezim sap` → `tools/qa.py` | **0 chýb / 28 stránok** (pribudla `/fakturacia`) |
| druhé spustenie toho istého režimu | „Nič na zmenu" — nič sa nezdvojí |
| `--rezim sap` → `--vratit` → `git status` | **čisté** — návrat je byte-identický |
| `--rezim zivnost` s nevyplnenými údajmi | **STOP, exit 2** — nezapíše `IČO: XXXXXXXX` |
| vizuál stránky `/fakturacia` | screenshot 390×844 aj 1440×900, viď `.qa-screens/2026-08-04/` |

Pri behu tam-a-späť sa našli **dve reálne chyby v mojom vlastnom skripte** (revert
ticho nespravil nič; jednotné znenie pätičky poškodilo variant v `aikurz.html`) —
obe opravené a doložené tým, že `git status` je po návrate prázdny.

### Čo ešte treba pred nasadením variantu A alebo B

- **Variant A:** Šaňov súhlas s uvedením SAP Trade na webe + rozhodnutie
  **s DPH / bez DPH** (skript má dnes vetu „ceny sú **vrátane DPH**" — ak to má byť
  inak, zmeňte ju v `tools/ident.py`, sekcia `blok`).
- **Variant B:** vyplniť v `tools/ident.py` skutočné **IČO, adresu a číslo
  živnostenského registra** — dovtedy skript zámerne odmieta zapisovať.
- Po nasadení oboch: doplniť do `app.js` i18n kľúče `footer.billing` a
  `footer.billnote`, bumpnúť `app.js?v=`, spustiť `tools/gen_sitemap.py`.

Zdroj formulácií a overenie SAP Trade v ORSR: `~/LAB/003contex/mrazosoft-fakturacia-sap-trade.md`.

Hranice DPH a poplatok za živnosť overené 4. 8. 2026 (nie z hlavy):
[KROS – sledovanie obratu pre registráciu DPH](https://akademia.kros.sk/faq/ekonomika-a-podnikanie/sledovanie-obratu-pre-registraciu-za-platitela-dph-platne-od-1-2025/) ·
[AKMV – voľná živnosť, poplatky](https://www.akmv.sk/volna-zivnost/).
Nie je to daňové poradenstvo — pri rozhodnutí to potvrďte s účtovníčkou.
