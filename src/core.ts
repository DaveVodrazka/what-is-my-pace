export type RunTime = {
  hours: number | undefined;
  minutes: number | undefined;
  seconds: number | undefined;
};

export type PaceTime = {
  minutes: number | undefined;
  seconds: number | undefined;
};

export type DistanceUnit = "km" | "mi";

export type ComputeField = "distance" | "time" | "pace" | "speed";

export type AppState = {
  distanceUnit: DistanceUnit;
  distance: number | undefined;
  time: RunTime;
  pace: PaceTime;
  speed: number | undefined;
  lastUpdated: [ComputeField, ComputeField, ComputeField, ComputeField];
};

export function runTimeToSeconds(runTime: RunTime): number {
  const { hours, minutes, seconds } = runTime;
  return (hours !== undefined ? hours * 3600 : 0) +
         (minutes !== undefined ? minutes * 60 : 0) +
         (seconds !== undefined ? seconds : 0);
}

export function secondsToRunTime(total: number): RunTime {
  const rounded = Math.round(total);
  const h = Math.floor(rounded / 3600);
  const m = Math.floor((rounded % 3600) / 60);
  const s = rounded % 60;
  return {
    hours: h > 0 ? h : undefined,
    minutes: h > 0 || m > 0 ? m : undefined,
    seconds: h > 0 || m > 0 || s > 0 ? s : undefined,
  };
}

export function paceTimeToSeconds(paceTime: PaceTime): number {
  const { minutes, seconds } = paceTime;
  return (minutes !== undefined ? minutes * 60 : 0) +
         (seconds !== undefined ? seconds : 0);
}

export function secondsToPaceTime(total: number): PaceTime {
  const rounded = Math.round(total);
  const m = Math.floor(rounded / 60);
  const s = rounded % 60;
  return {
    minutes: m > 0 ? m : undefined,
    seconds: m > 0 || s > 0 ? s : undefined,
  };
}
