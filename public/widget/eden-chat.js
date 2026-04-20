(function () {
  "use strict";

  // ── Hostname → facility ID lookup (for bookmarklet / console injection) ──
  var HOST_MAP = {
    "edenbrookedina.com": "edenbrook-edina",
    "edenbrookrochester.com": "edenbrook-rochester",
    "edenbrookrochesterwest.com": "edenbrook-rochester-west",
    "edenbrookstcloud.com": "edenbrook-st-cloud",
    "edenbrookpinehaven.com": "edenbrook-pine-haven",
    "naturespointrehab.com": "natures-point",
    "fairoakslodge.com": "fair-oaks-lodge",
    "edenbrookappleton.com": "edenbrook-appleton",
    "edenbrookgreenbay.com": "edenbrook-green-bay",
    "edenbrookfonddulac.com": "edenbrook-fond-du-lac",
    "edenbrookoshkosh.com": "edenbrook-oshkosh",
    "edenbrookplatteville.com": "edenbrook-platteville",
    "edenbrooksheboygan.com": "edenbrook-sheboygan",
    "edenbrookwisconsinrapids.com": "edenbrook-wisconsin-rapids",
    "edenbrooklakeside.com": "edenbrook-lakeside",
    "whisperingpinesrehab.com": "whispering-pines",
    "omrocarecenter.com": "omro-care-center",
    "friendlyvillagerehab.com": "friendly-village",
    "evansvillemanor.com": "evansville-manor",
    "wolvertonglenhcc.com": "wolverton-glen",
    "edenhampton.com": "eden-hampton",
    "edennorthpa.com": "eden-north",
    "edensouthpa.com": "eden-south",
    "edenyeadon.com": "eden-yeadon",
    "edengreenwoodhill.com": "eden-greenwood-hill",
    "edensecondave.com": "eden-second-ave",
    "theheightsatevansville.com": "heights-at-evansville",
    "woodsideseniorcommunities.com": "woodside-senior",
    "woodsofcaledonia.com": "woods-of-caledonia",
    "hilltopseniorliving.com": "hilltop-senior-living",
    "vistapinehaven.com": "vista-pine-haven",
    "missioncreekseniorliving.com": "mission-creek",
    "edenvistaoshkosh.com": "eden-vista-oshkosh",
    "edenvistastow.com": "eden-vista-stow"
  };

  function detectFacilityFromHostname() {
    var host = window.location.hostname.replace(/^www\./, "");
    return HOST_MAP[host] || null;
  }

  // ── Config ────────────────────────────────────────────────────────────────
  var script =
    document.currentScript ||
    document.querySelector('script[data-facility-id]');

  var facilityId = (script && script.getAttribute("data-facility-id")) || detectFacilityFromHostname();
  if (!facilityId) return; // unknown site, no facility to load

  var position = (script && script.getAttribute("data-position")) || "bottom-right";
  var primaryColor = (script && script.getAttribute("data-primary-color")) || "#2E5A3A";
  var appUrl =
    (script && script.getAttribute("data-app-url")) ||
    (script && script.src
      ? script.src.replace(/\/widget\/eden-chat\.js.*$/, "")
      : "https://eden.jstech-inc.com");

  // ── Namespace prefix — keeps our IDs from clashing on WordPress sites ─────
  var NS = "eden-chat-";

  // ── Prevent double-init ───────────────────────────────────────────────────
  if (document.getElementById(NS + "root")) return;

  // ── Helpers ───────────────────────────────────────────────────────────────
  function css(el, styles) {
    Object.assign(el.style, styles);
  }

  function isSmallScreen() {
    return window.innerWidth < 640;
  }

  // ── Position config ───────────────────────────────────────────────────────
  var posMap = {
    "bottom-right": { bottom: "20px", right: "20px", left: "auto", top: "auto" },
    "bottom-left":  { bottom: "20px", left: "20px", right: "auto", top: "auto" },
  };
  var pos = posMap[position] || posMap["bottom-right"];

  // ── Root container (invisible anchor) ────────────────────────────────────
  var root = document.createElement("div");
  root.id = NS + "root";
  css(root, { position: "fixed", zIndex: "2147483647", bottom: "0", right: "0" });
  document.body.appendChild(root);

  // ── Styles injected into <head> ───────────────────────────────────────────
  var styleTag = document.createElement("style");
  styleTag.id = NS + "styles";
  styleTag.textContent = [
    "#" + NS + "bubble {",
    "  position: fixed;",
    "  width: 60px;",
    "  height: 60px;",
    "  border-radius: 50%;",
    "  background-color: " + primaryColor + ";",
    "  border: none;",
    "  cursor: pointer;",
    "  display: flex;",
    "  align-items: center;",
    "  justify-content: center;",
    "  box-shadow: 0 4px 16px rgba(0,0,0,0.25);",
    "  transition: transform 0.15s ease, box-shadow 0.15s ease;",
    "  bottom: " + pos.bottom + ";",
    "  right: " + pos.right + ";",
    "  left: " + pos.left + ";",
    "  z-index: 2147483646;",
    "}",
    "#" + NS + "bubble:hover { transform: scale(1.07); box-shadow: 0 6px 20px rgba(0,0,0,0.3); }",
    "#" + NS + "bubble:active { transform: scale(0.95); }",
    "#" + NS + "overlay {",
    "  position: fixed;",
    "  z-index: 2147483645;",
    "  display: none;",
    "}",
    "#" + NS + "overlay.eden-chat-open { display: block; }",
    "#" + NS + "iframe {",
    "  border: none;",
    "  border-radius: 16px;",
    "  box-shadow: 0 8px 32px rgba(0,0,0,0.2);",
    "  width: 400px;",
    "  height: 600px;",
    "  display: block;",
    "}",
    "#" + NS + "close {",
    "  position: absolute;",
    "  background: #fff;",
    "  border: 1px solid #e5e7eb;",
    "  border-radius: 50%;",
    "  width: 28px;",
    "  height: 28px;",
    "  cursor: pointer;",
    "  display: flex;",
    "  align-items: center;",
    "  justify-content: center;",
    "  font-size: 16px;",
    "  line-height: 1;",
    "  color: #374151;",
    "  box-shadow: 0 2px 8px rgba(0,0,0,0.15);",
    "  transition: background 0.15s;",
    "  top: -10px;",
    "  right: -10px;",
    "  z-index: 1;",
    "}",
    "#" + NS + "close:hover { background: #f3f4f6; }",
    "@media (max-width: 639px) {",
    "  #" + NS + "overlay.eden-chat-open {",
    "    inset: 0;",
    "    background: rgba(0,0,0,0.4);",
    "  }",
    "  #" + NS + "iframe {",
    "    position: fixed;",
    "    inset: 0;",
    "    width: 100vw;",
    "    height: 100dvh;",
    "    border-radius: 0;",
    "    box-shadow: none;",
    "  }",
    "  #" + NS + "close {",
    "    top: 12px;",
    "    right: 12px;",
    "    width: 36px;",
    "    height: 36px;",
    "    font-size: 20px;",
    "  }",
    "}",
  ].join("\n");
  document.head.appendChild(styleTag);

  // ── SVG icons ─────────────────────────────────────────────────────────────
  var ICON_CHAT =
    '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  var ICON_CLOSE =
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  // ── Floating bubble button ────────────────────────────────────────────────
  var bubble = document.createElement("button");
  bubble.id = NS + "bubble";
  bubble.setAttribute("aria-label", "Open Eden Care Assistant");
  bubble.innerHTML = ICON_CHAT;
  document.body.appendChild(bubble);

  // ── Iframe overlay (created lazily on first open) ─────────────────────────
  var overlay = null;
  var iframe = null;
  var iframeReady = false;

  function buildOverlay() {
    overlay = document.createElement("div");
    overlay.id = NS + "overlay";

    // Position overlay above the bubble
    var small = isSmallScreen();
    if (!small) {
      css(overlay, {
        bottom: "92px", // 60px bubble + 12px gap + 20px from edge
        [pos.right !== "auto" ? "right" : "left"]:
          pos.right !== "auto" ? pos.right : pos.left,
      });
    }

    // Close button (X) for the panel
    var closeBtn = document.createElement("button");
    closeBtn.id = NS + "close";
    closeBtn.setAttribute("aria-label", "Close chat");
    closeBtn.innerHTML = "&#x2715;";
    css(closeBtn, { color: "#374151" });
    closeBtn.addEventListener("click", closeWidget);

    // Iframe pointing at /widget?facilityId=...
    iframe = document.createElement("iframe");
    iframe.id = NS + "iframe";
    iframe.setAttribute(
      "src",
      appUrl + "/widget?facilityId=" + encodeURIComponent(facilityId)
    );
    iframe.setAttribute("title", "Eden Care Assistant");
    iframe.setAttribute("allow", "");
    iframe.setAttribute("loading", "eager");

    iframe.addEventListener("load", function () {
      iframeReady = true;
    });

    overlay.appendChild(closeBtn);
    overlay.appendChild(iframe);
    document.body.appendChild(overlay);
  }

  // ── Open / close ──────────────────────────────────────────────────────────
  var isOpen = false;

  function openWidget() {
    if (!overlay) buildOverlay();

    // Reposition for current screen size each open
    if (!isSmallScreen()) {
      var side = pos.right !== "auto" ? "right" : "left";
      var offset = pos.right !== "auto" ? pos.right : pos.left;
      css(overlay, { bottom: "92px" });
      overlay.style[side] = offset;
      overlay.style[side === "right" ? "left" : "right"] = "auto";
    }

    overlay.classList.add("eden-chat-open"); // eden-chat-open
    bubble.setAttribute("aria-label", "Close Eden Care Assistant");
    bubble.innerHTML = ICON_CLOSE;
    isOpen = true;
  }

  function closeWidget() {
    if (!overlay) return;
    overlay.classList.remove("eden-chat-open");
    bubble.setAttribute("aria-label", "Open Eden Care Assistant");
    bubble.innerHTML = ICON_CHAT;
    isOpen = false;
  }

  bubble.addEventListener("click", function () {
    isOpen ? closeWidget() : openWidget();
  });

  // Close on Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen) closeWidget();
  });

  // Reposition on resize
  window.addEventListener("resize", function () {
    if (!overlay || !isOpen) return;
    if (isSmallScreen()) {
      // Mobile styles handled by CSS @media — clear any inline positioning
      overlay.style.bottom = "";
      overlay.style.right = "";
      overlay.style.left = "";
    } else {
      var side = pos.right !== "auto" ? "right" : "left";
      var offset = pos.right !== "auto" ? pos.right : pos.left;
      css(overlay, { bottom: "92px" });
      overlay.style[side] = offset;
      overlay.style[side === "right" ? "left" : "right"] = "auto";
    }
  });
})();
