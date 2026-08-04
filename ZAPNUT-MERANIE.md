# Zapnúť meranie na mrazosoft.sk (GA4 + Clarity)

**Stav k 4. 8. 2026: meranie je VYPNUTÉ.** `cookies.js` má `ga4: { id: "" }` aj
`clarity: { id: "" }`, takže web dnes nezaznamená ani jedného návštevníka. Web pritom
ponúka služby od 199 € do 1 200 € a Audit za 149 € — bez merania sa nedá povedať,
či na stránku niekto chodí, odkiaľ prichádza a kde odchádza.

**Prehľadal som celý LAB — GA4 property ani Clarity projekt zatiaľ neexistujú.**
(Google Ads účet `950-659-3315` s konverziou `AW-18272862336` existuje a funguje;
GA4 je samostatná vec a treba ju založiť.) Preto tento návod.

---

## Čo už je hotové (netreba nič robiť)

| Vec | Stav |
|---|---|
| Načítanie GA4 a Clarity až po súhlase | hotové v `consent-core.js` — **odmerané, viď dole** |
| Consent Mode v2 default „denied" | hotové v `cookies.js` |
| CSP pripravená na obe služby (`_headers`) | doplnené 4. 8. 2026 |
| Cookie tabuľka v `zasady.html` §6 | GA4 aj Clarity sú tam **už popísané** |
| Miesto na vloženie ID | `cookies.js`, riadky 39–40, označené komentárom |

---

## Krok 1 — GA4 (~10 minút)

1. Otvorte **analytics.google.com**, prihláste sa účtom, pod ktorým je Google Ads
   (ten istý, čo spravuje účet 950-659-3315).
2. Vľavo dole **Správca (ozubené koliesko)** → **Vytvoriť** → **Účet**
   - Názov účtu: `MRAZOSOFT`
   - Krajina: Slovensko, mena: EUR
3. Ďalej vytvorí **Property (Vlastníctvo)**: názov `mrazosoft.sk`, časové pásmo
   `(GMT+01:00) Bratislava`, mena EUR.
4. Odvetvie: *Počítače a elektronika* (alebo *Podnikanie a priemysel*), veľkosť: malá.
5. Na konci vyberie **Web** ako platformu → **URL:** `https://mrazosoft.sk`,
   názov streamu `mrazosoft.sk`.
6. Zobrazí sa **ID merania** v tvare **`G-XXXXXXXXXX`** (písmeno G, pomlčka, 10 znakov).
   **Toto skopírujte.** Ak ho zavriete, nájdete ho znova: *Správca → Dátové toky →
   kliknúť na stream*.
7. *(voliteľné, ale odporúčam)* V tej istej sekcii **Prepojenia produktov → Google Ads**
   prepojte účet `950-659-3315` — Ads potom vidí, čo návštevníci na webe robia.

> ⚠️ Neaktivujte v GA4 „Rozšírené meranie konverzií" cez vlastný skript a
> nevkladajte kód z GA4 ručne do stránky. Web si tag načíta sám — a to až po súhlase.

## Krok 2 — Microsoft Clarity (~5 minút, zadarmo bez limitu)

Clarity ukazuje **nahrávky relácií a heatmapy** — teda kam ľudia klikajú a kde
zo stránky odchádzajú. Na web s 0 leadmi je to užitočnejšie než samotné čísla.

1. Otvorte **clarity.microsoft.com** → **Sign up** (dá sa prihlásiť aj Google účtom).
2. **+ New project**
   - Name: `mrazosoft.sk`
   - Website URL: `https://mrazosoft.sk`
   - Category: Business / Technology
3. Po vytvorení ponúkne spôsoby inštalácie — **vyberte „Install manually"**.
   V zobrazenom kóde je riadok `..."clarity", "script", "abcd1234ef"`.
   Ten posledný reťazec v úvodzovkách (**10 znakov, malé písmená a číslice**)
   je **ID projektu** — skopírujte len ten, nie celý kód.
   *(Nájdete ho aj v Settings → Overview → Project ID.)*

## Krok 3 — vložiť obe ID

Napíšte mi obe hodnoty (alebo ich vložte sami do `cookies.js`, riadky 39–40):

```js
ga4:       { id: "G-XXXXXXXXXX", category: "analytics" },
clarity:   { id: "abcd1234ef",   category: "analytics" },
```

Potom treba **bumpnúť `cookies.js?v=` vo všetkých 25 HTML** (inak vracajúci sa
návštevníci dostanú starú verziu z cache) a nasadiť cez `/ship mrazosoft`.
Toto spravím ja — vy stačí, že pošlete tie dve hodnoty.

## Krok 4 — dorobiť pri tom istom nasadení

- Do `zasady.html` §4 (Príjemcovia) doplniť riadok o **Microsoft** (Clarity) —
  dnes tam nie je, hoci v cookie tabuľke §6 už Clarity uvedený je. Kým je Clarity
  vypnutý, je to v poriadku; v okamihu zapnutia to treba doplniť.
- V Clarity zapnúť **maskovanie citlivých polí** (Settings → Masking → *Balanced*
  alebo *Strict*), aby sa do nahrávok nedostal obsah kontaktného formulára.

---

## Dôkaz, že to funguje (odmerané 4. 8. 2026, lokálne cez `npx serve`)

Dočasne som vložil testovacie ID `G-TEST123456` a `testclr999` a prehnal stránku
Playwrightom. Namerané:

```
A) PRED SÚHLASOM — volania na meracie domény: ŽIADNE ✅
   consent default: {"ad_storage":"denied", ..., "analytics_storage":"denied", ...}

B) PO KLIKU „Prijať všetko":
      https://www.googletagmanager.com/gtag/js        (GA4 tag)
      https://region1.google-analytics.com/g/collect  (reálny zásah do GA4)
      https://www.clarity.ms/tag/testclr999           (Clarity tag)
      https://ad.doubleclick.net/ccm/s/collect        (Ads, už predtým)
   GA4 načítané: ÁNO ✅   Clarity načítané: ÁNO ✅   JS chyby: žiadne ✅

VERDIKT: PASS — meranie je consent-gated a po súhlase reálne nabehne.
```

Testovacie ID sú po meraní **odstránené**, v repe sú riadky opäť prázdne.

> Poznámka k pravidlu z CLAUDE.md („nepridávaj analytiku kvôli SEO skóre"):
> toto nie je vanity tag. Účel je konkrétny — zistiť, či na stránku Audit 149 €
> vôbec niekto chodí, a či ju opúšťa pred tlačidlom, alebo až po ňom.
