// Edge Waypoint - the back-of-the-napkin calculator.
// Same arithmetic used in the workshop: minutes × times-per-week × 48 × loaded rate.

(function () {
  var mins = document.getElementById("ws-mins");
  var times = document.getElementById("ws-times");
  var rate = document.getElementById("ws-rate");
  var out = document.getElementById("ws-out");
  var hrs = document.getElementById("ws-hrs");
  if (!mins || !out) return;

  function num(el, fallback) {
    var v = parseFloat(el.value);
    return isFinite(v) && v >= 0 ? v : fallback;
  }

  function fmt(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }

  function update() {
    var m = num(mins, 0);
    var t = num(times, 0);
    var r = num(rate, 0);
    var hoursPerYear = (m / 60) * t * 48; // 48 working weeks; nobody automates their vacation
    var annual = hoursPerYear * r * 1.35; // 1.35 = the loaded-cost multiplier (taxes, benefits, overhead)
    out.textContent = fmt(annual);
    hrs.textContent = Math.round(hoursPerYear).toLocaleString("en-US") + " hours";
  }

  [mins, times, rate].forEach(function (el) {
    el.addEventListener("input", update);
  });
  update();
})();
