import { AppState, ComputeField, PaceTime, RunTime, paceTimeToSeconds } from "./core";
import { resolve } from "./resolver";

const defaultState: AppState = {
  distanceUnit: "km",
  distance: undefined,
  time: {
    hours: undefined,
    minutes: undefined,
    seconds: undefined,
  },
  pace: {
    minutes: undefined,
    seconds: undefined,
  },
  speed: undefined,
  lastUpdated: ["distance", "time", "pace", "speed"],
};

export let state = defaultState;
const STATE_KEY = "app_state";

function isRunTime(v: unknown): v is RunTime {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    (o.hours === undefined || typeof o.hours === "number") &&
    (o.minutes === undefined || typeof o.minutes === "number") &&
    (o.seconds === undefined || typeof o.seconds === "number")
  );
}

function isPaceTime(v: unknown): v is PaceTime {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    (o.minutes === undefined || typeof o.minutes === "number") &&
    (o.seconds === undefined || typeof o.seconds === "number")
  );
}

const FIELDS: ComputeField[] = ["distance", "time", "pace", "speed"];

function isLastUpdated(v: unknown): v is [ComputeField, ComputeField, ComputeField, ComputeField] {
  return Array.isArray(v) && v.length === 4 && FIELDS.every((f) => v.includes(f));
}

function validateState(s: unknown): s is AppState {
  if (typeof s !== "object" || s === null) return false;
  const o = s as Record<string, unknown>;
  if (Array.isArray(o.lastUpdated) && o.lastUpdated.length === 3 &&
      ["distance", "time", "pace"].every(f => (o.lastUpdated as string[]).includes(f))) {
    o.lastUpdated = [...o.lastUpdated, "speed"];
  }
  return (
    (o.distanceUnit === "km" || o.distanceUnit === "mi") &&
    (o.distance === undefined || typeof o.distance === "number") &&
    (o.speed === undefined || typeof o.speed === "number") &&
    isRunTime(o.time) &&
    isPaceTime(o.pace) &&
    isLastUpdated(o.lastUpdated)
  );
}

function computeSpeed() {
  const paceS = paceTimeToSeconds(state.pace);
  state.speed = paceS > 0 ? Math.round((3600 / paceS) * 10) / 10 : undefined;
}

function touchLastUpdated(field: ComputeField) {
  state.lastUpdated = [field, ...state.lastUpdated.filter((f) => f !== field)] as [ComputeField, ComputeField, ComputeField, ComputeField];
}

function applyResolve() {
  const resolved = resolve(state);
  if (resolved !== state) {
    const target = state.lastUpdated[2];
    if (target === "pace") state.pace = resolved.pace;
    else if (target === "time") state.time = resolved.time;
    else if (target === "distance") state.distance = resolved.distance;
  }
  computeSpeed();
}

export function forceResolve() {
  applyResolve();
  saveState();
}

export function loadState() {
  const s = localStorage.getItem(STATE_KEY);
  if (!s) {
    state = defaultState;
    return;
  }
  try {
    const stateObject = JSON.parse(s);
    if (validateState(stateObject)) {
      state = stateObject;
      applyResolve();
      saveState();
    } else {
      state = defaultState;
    }
  } catch (e) {
    console.error(e);
    state = defaultState;
  }
}

export function saveState() {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

export function updateDistance(d: number | undefined) {
  state.distance = d;
  touchLastUpdated("distance");
  applyResolve();
  saveState();
}

export function updateDistanceUnit(du: "km" | "mi") {
  state.distanceUnit = du;
  saveState();
}

export function convertUnits(oldUnit: "km" | "mi") {
  const factor = oldUnit === "km" ? 1 / 1.60934 : 1.60934;
  if (state.distance !== undefined) {
    state.distance = Math.round(state.distance * factor * 100) / 100;
  }
  saveState();
}

export function updateTime(field: keyof RunTime, v: number | undefined) {
  state.time[field] = v;
  touchLastUpdated("time");
  applyResolve();
  saveState();
}

export function updatePace(field: keyof PaceTime, v: number | undefined) {
  state.pace[field] = v;
  touchLastUpdated("pace");
  applyResolve();
  saveState();
}
