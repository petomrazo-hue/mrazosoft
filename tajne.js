/* ░░ aeterna — end-to-end šifrovaný tajný chat medzi dvoma návštevníkmi ░░
   Skrytý spúšťač: napíš "tajne", otvor #tajne, alebo podrž/troj-ťukni logo v pätičke.
   Realtime cez Firebase Realtime Database (lazy-load až pri otvorení).

   ŠIFROVANIE: z PINu sa cez PBKDF2 odvodí (a) ID miestnosti a (b) AES-GCM 256 kľúč.
   Do Firebase ide LEN zašifrovaný text (iv+ct) — ani server, ani vlastník projektu obsah neprečíta.
   Kľúč pozná len ten, kto pozná PIN; nikdy neopustí prehliadač. Vyžaduje HTTPS (secure context).
   Správy sa po 12 h automaticky mažú (pruneOld). Firebase pravidlá: pozri firebase-rules.json. */
(function () {
  "use strict";

  var FIREBASE_CONFIG = {
    databaseURL: "https://tajny-dc6d6-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "tajny-dc6d6"
  };

  var SECRET = "tajne";
  var TTL = 12 * 3600 * 1000; // správy sa po 12 hodinách automaticky mažú
  var clientId = Math.random().toString(36).slice(2);
  var overlay = null, msgsEl = null, onlineEl = null, db = null, roomRef = null, msgsRef = null, presRef = null;
  var cryptoKey = null, pruneTimer = null;

  function configured() { return !!FIREBASE_CONFIG.databaseURL; } // RTDB stačí databaseURL
  function hasCrypto() { return !!(window.crypto && window.crypto.subtle && window.TextEncoder); }

  /* ── End-to-end šifrovanie ──
     Z PINu odvodíme cez PBKDF2 (i) ID miestnosti a (ii) AES-GCM kľúč.
     Do Firebase ide LEN zašifrovaný text (iv+ct) — server ani vlastník projektu obsah neprečíta.
     Kľúč nikdy neopúšťa prehliadač; pozná ho len ten, kto pozná PIN. */
  function b64(buf) { var u = new Uint8Array(buf), s = ""; for (var i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s); }
  function unb64(str) { var bin = atob(str), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }

  function deriveKey(pin) {
    var enc = new TextEncoder();
    return window.crypto.subtle.importKey("raw", enc.encode(pin), "PBKDF2", false, ["deriveBits", "deriveKey"]).then(function (base) {
      // ID miestnosti = PBKDF2(pin, salt "room") → nedá sa z neho späť získať PIN, a /tajne sa nedá listovať
      var roomP = window.crypto.subtle.deriveBits({ name: "PBKDF2", salt: enc.encode("aeterna:room:v1"), iterations: 120000, hash: "SHA-256" }, base, 128)
        .then(function (bits) { return "r" + b64(bits).replace(/[^A-Za-z0-9]/g, "").slice(0, 22); });
      // šifrovací kľúč = PBKDF2(pin, salt "msg") → AES-GCM 256
      var keyP = window.crypto.subtle.deriveKey({ name: "PBKDF2", salt: enc.encode("aeterna:msg:v1"), iterations: 120000, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
      return Promise.all([roomP, keyP]).then(function (r) { return { roomId: r[0], key: r[1] }; });
    });
  }
  function encrypt(key, text) {
    var iv = window.crypto.getRandomValues(new Uint8Array(12));
    return window.crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, new TextEncoder().encode(text))
      .then(function (ct) { return { iv: b64(iv), ct: b64(ct) }; });
  }
  function decrypt(key, m) {
    if (!m || !m.iv || !m.ct) return Promise.resolve(null);
    return window.crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(m.iv) }, key, unb64(m.ct))
      .then(function (pt) { return new TextDecoder().decode(pt); })
      .catch(function () { return null; });
  }

  function loadFirebase(cb) {
    if (window.firebase && window.firebase.database) { cb(); return; }
    var base = "https://www.gstatic.com/firebasejs/10.12.2/";
    var a = document.createElement("script");
    a.src = base + "firebase-app-compat.js";
    a.onload = function () {
      var b = document.createElement("script");
      b.src = base + "firebase-database-compat.js";
      b.onload = cb;
      b.onerror = function () { cb("err"); };
      document.head.appendChild(b);
    };
    a.onerror = function () { cb("err"); };
    document.head.appendChild(a);
  }

  function buildOverlay() {
    overlay = document.createElement("div");
    overlay.className = "tajne-overlay";
    overlay.innerHTML =
      '<div class="tajne-box" role="dialog" aria-label="aeterna">' +
        '<div class="tajne-head"><strong>aeterna</strong><button class="tajne-close" type="button" aria-label="Zavrieť">×</button></div>' +
        '<div class="tajne-pin">' +
          '<input class="tajne-input" id="tajnePinInput" type="password" inputmode="numeric" autocomplete="off" maxlength="32" placeholder="kód" />' +
          '<input class="tajne-input" id="tajneCodeInput" type="password" autocomplete="off" maxlength="4" placeholder="overovací znak" />' +
          '<button class="tajne-enter" id="tajneEnter" type="button">Vstúpiť</button>' +
          '<p class="tajne-err" id="tajneErr"></p>' +
        '</div>' +
        '<div class="tajne-chat" hidden>' +
          '<div class="tajne-bar"><span class="tajne-online" id="tajneOnline"><span class="tajne-dot"></span>—</span><span class="tajne-acts"><button class="tajne-leave" id="tajneClear" type="button">Vymazať</button><button class="tajne-leave" id="tajneLeave" type="button">Odísť</button></span></div>' +
          '<div class="tajne-msgs" id="tajneMsgs"></div>' +
          '<form class="tajne-row" id="tajneForm">' +
            '<input class="tajne-input" id="tajneText" type="text" maxlength="500" placeholder="…" autocomplete="off" />' +
            '<button class="tajne-send" type="submit">→</button>' +
          '</form>' +
        '</div>' +
      "</div>";
    document.body.appendChild(overlay);

    overlay.querySelector(".tajne-close").addEventListener("click", close);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    overlay.querySelector("#tajneEnter").addEventListener("click", enterRoom);
    overlay.querySelector("#tajnePinInput").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); overlay.querySelector("#tajneCodeInput").focus(); } });
    overlay.querySelector("#tajneCodeInput").addEventListener("keydown", function (e) { if (e.key === "Enter") enterRoom(); });
    overlay.querySelector("#tajneForm").addEventListener("submit", function (e) { e.preventDefault(); send(); });
    overlay.querySelector("#tajneLeave").addEventListener("click", close);
    overlay.querySelector("#tajneClear").addEventListener("click", clearChat);
    msgsEl = overlay.querySelector("#tajneMsgs");
    onlineEl = overlay.querySelector("#tajneOnline");
  }

  // odíď z miestnosti → späť na PIN (uvoľní prítomnosť, odpojí listenery); dá sa znova vstúpiť iným PINom
  function leaveRoom() {
    try { if (presRef) presRef.remove(); } catch (e) {}
    if (roomRef) { try { roomRef.off(); roomRef.child("pres").off(); } catch (e) {} }
    if (msgsRef) { try { msgsRef.off(); } catch (e) {} }
    if (pruneTimer) { clearInterval(pruneTimer); pruneTimer = null; }
    presRef = null; msgsRef = null; roomRef = null; cryptoKey = null;
    if (!overlay) return;
    overlay.querySelector(".tajne-chat").hidden = true;
    overlay.querySelector(".tajne-pin").hidden = false;
    var pin = overlay.querySelector("#tajnePinInput"); if (pin) pin.value = "";
    var code = overlay.querySelector("#tajneCodeInput"); if (code) code.value = "";
    if (msgsEl) msgsEl.innerHTML = "";
    var err = overlay.querySelector("#tajneErr"); if (err) err.textContent = "";
    if (pin) setTimeout(function () { pin.focus(); }, 50);
  }

  // vymaž celú miestnosť z Firebase — bez upozornenia; zmizne všetko a okno aeterny
  // sa zavrie OBOM stranám (druhý klient to zachytí cez value listener na roomRef → close()).
  function clearChat() {
    if (!roomRef) return;
    try { roomRef.remove(); } catch (e) {}
  }

  function open() {
    if (!overlay) buildOverlay();
    // ak práve nie sme v miestnosti, vždy ukáž PIN obrazovku (nikdy nie starú konverzáciu)
    if (!roomRef) {
      overlay.querySelector(".tajne-chat").hidden = true;
      overlay.querySelector(".tajne-pin").hidden = false;
      if (msgsEl) msgsEl.innerHTML = "";
    }
    overlay.classList.add("open");
    var err = overlay.querySelector("#tajneErr");
    if (!configured()) {
      err.textContent = "Chat zatiaľ nie je nakonfigurovaný (chýba Firebase config v tajne.js).";
    } else {
      err.textContent = "";
      setTimeout(function () { var p = overlay.querySelector("#tajnePinInput"); if (p) p.focus(); }, 50);
    }
  }
  function close() { leaveRoom(); if (overlay) overlay.classList.remove("open"); }

  // ── Interná ochrana: druhý overovací znak po PINe ──
  // PIN 2904 (súkromná miestnosť): platí "p" (Peter) alebo "k" (ona).
  // Akýkoľvek iný PIN: obaja musia zadať "c", inak sa dnu nedostanú.
  // Znak je prístupová brána; miestnosť/kľúč sa naďalej odvodzuje z PINu (preto p aj k vedú do tej istej miestnosti).
  function verifyCode(pin, code) {
    code = (code || "").trim().toLowerCase();
    if (pin === "2904") return code === "p" || code === "k";
    return code === "c";
  }

  function enterRoom() {
    var err = overlay.querySelector("#tajneErr");
    if (!configured()) { err.textContent = "Chat ešte nie je nakonfigurovaný."; return; }
    if (!hasCrypto()) { err.textContent = "Tvoj prehliadač nepodporuje šifrovanie (potrebné je HTTPS)."; return; }
    var pin = (overlay.querySelector("#tajnePinInput").value || "").trim();
    if (pin.length < 3) { err.textContent = "PIN musí mať aspoň 3 znaky."; return; }
    var code = overlay.querySelector("#tajneCodeInput").value;
    if (!verifyCode(pin, code)) { err.textContent = "Nesprávny overovací znak."; return; }
    err.textContent = "Šifrujem a pripájam…";
    loadFirebase(function (e) {
      if (e === "err") { err.textContent = "Nepodarilo sa načítať Firebase."; return; }
      deriveKey(pin).then(function (d) {
        cryptoKey = d.key;
        try {
          if (!window.firebase.apps.length) window.firebase.initializeApp(FIREBASE_CONFIG);
          db = window.firebase.database();
        } catch (ex) { err.textContent = "Chyba Firebase: " + (ex.message || ex); return; }
        joinRoom(d.roomId);
      }).catch(function () { err.textContent = "Chyba pri odvodení šifrovacieho kľúča."; });
    });
  }

  function joinRoom(key) {
    roomRef = db.ref("tajne/" + key);
    // tajný chat je len pre DVOCH — ak sú v miestnosti už dvaja, odmietni
    roomRef.child("pres").once("value").then(function (snap) {
      if (snap.numChildren() >= 2) {
        var err = overlay.querySelector("#tajneErr");
        err.textContent = "Miestnosť je plná — tajný chat je len pre dvoch. Skús iný PIN.";
        roomRef = null;
        return;
      }
      enterRoomConfirmed(key);
    }).catch(function () { enterRoomConfirmed(key); });
  }

  function enterRoomConfirmed(key) {
    msgsRef = roomRef.child("msgs");
    presRef = roomRef.child("pres").child(clientId);

    // prepni na chat obrazovku (a zmaž stavovú hlášku „Šifrujem a pripájam…")
    var err0 = overlay.querySelector("#tajneErr"); if (err0) err0.textContent = "";
    overlay.querySelector(".tajne-pin").hidden = true;
    overlay.querySelector(".tajne-chat").hidden = false;
    msgsEl.innerHTML = "";

    // prítomnosť (bez mena — len anonymný kľúč prítomnosti)
    presRef.set({ ts: Date.now() });
    presRef.onDisconnect().remove();
    roomRef.child("pres").on("value", function (snap) {
      var n = snap.numChildren();
      onlineEl.innerHTML = '<span class="tajne-dot"></span>' + (n >= 2 ? "spojení" : "čakám…");
    });

    // správy (posledných 100) — staré (nad 12 h) sa preskočia a zmažú
    msgsRef.limitToLast(100).on("child_added", function (snap) {
      var m = snap.val() || {};
      if (m.ts && m.ts < Date.now() - TTL) { try { snap.ref.remove(); } catch (e) {} return; }
      renderMsg(m);
    });
    // ak niekto vymaže konverzáciu → vyčisti aj druhému v reálnom čase
    msgsRef.on("value", function (snap) { if (!snap.exists() && msgsEl) msgsEl.innerHTML = ""; });

    // ak niekto klikne Vymazať → zmaže celú miestnosť → zavrie okno aeterny OBOM stranám
    var roomLive = false;
    roomRef.on("value", function (snap) {
      if (snap.exists()) { roomLive = true; return; }
      if (roomLive) { roomLive = false; close(); } // miestnosť zmizla → zavri okno
    });

    // auto-mazanie po 12 h — pri vstupe a potom každých 10 min, kým si v miestnosti
    pruneOld();
    pruneTimer = setInterval(pruneOld, 10 * 60 * 1000);

    setTimeout(function () { var t = overlay.querySelector("#tajneText"); if (t) t.focus(); }, 60);
  }

  // zmaž z Firebase všetky správy staršie ako TTL (robí to ktokoľvek, kto má chat otvorený)
  function pruneOld() {
    if (!msgsRef) return;
    var cutoff = Date.now() - TTL;
    try {
      msgsRef.orderByChild("ts").endAt(cutoff).once("value", function (snap) {
        snap.forEach(function (child) { try { child.ref.remove(); } catch (e) {} });
      });
    } catch (e) {}
  }

  function renderMsg(m) {
    var el = document.createElement("div");
    el.className = "tajne-msg" + (m.cid === clientId ? " me" : "");
    el.textContent = "…"; // placeholder drží poradie, kým prebehne dešifrovanie
    msgsEl.appendChild(el);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    decrypt(cryptoKey, m).then(function (txt) {
      el.textContent = (txt == null ? "🔒 nedá sa dešifrovať" : txt);
      msgsEl.scrollTop = msgsEl.scrollHeight;
    });
  }

  function send() {
    var input = overlay.querySelector("#tajneText");
    var text = (input.value || "").trim();
    if (!text || !msgsRef || !cryptoKey) return;
    input.value = "";
    encrypt(cryptoKey, text.slice(0, 500)).then(function (enc) {
      msgsRef.push({ iv: enc.iv, ct: enc.ct, cid: clientId, ts: Date.now() });
    });
  }

  /* ── Skrytý spúšťač ── */
  function initTrigger() {
    if (location.hash === "#" + SECRET) setTimeout(open, 400);
    window.addEventListener("hashchange", function () { if (location.hash === "#" + SECRET) open(); });
    var buf = "";
    window.addEventListener("keydown", function (e) {
      if (e.key && e.key.length === 1) {
        buf = (buf + e.key.toLowerCase()).slice(-SECRET.length);
        if (buf === SECRET) { var ae = document.activeElement; if (!ae || !/^(INPUT|TEXTAREA)$/.test(ae.tagName)) open(); }
      }
    });
    // mobil: PODRŽANIE loga v pätičke (~0,6 s) alebo 3 rýchle ťuknutia — nenápadné, spoľahlivé na dotyk
    var fb = document.querySelector(".footer .brand-name");
    if (fb) {
      fb.style.touchAction = "manipulation";
      fb.style.webkitUserSelect = "none";
      fb.style.userSelect = "none";
      var taps = 0, tapT = 0, holdT = 0, held = false;
      fb.addEventListener("pointerdown", function () {
        held = false;
        clearTimeout(holdT);
        holdT = setTimeout(function () { held = true; open(); }, 600);
      });
      var cancelHold = function () { clearTimeout(holdT); };
      fb.addEventListener("pointermove", cancelHold);
      fb.addEventListener("pointercancel", cancelHold);
      fb.addEventListener("pointerup", function () {
        clearTimeout(holdT);
        if (held) return;
        taps++; clearTimeout(tapT); tapT = setTimeout(function () { taps = 0; }, 2000);
        if (taps >= 3) { taps = 0; open(); }
      });
    }

    // 3× klik/ťuk na točiace sa logo vľavo hore → /lab.html
    var fl = document.querySelector(".brand-flake");
    if (fl) {
      var flTaps = 0, flTapT = 0;
      fl.addEventListener("click", function (e) {
        e.preventDefault();
        flTaps++; clearTimeout(flTapT); flTapT = setTimeout(function () { flTaps = 0; }, 2000);
        if (flTaps >= 3) { flTaps = 0; window.location.href = "/lab.html"; }
      });
    }
    // SÚKROMIE: keď stránku minimalizuješ / prepneš tab / opustíš okno → chat sa zatvorí.
    // Späť sa dostaneš len trojklikom (resp. podržaním) + PINom.
    function autoClose() {
      if (overlay && overlay.classList.contains("open")) close();
    }
    document.addEventListener("visibilitychange", function () { if (document.hidden) autoClose(); });
    window.addEventListener("pagehide", autoClose);
    window.addEventListener("blur", autoClose);
  }

  if (document.readyState !== "loading") initTrigger();
  else document.addEventListener("DOMContentLoaded", initTrigger);
})();
