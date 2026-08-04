/* Ukážka nového vzhľadu esol.sk — správanie, ktoré sa nedá ukázať na obrázku.
   Všetko beží LEN v prehliadači nad dátami v produkty.json / produkty-kategoria.json;
   nič sa nikam neodosiela. Verzia je vo window.__ukazkaVerzia, aby bolo pri ladení
   vidieť, ktorý kód naozaj beží (poučenie z 4.8. — hodinu sa hádalo cache vs. logika). */
window.__ukazkaVerzia = "ukazka-2026-08-04-1";

const EUR = (n) => n.toFixed(2).replace(".", ",") + " €";
// nazvy produktov idu do innerHTML — vzdy cez escape, aby sa z dat nedal vlozit kod
const esc = (t) => String(t).replace(/[&<>"']/g, (z) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[z]));
const naCislo = (t) => {
  if (!t) return 0;
  const c = parseFloat(String(t).replace(/[^\d,.-]/g, "").replace(",", "."));
  return isNaN(c) ? 0 : c;
};
const DOPRAVA_ZDARMA = 50;

/* ---------------- košík ---------------- */
const kosik = [];

function prekresliKosik() {
  const zoznam = document.querySelector(".kosik-polozky");
  if (!zoznam) return;
  const sucet = kosik.reduce((s, p) => s + p.cena * p.ks, 0);

  zoznam.innerHTML = kosik.length
    ? kosik.map((p, i) => `
        <div class="kosik-r">
          <img src="${esc(p.obr)}" alt="">
          <span class="n">${esc(p.nazov)}<br><small style="color:#6B7280;font-weight:400">${p.ks} × ${EUR(p.cena)}</small></span>
          <span class="c">${EUR(p.cena * p.ks)}</span>
          <button class="x" data-zmaz="${i}" aria-label="odstrániť">✕</button>
        </div>`).join("")
    : '<p style="color:#6B7280">Košík je zatiaľ prázdny.</p>';

  document.querySelectorAll("[data-zmaz]").forEach((b) =>
    b.addEventListener("click", () => { kosik.splice(+b.dataset.zmaz, 1); prekresliKosik(); }));

  document.querySelector(".kosik-sucet").textContent = EUR(sucet);
  const chyba = Math.max(0, DOPRAVA_ZDARMA - sucet);
  const pas = document.querySelector(".kosik-panel .pas-dopravy");
  if (pas) {
    pas.querySelector("span").innerHTML = chyba > 0
      ? `Do dopravy zdarma vám chýba <b>${EUR(chyba)}</b>`
      : "<b>Máte dopravu zdarma</b> 🎉";
    pas.querySelector("i").style.width = Math.min(100, sucet / DOPRAVA_ZDARMA * 100) + "%";
  }
  // ten istý údaj v hlavičke — nesmie ukazovať niečo iné než panel košíka
  const vHlavicke = document.querySelector(".doprava-pruh");
  if (vHlavicke) {
    // pri prazdnom kosiku nema zmysel hlasit "chyba 50 €" — to nie je informacia, ale strasiak
    vHlavicke.querySelector(".text").innerHTML = sucet === 0
      ? "Doprava zdarma pri objednávke nad 50 €"
      : (chyba > 0 ? `Do dopravy zdarma vám chýba <b>${EUR(chyba)}</b>`
                   : "<b>Máte dopravu zdarma</b> — objednávka nad 50 €");
    vHlavicke.querySelector(".pas i").style.width = Math.min(100, sucet / DOPRAVA_ZDARMA * 100) + "%";
  }
  document.querySelectorAll(".pocet-v-kosiku").forEach((e) =>
    e.textContent = kosik.reduce((s, p) => s + p.ks, 0));
  document.querySelectorAll(".suma-v-kosiku").forEach((e) => e.textContent = EUR(sucet));
}

function pridajDoKosika(nazov, cena, obr, ks = 1) {
  const je = kosik.find((p) => p.nazov === nazov);
  if (je) je.ks += ks; else kosik.push({ nazov, cena, obr, ks });
  prekresliKosik();
  otvorKosik(true);
}

function otvorKosik(stav) {
  document.querySelector(".kosik-panel")?.classList.toggle("vidno", stav);
  document.querySelector(".zaclona")?.classList.toggle("vidno", stav);
}

/* ---------------- napovedanie ---------------- */
async function pripravNapovedanie() {
  const pole = document.querySelector(".hladanie input");
  if (!pole) return;
  const box = document.createElement("div");
  box.className = "napoveda";
  pole.closest(".hladanie").appendChild(box);

  let data = [];
  for (const subor of ["produkty.json", "produkty-kategoria.json"]) {
    try { data = data.concat(await (await fetch(subor)).json()); } catch (e) { /* nič */ }
  }

  const kresli = (zoznam, dopyt) => {
    if (!dopyt.trim()) { box.classList.remove("vidno"); return; }
    box.innerHTML = zoznam.length
      ? `<div class="hlavicka">Našli sme ${zoznam.length} produktov — zobrazujeme 6</div>` +
        zoznam.slice(0, 6).map((p) => `
          <a href="produkt.html">
            <img src="${esc(p.obr)}" alt="">
            <span class="n">${esc(p.nazov)}</span>
            <span class="sklad"><i></i>${esc(p.pocet || "?")} ks</span>
            <span class="c">${esc(p.cena)}</span>
          </a>`).join("")
      : `<div class="prazdne">Na „${esc(dopyt)}" sme nič nenašli. Skúste iné slovo alebo nám zavolajte — poradíme.</div>`;
    box.classList.add("vidno");
  };

  pole.addEventListener("input", () => {
    const d = pole.value.trim().toLowerCase();
    kresli(data.filter((p) => p.nazov.toLowerCase().includes(d)), d);
  });
  pole.addEventListener("focus", () => { if (pole.value.trim()) pole.dispatchEvent(new Event("input")); });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".hladanie")) box.classList.remove("vidno");
  });
}

