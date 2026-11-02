/* POCA 50th Anniversary — progressive enhancement.
   The page is complete without this file; everything here is an upgrade. */
(function () {
  "use strict";

  var D = window.POCA || {};
  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function fmt(n) { return Math.round(n).toLocaleString("en-US"); }

  root.classList.add("js");

  /* ---------- Toast ---------- */
  var toastEl = $("[data-toast]");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-visible"); }, 2600);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = doc.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      doc.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = doc.execCommand("copy"); } catch (e) { ok = false; }
      doc.body.removeChild(ta);
      ok ? resolve() : reject(new Error("copy failed"));
    });
  }

  /* ---------- Apply site-data.js ---------- */
  // Only touch the DOM when a value differs from the HTML fallback.
  function setText(el, v) { v = String(v); if (el.textContent !== v) el.textContent = v; }
  function setHref(el, v) { if (el.getAttribute("href") !== v) el.setAttribute("href", v); }

  function applyData() {
    if (D.DONATE) {
      $$("[data-donate-cc]").forEach(function (a) { setHref(a, D.DONATE.corpusChristi); });
      $$("[data-donate-bv]").forEach(function (a) { setHref(a, D.DONATE.beeville); });
    }
    if (D.CONTACT) {
      $$('a[href^="tel:"]').forEach(function (a) { setHref(a, "tel:" + D.CONTACT.officePhoneTel); });
      $$("[data-sms]").forEach(function (a) { setHref(a, "sms:" + D.CONTACT.officePhoneTel); });
      $$("[data-elf-link]").forEach(function (a) {
        setHref(a, "mailto:" + D.CONTACT.eventEmail + "?subject=" + encodeURIComponent(D.CONTACT.elfSubject));
      });
    }
    if (D.MAIL) {
      $$("[data-mail-address]").forEach(function (el) {
        var squash = function (t) { return t.replace(/\s+/g, ""); };
        if (squash(el.textContent) === squash(D.MAIL.lines.join(""))) return;
        el.innerHTML = "";
        D.MAIL.lines.forEach(function (line, i) {
          if (i) el.appendChild(doc.createElement("br"));
          el.appendChild(doc.createTextNode(line));
        });
      });
    }
    if (D.CURRENT_YEAR) {
      $$('[data-bind="current-year"]').forEach(function (el) { setText(el, D.CURRENT_YEAR); });
    }
    if (D.EVENT) {
      $$('[data-bind="event-date"]').forEach(function (el) {
        setText(el, D.EVENT.dateLabel);
        el.setAttribute("datetime", D.EVENT.start.slice(0, 10));
      });
      $$("[data-directions]").forEach(function (a) { setHref(a, D.EVENT.directionsUrl); });
    }
    if (D.LETTER_PDF) {
      $$("[data-letter-pdf]").forEach(function (a) { setHref(a, D.LETTER_PDF); });
    }
    if (D.HERO_TOTAL) {
      var total = fmt(D.HERO_TOTAL.value) + (D.HERO_TOTAL.suffix || "");
      var h = $('[data-bind="hero-total"]');
      if (h && h.textContent !== total) {
        h.textContent = total;
        var odo = $("[data-odo]");
        if (odo) odo.innerHTML = total.split("").map(function (ch) {
          if (ch === ",") return '<span class="odo-sep">,</span>';
          return /\d/.test(ch) ? '<span class="odo-d">' + ch + "</span>" : '<span class="odo-cur">' + ch + "</span>";
        }).join("");
      }
    }
    if (D.STATS) {
      $$("[data-stats] .stat").forEach(function (li, i) {
        var s = D.STATS[i];
        if (!s) return;
        var num = $(".stat-num", li);
        var html = '<span data-count="' + s.value + '">' + fmt(s.value) + "</span>" + (s.suffix || "");
        if (num.innerHTML !== html) num.innerHTML = html;
        setText($(".stat-label", li), s.label);
      });
    }

    // Personal cell numbers only when the client has approved them.
    if (D.SHOW_PERSONAL_NUMBERS && D.PERSONAL_NUMBERS) {
      addCell("hopkins", D.PERSONAL_NUMBERS.joeHopkinsCell, " (texting preferred)");
      addCell("corrigan", D.PERSONAL_NUMBERS.bobCorriganCell, "");
    }

    renderSocials();
  }

  function addCell(key, number, note) {
    var list = $('[data-contact="' + key + '"]');
    if (!list || !number) return;
    var line = doc.createElement("p");
    line.className = "person-line";
    line.innerHTML = '<svg class="i" aria-hidden="true"><use href="#i-phone"/></svg> Cell: <a href="tel:+1' +
      number.replace(/\D/g, "") + '">' + number + "</a>" + note;
    list.insertBefore(line, list.firstChild);
  }

  function renderSocials() {
    var ul = $("[data-socials]");
    if (!ul || !D.SOCIAL) return;
    var names = { facebook: "Facebook", instagram: "Instagram", youtube: "YouTube", x: "X (Twitter)", linkedin: "LinkedIn" };
    Object.keys(D.SOCIAL).forEach(function (k) {
      var url = D.SOCIAL[k];
      if (!url) return;
      var li = doc.createElement("li");
      li.innerHTML = '<a href="' + url + '" target="_blank" rel="noopener"><svg class="i" aria-hidden="true"><use href="#i-' + k +
        '"/></svg><span class="visually-hidden">' + names[k] + " (opens in a new tab)</span></a>";
      ul.appendChild(li);
    });
  }

  /* ---------- Header shrink + mobile donate bar ---------- */
  function initHeader() {
    var header = $("[data-header]");
    var bar = $("[data-mobile-bar]");
    var hero = $(".hero");
    var ticking = false;
    function update() {
      ticking = false;
      if (header) header.classList.toggle("is-scrolled", window.scrollY > 24);
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();

    if (bar && hero && "IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        bar.classList.toggle("is-visible", !entries[0].isIntersecting);
      }, { threshold: 0, rootMargin: "-120px 0px 0px 0px" }).observe(hero);
    } else if (bar) {
      bar.classList.add("is-visible");
    }
  }

  /* ---------- Focus helpers ---------- */
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';
  function trapFocus(container, e) {
    if (e.key !== "Tab") return;
    var items = $$(FOCUSABLE, container).filter(function (el) { return el.offsetParent !== null; });
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ---------- Mobile menu ---------- */
  function initMenu() {
    var toggle = $("[data-nav-toggle]");
    var menu = $("[data-nav-menu]");
    if (!toggle || !menu) return;
    var scrim = doc.createElement("div");
    scrim.className = "nav-scrim";
    scrim.hidden = true;
    doc.body.appendChild(scrim);
    var desktop = window.matchMedia("(min-width: 1200px)");

    function open() {
      scrim.hidden = false;
      requestAnimationFrame(function () { scrim.classList.add("is-open"); });
      menu.classList.add("is-open");
      menu.setAttribute("role", "dialog");
      menu.setAttribute("aria-modal", "true");
      menu.setAttribute("aria-label", "Site menu");
      toggle.setAttribute("aria-expanded", "true");
      doc.body.style.overflow = "hidden";
      var first = $("a, button", menu);
      setTimeout(function () { ($(".nav-close", menu) || first).focus(); }, 50);
      doc.addEventListener("keydown", onKey);
    }
    function close(returnFocus) {
      menu.classList.remove("is-open");
      scrim.classList.remove("is-open");
      setTimeout(function () { scrim.hidden = true; }, 300);
      menu.removeAttribute("role");
      menu.removeAttribute("aria-modal");
      menu.removeAttribute("aria-label");
      toggle.setAttribute("aria-expanded", "false");
      doc.body.style.overflow = "";
      doc.removeEventListener("keydown", onKey);
      if (returnFocus !== false) toggle.focus();
    }
    function onKey(e) {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else trapFocus(menu, e);
    }

    toggle.addEventListener("click", open);
    $("[data-nav-close]", menu).addEventListener("click", function () { close(); });
    scrim.addEventListener("click", function () { close(); });
    $$("a", menu).forEach(function (a) {
      a.addEventListener("click", function () {
        if (menu.classList.contains("is-open")) close(false);
      });
    });
    desktop.addEventListener("change", function (e) {
      if (e.matches && menu.classList.contains("is-open")) close(false);
    });
  }

  /* ---------- Donate chooser ---------- */
  function initDonate() {
    var dlg = $("[data-donate-dialog]");
    if (!dlg || typeof dlg.showModal !== "function") return; // fall back to #give-online anchor
    var opener = null;

    $$("[data-donate]").forEach(function (btn) {
      btn.setAttribute("aria-haspopup", "dialog");
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        opener = btn;
        dlg.showModal();
        var first = $(".choice", dlg);
        if (first) first.focus();
      });
    });
    $$("[data-dialog-close]", dlg).forEach(function (b) {
      b.addEventListener("click", function () { dlg.close(); });
    });
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg) dlg.close(); // backdrop
    });
    $$(".choice", dlg).forEach(function (a) {
      a.addEventListener("click", function () { setTimeout(function () { dlg.close(); }, 0); });
    });
    dlg.addEventListener("close", function () {
      // Don't steal focus if a link inside the dialog already moved it (e.g. "Prefer to mail a check?").
      var a = doc.activeElement;
      var focusLost = !a || a === doc.body || dlg.contains(a);
      if (focusLost && opener && doc.contains(opener) && opener.offsetParent !== null) opener.focus();
    });
  }

  /* ---------- Mail a check ---------- */
  function initMail() {
    var card = $("#mail-a-check");
    if (!card) return;
    $$("[data-scroll-mail]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var dlg = a.closest("dialog");
        if (dlg && dlg.open) dlg.close();
        // The card sits in a content-visibility section; render it now so it can take focus.
        var lazy = card.closest(".give");
        if (lazy) lazy.style.contentVisibility = "visible";
        card.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        card.focus({ preventScroll: true });
        card.classList.remove("is-flash");
        void card.offsetWidth;
        card.classList.add("is-flash");
        if (history.replaceState) history.replaceState(null, "", "#mail-a-check");
      });
    });

    var copyBtn = $("[data-copy-address]");
    if (copyBtn) {
      var label = $("[data-copy-label]", copyBtn);
      copyBtn.addEventListener("click", function () {
        var text = (D.MAIL ? D.MAIL.lines : $("[data-mail-address]").innerText.split("\n")).join("\n");
        copyText(text).then(function () {
          label.textContent = "Address copied";
          toast("Mailing address copied");
          setTimeout(function () { label.textContent = "Copy address"; }, 2500);
        }, function () {
          toast("Couldn’t copy. Please select the address and copy it manually.");
        });
      });
    }
  }

  /* ---------- Share ---------- */
  function initShare() {
    var url = (D.SITE_URL || location.href.split("#")[0]) + "#letter";
    var shareData = {
      title: "Police Officers Christmas Angels: Celebrating 50 Years",
      text: "Join POCA for our 50th Christmas Eve of grocery deliveries in Corpus Christi.",
      url: url
    };
    $$("[data-share]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (navigator.share) {
          navigator.share(shareData).catch(function () { /* user cancelled */ });
          return;
        }
        copyText(url).then(function () {
          toast("Link copied. Paste it anywhere to share.");
        }, function () {
          toast("Couldn’t copy the link: " + url);
        });
      });
    });
  }

  /* ---------- Calendar (.ics) ---------- */
  function icsDate(iso) {
    return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  }
  function icsEscape(s) { return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n"); }
  function initCalendar() {
    var btn = $("[data-add-calendar]");
    if (!btn || !D.EVENT) return;
    btn.addEventListener("click", function () {
      var E = D.EVENT;
      var desc = "7:00 AM Please arrive early at " + E.venue + ", " + E.address + ".\n" +
        "7:30 AM Team Meeting and Staging (50th anniversary group photo).\n" +
        "Next: Load the groceries at the HEB east parking lot, Robert Drive and Alameda Street.\n" +
        "Deliver: Spread the Christmas joy (typically 2 to 3 hours).\n" + (D.SITE_URL || "");
      var lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//POCA Inc//50th Anniversary//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        "UID:poca-christmas-eve-" + E.start.slice(0, 10) + "@pocacc.org",
        "DTSTAMP:" + icsDate(new Date().toISOString()),
        "DTSTART:" + icsDate(E.start),
        "DTEND:" + icsDate(E.end),
        "SUMMARY:" + icsEscape(E.title),
        "LOCATION:" + icsEscape(E.venue + ", " + E.address),
        "DESCRIPTION:" + icsEscape(desc),
        "URL:" + (D.SITE_URL || ""),
        "BEGIN:VALARM",
        "TRIGGER:-PT12H",
        "ACTION:DISPLAY",
        "DESCRIPTION:" + icsEscape(E.title),
        "END:VALARM",
        "END:VEVENT",
        "END:VCALENDAR"
      ];
      var blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
      var a = doc.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "poca-christmas-eve-" + E.start.slice(0, 4) + ".ics";
      doc.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      toast("Calendar file downloaded");
    });
  }

  /* ---------- Countdown ---------- */
  function initCountdown() {
    var box = $("[data-countdown]");
    if (!box || !D.EVENT) return;
    var target = Date.parse(D.EVENT.start);
    if (isNaN(target) || target <= Date.now()) return;
    var parts = {};
    $$("[data-cd]", box).forEach(function (el) { parts[el.dataset.cd] = el; });
    $$(".cd-unit", box).forEach(function (u) { u.setAttribute("aria-hidden", "true"); });
    box.hidden = false;
    var lastMinute = -1, timer;

    function pad(n) { return n < 10 ? "0" + n : String(n); }
    function tick() {
      var ms = target - Date.now();
      if (ms <= 0) { box.hidden = true; clearInterval(timer); return; }
      var s = Math.floor(ms / 1000);
      var d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
      parts.d.textContent = d;
      parts.h.textContent = pad(h);
      parts.m.textContent = pad(m);
      parts.s.textContent = pad(sec);
      if (m !== lastMinute) {
        lastMinute = m;
        box.setAttribute("aria-label", "Time until Christmas Eve morning: " + d + " days, " + h + " hours, " + m + " minutes");
      }
    }
    tick();
    timer = setInterval(tick, 1000);
  }

  /* ---------- Counters ---------- */
  // width is measured by the caller in a batch, so starting several counters doesn't force a layout each.
  function animateCount(el, width) {
    var to = parseFloat(el.dataset.count);
    if (isNaN(to)) return;
    el.style.display = "inline-block";
    el.style.minWidth = width + "px";
    el.style.textAlign = "right";
    var dur = 1800, start = null;
    function step(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(to * eased);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = fmt(to);
    }
    el.textContent = "0";
    requestAnimationFrame(step);
  }
  function initCounters() {
    if (reduceMotion || !("IntersectionObserver" in window)) return; // real numbers already in the HTML
    var io = new IntersectionObserver(function (entries) {
      var visible = entries.filter(function (en) { return en.isIntersecting; });
      // Read all widths first (entry rects are already computed), then write.
      visible.forEach(function (en) {
        io.unobserve(en.target);
        animateCount(en.target, en.boundingClientRect.width);
      });
    }, { threshold: 0.6 });
    $$("[data-count]").forEach(function (el) { io.observe(el); });
  }

  /* ---------- Hero donation counter: digits roll into place like an odometer ---------- */
  function initOdometer() {
    if (reduceMotion) return; // the static digits are already correct
    var tiles = $$("[data-odo] .odo-d");
    var reels = tiles.map(function (tile) {
      var digit = parseInt(tile.textContent, 10);
      var reel = doc.createElement("span");
      reel.className = "odo-reel";
      // Two full turns of 0-9 so every digit visibly rolls.
      for (var i = 0; i < 20; i++) {
        var n = doc.createElement("span");
        n.textContent = i % 10;
        reel.appendChild(n);
      }
      tile.textContent = "";
      tile.appendChild(reel);
      return { reel: reel, digit: digit };
    });
    setTimeout(function () {
      reels.forEach(function (r, i) {
        r.reel.style.transitionDelay = i * 0.12 + "s";
        r.reel.style.transform = "translateY(-" + (10 + r.digit) * 5 + "%)";
      });
    }, 250);
  }

  /* ---------- Christmas Eve timeline as Santa's route ---------- */
  function initRoute() {
    var route = $("[data-route]");
    if (!route) return;
    var items = $$(".tl-item", route);
    function update() {
      ticking = false;
      // reads first
      var r = route.getBoundingClientRect();
      var trigger = window.innerHeight * 0.6;
      var h = r.height - 16;
      var p = Math.min(1, Math.max(0, (trigger - (r.top + 8)) / h));
      var passed = items.map(function (li) { return li.getBoundingClientRect().top + 10 <= trigger; });
      // then writes
      route.style.setProperty("--p", p.toFixed(4));
      route.style.setProperty("--y", (p * h).toFixed(1) + "px");
      items.forEach(function (li, i) { li.classList.toggle("is-passed", passed[i]); });
    }
    var ticking = false;
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    if (!("IntersectionObserver" in window)) {
      route.style.setProperty("--p", "1");
      items.forEach(function (li) { li.classList.add("is-passed"); });
      return;
    }
    // Only listen to scroll while the route is on screen.
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        onScroll();
      } else {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        update();
      }
    }).observe(route);
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    var els = $$(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Lightbox ---------- */
  function initLightbox() {
    var dlg = $("[data-lightbox-dialog]");
    var links = $$("[data-lightbox]");
    if (!dlg || typeof dlg.showModal !== "function" || !links.length) return;
    var img = $("[data-lb-img]", dlg);
    var cap = $("[data-lb-caption]", dlg);
    var index = 0, opener = null;

    function show(i) {
      index = (i + links.length) % links.length;
      var thumb = $("img", links[index]);
      img.src = links[index].getAttribute("href");
      img.alt = thumb ? thumb.alt : "";
      cap.textContent = (thumb ? thumb.alt : "") + "  (" + (index + 1) + " of " + links.length + ")";
    }
    links.forEach(function (a, i) {
      a.setAttribute("aria-label", "Open photo " + (i + 1) + " of " + links.length + ": " + ($("img", a).alt || ""));
      a.addEventListener("click", function (e) {
        e.preventDefault();
        opener = a;
        show(i);
        dlg.showModal();
        $("[data-lb-close]", dlg).focus();
      });
    });
    $("[data-lb-close]", dlg).addEventListener("click", function () { dlg.close(); });
    $("[data-lb-prev]", dlg).addEventListener("click", function () { show(index - 1); });
    $("[data-lb-next]", dlg).addEventListener("click", function () { show(index + 1); });
    dlg.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); show(index - 1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); show(index + 1); }
    });
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg || e.target.classList.contains("lb-figure")) dlg.close();
    });
    dlg.addEventListener("close", function () {
      if (opener) opener.focus();
    });

    // Basic swipe on touch screens.
    var x0 = null;
    dlg.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    dlg.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }

  var idle = window.requestIdleCallback || function (fn) { return setTimeout(fn, 200); };

  function init() {
    // Needed right away: data, navigation, donate chooser.
    applyData();
    initHeader();
    initMenu();
    initDonate();
    initMail();
    initShare();
    initCalendar();
    initReveal();
    initOdometer();
    initRoute();
    // Nice-to-have: wait until the browser is idle.
    idle(function () {
      initCountdown();
      initLightbox();
      initCounters();
    }, { timeout: 1500 });
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init);
  else init();
})();
