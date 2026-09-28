(function () {
  "use strict";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    var items = $$(".reveal");
    if (!("IntersectionObserver" in window) || !items.length) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Kinetic hero word ---------- */
  function initWordSwap() {
    var el = $("[data-words]");
    if (!el) return;
    var words;
    try { words = JSON.parse(el.getAttribute("data-words")); } catch (e) { return; }
    if (!words || words.length < 2) return;
    var i = 0;
    setInterval(function () {
      el.classList.add("is-out");
      setTimeout(function () {
        i = (i + 1) % words.length;
        el.textContent = words[i];
        el.classList.remove("is-out");
      }, 260);
    }, 2600);
  }

  /* ---------- Animated counters ---------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (isNaN(target)) return;
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1400, start = null;
    function fmt(n) {
      return prefix + (n >= 1000 ? n.toLocaleString("en-US") : String(n)) + suffix;
    }
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function initCounters() {
    var counters = $$("[data-count]");
    if (!counters.length) return;
    if (!("IntersectionObserver" in window)) {
      counters.forEach(animateCount);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Waitlist form ---------- */
  function initWaitlist() {
    var form = $("#waitlist");
    if (!form) return;
    var input = $("#waitlistEmail");
    var msg = $("#waitlistMsg");
    if (!input || !msg) return;
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    input.addEventListener("input", function () {
      input.classList.remove("is-invalid");
      input.removeAttribute("aria-invalid");
      msg.textContent = "";
      msg.className = "waitlist__msg";
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var value = input.value.trim();
      if (!value) {
        input.classList.add("is-invalid");
        input.setAttribute("aria-invalid", "true");
        msg.textContent = "Please enter your work email.";
        msg.className = "waitlist__msg is-error";
        input.focus();
        return;
      }
      if (!EMAIL_RE.test(value)) {
        input.classList.add("is-invalid");
        input.setAttribute("aria-invalid", "true");
        msg.textContent = "That doesn\u2019t look like a valid email \u2014 check the format.";
        msg.className = "waitlist__msg is-error";
        input.focus();
        return;
      }
      msg.textContent = "You\u2019re on the list. We\u2019ll reach out when your workspace is ready.";
      msg.className = "waitlist__msg is-success";
      input.value = "";
      input.classList.remove("is-invalid");
      input.removeAttribute("aria-invalid");
    });
  }

  /* ---------- Demo tabs ---------- */
  var DEMO_DATA = {
    funnels: {
      title: "Signup \u2192 Activated funnel",
      delta: "+12.4% vs last month",
      caption: "Visitors who complete onboarding convert to paid at 3.1x the rate.",
      bars: [92, 64, 48, 37, 31, 28, 24]
    },
    retention: {
      title: "Week-1 retention by cohort",
      delta: "+3.2pts vs Q4 average",
      caption: "Cohorts exposed to the new dashboard retain 8 points better at week one.",
      bars: [88, 72, 60, 55, 52, 50, 49]
    },
    revenue: {
      title: "MRR growth, trailing 7 months",
      delta: "+$14.2k MRR this quarter",
      caption: "Expansion revenue from Growth-plan upgrades now outpaces new-logo MRR.",
      bars: [30, 38, 42, 55, 63, 78, 94]
    }
  };

  function initDemoTabs() {
    var tabs = $$(".tab");
    var chart = $("#demoChart");
    var title = $("#demoTitle");
    var delta = $("#demoDelta");
    var caption = $("#demoCaption");
    if (!tabs.length || !chart) return;

    function render(key) {
      var data = DEMO_DATA[key];
      if (!data) return;
      if (title) title.textContent = data.title;
      if (delta) delta.textContent = data.delta;
      if (caption) caption.textContent = data.caption;
      chart.innerHTML = "";
      data.bars.forEach(function (h, i) {
        var span = document.createElement("span");
        span.style.setProperty("--h", h + "%");
        span.style.setProperty("--i", i);
        chart.appendChild(span);
      });
    }

    // roving tabindex: активный таб в порядке табуляции, остальные — через стрелки
    function activate(tab, moveFocus) {
      tabs.forEach(function (t) {
        var active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", active ? "true" : "false");
        t.setAttribute("tabindex", active ? "0" : "-1");
      });
      if (moveFocus) tab.focus();
      render(tab.getAttribute("data-tab"));
    }

    tabs.forEach(function (tab, idx) {
      tab.addEventListener("click", function () {
        activate(tab, false);
      });
      tab.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowRight") next = tabs[(idx + 1) % tabs.length];
        else if (e.key === "ArrowLeft") next = tabs[(idx - 1 + tabs.length) % tabs.length];
        else if (e.key === "Home") next = tabs[0];
        else if (e.key === "End") next = tabs[tabs.length - 1];
        if (next) {
          e.preventDefault();
          activate(next, true);
        }
      });
    });

    tabs.forEach(function (t, i) {
      t.setAttribute("tabindex", i === 0 ? "0" : "-1");
    });

    render("funnels");
  }

  /* ---------- Pricing toggle ---------- */
  function initBillingToggle() {
    var toggle = $("#billingToggle");
    if (!toggle) return;
    var amounts = $$(".plan__amount");
    var labels = $$(".billing__label");
    toggle.addEventListener("click", function () {
      var yearly = toggle.getAttribute("aria-checked") !== "true";
      toggle.setAttribute("aria-checked", yearly ? "true" : "false");
      amounts.forEach(function (el) {
        var v = yearly ? el.getAttribute("data-yearly") : el.getAttribute("data-monthly");
        if (v) el.textContent = "$" + v;
      });
      labels.forEach(function (l) {
        l.classList.toggle("is-active", l.getAttribute("data-label") === (yearly ? "yearly" : "monthly"));
      });
    });
  }

  /* ---------- Mobile nav ---------- */
  function initMobileNav() {
    var toggle = $("#navToggle");
    var links = $(".nav__links");
    if (!toggle || !links) return;
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$("a", links).forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- FAQ: close others ---------- */
  function initAccordion() {
    var accs = $$("details.acc");
    accs.forEach(function (d) {
      d.addEventListener("toggle", function () {
        if (d.open) accs.forEach(function (o) { if (o !== d) o.open = false; });
      });
    });
  }

  function init() {
    initReveal();
    initWordSwap();
    initCounters();
    initWaitlist();
    initDemoTabs();
    initBillingToggle();
    initMobileNav();
    initAccordion();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