/* ---------------- filtre v kategórii ---------------- */
function pripravFiltre() {
  const mriezka = document.querySelector("#zoznam-produktov");
  if (!mriezka) return;
  const karty = [...mriezka.children];
  const pocitadlo = document.querySelector(".pocet");
  const prazdne = document.querySelector(".ziadne-vysledky");

  const uprav = () => {
    const znacky = [...document.querySelectorAll("[data-znacka]:checked")].map((i) => i.dataset.znacka);
    const lenSkladom = document.querySelector("#len-skladom")?.checked;
    const lenZlava = document.querySelector("#len-zlava")?.checked;
    const odCeny = naCislo(document.querySelector("#cena-od")?.value);
    const doCeny = naCislo(document.querySelector("#cena-do")?.value);

    let vidno = 0;
    karty.forEach((k) => {
      const cena = +k.dataset.cena;
      const ok =
        (!znacky.length || znacky.includes(k.dataset.znacka)) &&
        (!lenSkladom || +k.dataset.sklad > 0) &&
        (!lenZlava || k.dataset.zlava === "1") &&
        (!odCeny || cena >= odCeny) &&
        (!doCeny || cena <= doCeny);
      k.style.display = ok ? "" : "none";
      if (ok) vidno++;
    });
    if (pocitadlo) pocitadlo.textContent = `Zobrazených ${vidno} z ${karty.length} produktov`;
    if (prazdne) prazdne.style.display = vidno ? "none" : "block";
  };

  document.querySelectorAll(".filtre input").forEach((i) => i.addEventListener("input", uprav));
  document.querySelector(".zmaz-filtre")?.addEventListener("click", () => {
    document.querySelectorAll(".filtre input").forEach((i) => {
      if (i.type === "checkbox") i.checked = false; else i.value = "";
    });
    uprav();
  });

  document.querySelector("#radenie")?.addEventListener("change", (e) => {
    const smer = e.target.value;
    const zoradene = [...karty].sort((a, b) => {
      if (smer === "lacne") return a.dataset.cena - b.dataset.cena;
      if (smer === "drahe") return b.dataset.cena - a.dataset.cena;
      if (smer === "sklad") return b.dataset.sklad - a.dataset.sklad;
      return 0;
    });
    zoradene.forEach((k) => mriezka.appendChild(k));
  });

  uprav();
}

/* ---------------- drobnosti ---------------- */
function pripravOstatne() {
  // množstvo v karte
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".pocet button");
    if (!b) return;
    const pole = b.parentElement.querySelector("span");
    const n = Math.max(1, +pole.textContent + (b.textContent.trim() === "+" ? 1 : -1));
    pole.textContent = n;
  });

  // do košíka
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".kosik");
    if (!b) return;
    const karta = b.closest(".prod, .produkt-hl");
    if (!karta) return;
    const ks = +(karta.querySelector(".pocet span")?.textContent || 1);
    pridajDoKosika(
      karta.querySelector(".nazov, h1").textContent.trim(),
      naCislo(karta.querySelector(".cena").textContent),
      karta.querySelector("img").src, ks);
  });

  document.querySelectorAll(".otvor-kosik").forEach((e) =>
    e.addEventListener("click", () => otvorKosik(true)));
  document.querySelector(".kosik-panel .zavri")?.addEventListener("click", () => otvorKosik(false));
  document.querySelector(".zaclona")?.addEventListener("click", () => otvorKosik(false));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") otvorKosik(false); });

  // záložky na karte produktu
  document.querySelectorAll(".zalozky button").forEach((b) =>
    b.addEventListener("click", () => {
      document.querySelectorAll(".zalozky button").forEach((x) => x.classList.remove("aktivna"));
      b.classList.add("aktivna");
      document.querySelectorAll("[data-zalozka]").forEach((o) =>
        o.style.display = o.dataset.zalozka === b.dataset.ciel ? "" : "none");
    }));

  // galéria
  document.querySelectorAll(".galeria .male button").forEach((b) =>
    b.addEventListener("click", () => {
      document.querySelectorAll(".galeria .male button").forEach((x) => x.classList.remove("aktivny"));
      b.classList.add("aktivny");
      document.querySelector(".galeria .hlavna img").src = b.querySelector("img").src;
    }));
}

document.addEventListener("DOMContentLoaded", () => {
  pripravNapovedanie();
  pripravFiltre();
  pripravOstatne();
  prekresliKosik();
});
