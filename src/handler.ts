import { state, updateDistance, updateDistanceUnit, updateTime, updatePace, convertUnits, forceResolve } from "./state";
import { PaceTime, RunTime } from "./core";

export function kmClick() {
  if (state.distanceUnit === "km") return;
  convertUnits("mi");
  updateDistanceUnit("km");
  renderState();
  document.getElementById("unit")!.classList.remove("mi-selected");
  document.getElementById("km")!.classList.add("active");
  document.getElementById("mi")!.classList.remove("active");
}

export function miClick() {
  if (state.distanceUnit === "mi") return;
  convertUnits("km");
  updateDistanceUnit("mi");
  renderState();
  document.getElementById("unit")!.classList.add("mi-selected");
  document.getElementById("km")!.classList.remove("active");
  document.getElementById("mi")!.classList.add("active");
}

const fmt = (v: number | undefined) => v !== undefined ? String(v).padStart(2, "0") : "";

function renderRunTime(rt: RunTime) {
  (document.getElementById("time-hour") as HTMLInputElement).value = fmt(rt.hours);
  (document.getElementById("time-minute") as HTMLInputElement).value = fmt(rt.minutes);
  (document.getElementById("time-second") as HTMLInputElement).value = fmt(rt.seconds);
}

function renderPaceTime(pt: PaceTime) {
  (document.getElementById("pace-minute") as HTMLInputElement).value = fmt(pt.minutes);
  (document.getElementById("pace-second") as HTMLInputElement).value = fmt(pt.seconds);
}

function renderSpeed() {
  document.getElementById("speed")!.textContent =
    state.speed !== undefined ? String(state.speed) : "–";
}

export function renderState() {
  (document.getElementById("distance-input") as HTMLInputElement).value =
    state.distance !== undefined ? String(state.distance) : "";
  renderRunTime(state.time);
  renderPaceTime(state.pace);
  renderSpeed();
}

export function showDistanceDropdown() {
  document.getElementById("distance-dropdown")!.classList.add("open");
}

export function hideDistanceDropdown() {
  document.getElementById("distance-dropdown")!.classList.remove("open");
}

export function selectPreset(km: number) {
  const value = state.distanceUnit === "mi"
    ? Math.round(km / 1.60934 * 100) / 100
    : Math.round(km * 100) / 100;
  updateDistance(value);
  forceResolve();
  renderState();
  hideDistanceDropdown();
}

export function renderResolved() {
  const target = state.lastUpdated[2];
  if (target === "pace") renderPaceTime(state.pace);
  else if (target === "time") renderRunTime(state.time);
  else if (target === "distance") {
    (document.getElementById("distance-input") as HTMLInputElement).value =
      state.distance !== undefined ? String(state.distance) : "";
  }
  renderSpeed();
}

function parseTimeField(value: string): number | undefined {
  if (value === "") return undefined;
  const n = parseInt(value, 10);
  return isNaN(n) ? undefined : n;
}

export function makeTimeHandler(field: keyof RunTime) {
  return (event: Event) => {
    const v = (event.target as HTMLInputElement).value;
    updateTime(field, parseTimeField(v));
    renderResolved();
  };
}

export function makePaceHandler(field: keyof PaceTime) {
  return (event: Event) => {
    const v = (event.target as HTMLInputElement).value;
    updatePace(field, parseTimeField(v));
    renderResolved();
  };
}

export function distanceChange(event: Event) {
  const v = (event.target as HTMLInputElement).value;

  if (v === "") {
    updateDistance(undefined);
    renderResolved();
    return;
  }

  const num = parseFloat(v.replace(",", "."));
  if (isNaN(num)) {
    return;
  }
  updateDistance(num);
  renderResolved();
}
