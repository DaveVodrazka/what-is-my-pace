import { distanceChange, kmClick, miClick, makeTimeHandler, makePaceHandler, renderState, showDistanceDropdown, hideDistanceDropdown, selectPreset } from "./handler";
import { state } from "./state";

function getElemById(id: string) {
  const elem = document.getElementById(id);
  if (!elem) {
    const msg = `Could not get "${id}"`;
    throw Error(msg);
  }
  return elem;
}

function initTheme() {
  const btn = document.getElementById("theme-toggle")!;
  const root = document.documentElement;
  const saved = localStorage.getItem("theme");
  if (saved === "light") {
    root.classList.add("light");
    btn.textContent = "☀️";
  }
  btn.addEventListener("click", () => {
    const isLight = root.classList.toggle("light");
    btn.textContent = isLight ? "☀️" : "🌙";
    localStorage.setItem("theme", isLight ? "light" : "dark");
  });
}

export function registerHandlers() {
  initTheme();
  getElemById("km").onclick = kmClick;
  getElemById("mi").onclick = miClick;
  const distanceInputElem = getElemById("distance-input") as HTMLInputElement;
  distanceInputElem.oninput = distanceChange;
  distanceInputElem.addEventListener("focus", () => distanceInputElem.select());
  distanceInputElem.onfocus = showDistanceDropdown;
  distanceInputElem.onblur = hideDistanceDropdown;

  const dropdown = getElemById("distance-dropdown");
  dropdown.addEventListener("mousedown", (e) => e.preventDefault());
  dropdown.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest("[data-km]") as HTMLElement | null;
    if (btn?.dataset.km) {
      selectPreset(parseFloat(btn.dataset.km));
      distanceInputElem.blur();
    }
  });

  document.querySelectorAll<HTMLInputElement>(".time-box input").forEach(el => {
    el.addEventListener("focus", () => el.select());
  });

  getElemById("time-hour").oninput = makeTimeHandler("hours");
  getElemById("time-minute").oninput = makeTimeHandler("minutes");
  getElemById("time-second").oninput = makeTimeHandler("seconds");
  getElemById("pace-minute").oninput = makePaceHandler("minutes");
  getElemById("pace-second").oninput = makePaceHandler("seconds");

  renderState();

  const unit = getElemById("unit");
  const km = getElemById("km");
  const mi = getElemById("mi");
  if (state.distanceUnit === "mi") {
    unit.classList.add("mi-selected");
    mi.classList.add("active");
  } else {
    km.classList.add("active");
  }
}
