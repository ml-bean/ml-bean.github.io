(function () {
  var STORAGE_KEY = "domainExpanded";
  var btn = document.getElementById("domain-expansion-toggle");
  if (!btn) return;

  function isExpanded() {
    return document.documentElement.classList.contains("domain-expanded");
  }

  function setState(expanded) {
    document.documentElement.classList.toggle("domain-expanded", expanded);
    btn.setAttribute("aria-checked", expanded ? "true" : "false");
  }

  btn.setAttribute("aria-checked", isExpanded() ? "true" : "false");

  btn.addEventListener("click", function () {
    var next = !isExpanded();
    setState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch (e) {}
  });
})();
