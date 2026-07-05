(function () {
  var STORAGE_KEY = "domainExpanded";
  var btn = document.getElementById("domain-expansion-toggle");
  if (!btn) return;

  function isExpanded() {
    return document.documentElement.classList.contains("domain-expanded");
  }

  function setState(expanded) {
    document.documentElement.classList.toggle("domain-expanded", expanded);
    btn.setAttribute("aria-pressed", expanded ? "true" : "false");
  }

  function spawnFlash() {
    var overlay = document.createElement("div");
    overlay.className = "domain-flash-overlay";
    var label = document.createElement("span");
    label.textContent = "領域展開";
    overlay.appendChild(label);
    document.body.appendChild(overlay);
    overlay.addEventListener("animationend", function () {
      overlay.remove();
    });
    // fallback in case animationend never fires (e.g. tab loses focus mid-animation)
    setTimeout(function () {
      if (overlay.parentNode) overlay.remove();
    }, 1500);
  }

  btn.setAttribute("aria-pressed", isExpanded() ? "true" : "false");

  btn.addEventListener("click", function () {
    var next = !isExpanded();
    setState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch (e) {}
    if (next) spawnFlash();
  });
})();
