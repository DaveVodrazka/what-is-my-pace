import { AppState, PaceTime, RunTime, paceTimeToSeconds, runTimeToSeconds, secondsToPaceTime, secondsToRunTime } from "./core";

const MIN_SPEED = 1;    // km/h
const MAX_SPEED = 60;   // km/h — faster than any human runner

const MIN_PACE_S = 3600 / MAX_SPEED;  // 60s/km
const MAX_PACE_S = 3600 / MIN_SPEED;  // 3600s/km
const MIN_DISTANCE = 0.1;
const MAX_DISTANCE = 1000;
const MIN_TIME_S = 30;
const MAX_TIME_S = 360_000; // 100 hours

function hasTimeValue(rt: RunTime): boolean {
  return rt.hours !== undefined || rt.minutes !== undefined || rt.seconds !== undefined;
}

function hasPaceValue(pt: PaceTime): boolean {
  return pt.minutes !== undefined || pt.seconds !== undefined;
}

const KM_PER_MI = 1.60934;

export function resolve(s: AppState): AppState {
  const { distance, time, pace, distanceUnit, lastUpdated } = s;
  const target = lastUpdated[2];

  const timeS = runTimeToSeconds(time);
  const paceS = paceTimeToSeconds(pace);
  // pace is always min/km; convert distance to km for all calculations
  const distanceKm = distance !== undefined
    ? (distanceUnit === "mi" ? distance * KM_PER_MI : distance)
    : undefined;

  if (target === "pace") {
    if (distanceKm === undefined || distanceKm < MIN_DISTANCE || distanceKm > MAX_DISTANCE) return s;
    if (!hasTimeValue(time) || timeS < MIN_TIME_S || timeS > MAX_TIME_S) return s;
    const computed = timeS / distanceKm;
    if (computed < MIN_PACE_S || computed > MAX_PACE_S) return s;
    return { ...s, pace: secondsToPaceTime(computed) };
  }

  if (target === "time") {
    if (distanceKm === undefined || distanceKm < MIN_DISTANCE || distanceKm > MAX_DISTANCE) return s;
    if (!hasPaceValue(pace) || paceS < MIN_PACE_S || paceS > MAX_PACE_S) return s;
    const computed = paceS * distanceKm;
    if (computed < MIN_TIME_S || computed > MAX_TIME_S) return s;
    return { ...s, time: secondsToRunTime(computed) };
  }

  if (target === "distance") {
    if (!hasTimeValue(time) || timeS < MIN_TIME_S || timeS > MAX_TIME_S) return s;
    if (!hasPaceValue(pace) || paceS < MIN_PACE_S || paceS > MAX_PACE_S) return s;
    const computedKm = timeS / paceS;
    const computed = distanceUnit === "mi" ? computedKm / KM_PER_MI : computedKm;
    if (computed < MIN_DISTANCE || computed > MAX_DISTANCE) return s;
    return { ...s, distance: Math.round(computed * 100) / 100 };
  }

  return s;
}
