/* ░░ Tajný chat — PIN-chránené okno medzi dvoma návštevníkmi ░░
   Skrytý spúšťač: napíš slovo "tajne" kdekoľvek na stránke, alebo otvor #tajne.
   Realtime cez Firebase Realtime Database (lazy-load až pri otvorení).
   PIN = kľúč miestnosti — kto pozná rovnaký PIN, je v rovnakej miestnosti.

   ⬇️ DOPLNIŤ: Firebase config (Realtime Database). Kým je prázdny, chat hlási, že nie je nakonfigurovaný.
   Získaš na console.firebase.google.com → nový projekt → Realtime Database → web app config. */
(function () {
  "use strict";

  var FIREBASE_CONFIG = {
    databaseURL: "https://tajny-dc6d6-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "tajny-dc6d6"
  };

  var SECRET = "tajne";
  var clientId = Math.random().toString(36).slice(2);
  var name = "";
  var overlay = null, msgsEl = null, onlineEl = null, db = null, roomRef = null, msgsRef = null, presRef = null;

  function configured() { return !!FIREBASE_CONFIG.databaseURL; } // RTDB v test-mode stačí databaseURL

  function roomKey(pin) {
    var h = 0, s = String(pin);
    for (var i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) >>> 0; }
    return "r" + h.toString(36);
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

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
      '<div class="tajne-box" role="dialog" aria-label="Tajný chat">' +
        '<div class="tajne-head"><strong>🤫 Tajný chat</strong><button class="tajne-close" type="button" aria-label="Zavrieť">×</button></div>' +
        '<div class="tajne-pin">' +
          '<p class="tajne-note">Zadaj <strong>PIN miestnosti</strong> a (voliteľne) meno. Kto pozná rovnaký PIN, vidí tvoje správy. Správy bežia v reálnom čase medzi tými, čo sú práve tu.</p>' +
          '<input class="tajne-input" id="tajneName" type="text" maxlength="24" placeholder="Tvoje meno (voliteľné)" />' +
          '<input class="tajne-input" id="tajnePinInput" type="password" inputmode="numeric" autocomplete="off" maxlength="32" placeholder="PIN miestnosti (skrytý)" />' +
          '<button class="tajne-enter" id="tajneEnter" type="button">Vstúpiť do miestnosti</button>' +
          '<p class="tajne-err" id="tajneErr"></p>' +
        '</div>' +
        '<div class="tajne-chat" hidden>' +
          '<div class="tajne-bar"><span class="tajne-online" id="tajneOnline"><span class="tajne-dot"></span>—</span><button class="tajne-leave" id="tajneLeave" type="button">Odísť ✕</button></div>' +
          '<div class="tajne-msgs" id="tajneMsgs"></div>' +
          '<form class="tajne-row" id="tajneForm">' +
            '<input class="tajne-input" id="tajneText" type="text" maxlength="500" placeholder="Napíš správu…" autocomplete="off" />' +
            '<button class="tajne-send" type="submit">Poslať</button>' +
          '</form>' +
        '</div>' +
      "</div>";
    document.body.appendChild(overlay);

    overlay.querySelector(".tajne-close").addEventListener("click", close);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    overlay.querySelector("#tajneEnter").addEventListener("click", enterRoom);
    overlay.querySelector("#tajnePinInput").addEventListener("keydown", function (e) { if (e.key === "Enter") enterRoom(); });
    overlay.querySelector("#tajneForm").addEventListener("submit", function (e) { e.preventDefault(); send(); });
    overlay.querySelector("#tajneLeave").addEventListener("click", leaveRoom);
    msgsEl = overlay.querySelector("#tajneMsgs");
    onlineEl = overlay.querySelector("#tajneOnline");
  }

  // odíď z miestnosti → späť na PIN (uvoľní prítomnosť, odpojí listenery); dá sa znova vstúpiť iným PINom
  function leaveRoom() {
    try { if (presRef) presRef.remove(); } catch (e) {}
    if (roomRef) { try { roomRef.child("pres").off(); } catch (e) {} }
    if (msgsRef) { try { msgsRef.off(); } catch (e) {} }
    presRef = null; msgsRef = null; roomRef = null;
    if (!overlay) return;
    overlay.querySelector(".tajne-chat").hidden = true;
    overlay.querySelector(".tajne-pin").hidden = false;
    var pin = overlay.querySelector("#tajnePinInput"); if (pin) pin.value = "";
    if (msgsEl) msgsEl.innerHTML = "";
    var err = overlay.querySelector("#tajneErr"); if (err) err.textContent = "";
    if (pin) setTimeout(function () { pin.focus(); }, 50);
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

  function enterRoom() {
    var err = overlay.querySelector("#tajneErr");
    if (!configured()) { err.textContent = "Chat ešte nie je nakonfigurovaný."; return; }
    var pin = (overlay.querySelector("#tajnePinInput").value || "").trim();
    if (pin.length < 3) { err.textContent = "PIN musí mať aspoň 3 znaky."; return; }
    name = (overlay.querySelector("#tajneName").value || "").trim().slice(0, 24) || "Anonym";
    err.textContent = "Pripájam…";
    loadFirebase(function (e) {
      if (e === "err") { err.textContent = "Nepodarilo sa načítať Firebase."; return; }
      try {
        if (!window.firebase.apps.length) window.firebase.initializeApp(FIREBASE_CONFIG);
        db = window.firebase.database();
      } catch (ex) { err.textContent = "Chyba Firebase: " + (ex.message || ex); return; }
      joinRoom(roomKey(pin));
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

    // prepni na chat obrazovku
    overlay.querySelector(".tajne-pin").hidden = true;
    overlay.querySelector(".tajne-chat").hidden = false;
    msgsEl.innerHTML = "";

    // prítomnosť
    presRef.set({ name: name, ts: Date.now() });
    presRef.onDisconnect().remove();
    roomRef.child("pres").on("value", function (snap) {
      var n = snap.numChildren();
      onlineEl.innerHTML = '<span class="tajne-dot"></span>' + (n === 1 ? "Si tu sám — počkaj, kým príde druhý s rovnakým PINom." : n + " online");
    });

    // správy (posledných 100)
    msgsRef.limitToLast(100).on("child_added", function (snap) {
      var m = snap.val() || {};
      renderMsg(m);
    });
    setTimeout(function () { var t = overlay.querySelector("#tajneText"); if (t) t.focus(); }, 60);
  }

  function renderMsg(m) {
    var el = document.createElement("div");
    el.className = "tajne-msg" + (m.cid === clientId ? " me" : "");
    el.innerHTML = "<b>" + esc(m.name || "Anonym") + "</b>" + esc(m.text || "");
    msgsEl.appendChild(el);
    msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  function send() {
    var input = overlay.querySelector("#tajneText");
    var text = (input.value || "").trim();
    if (!text || !msgsRef) return;
    input.value = "";
    msgsRef.push({ name: name, text: text.slice(0, 500), cid: clientId, ts: Date.now() });
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
        if (held) return; // už otvorené podržaním
        taps++; clearTimeout(tapT); tapT = setTimeout(function () { taps = 0; }, 2000);
        if (taps >= 3) { taps = 0; open(); }
      });
    }
  }

  if (document.readyState !== "loading") initTrigger();
  else document.addEventListener("DOMContentLoaded", initTrigger);
})();
