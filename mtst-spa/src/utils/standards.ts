import { CutInfo, StandardTime } from '../types';

// Helper function to convert time string (e.g., mm:ss.ff, ss.ff) to total seconds (float)
// Returns Infinity for invalid or empty time strings, treating them as very slow.
export const timeToSeconds = (timeString: string): number => {
  if (!timeString) {
    return Infinity;
  }

  const timeParts = timeString.split(':');
  let minutes = 0;
  let secondsAndHundredths;

  if (timeParts.length > 2) {
    return Infinity; // e.g. 1:2:3.45
  }

  if (timeParts.length === 2) {
    minutes = parseInt(timeParts[0], 10);
    secondsAndHundredths = timeParts[1];
  } else { // length is 1
    secondsAndHundredths = timeParts[0];
  }

  const secondParts = secondsAndHundredths.split('.');
  if (secondParts.length > 2) {
    return Infinity; // e.g. 5.6.7
  }

  const seconds = parseInt(secondParts[0], 10);
  let hundredths = 0;
  if (secondParts.length === 2) {
    // Pad with 0 to handle single digit hundredths (e.g., '5' becomes '50')
    const hundredthsStr = secondParts[1].padEnd(2, '0');
    // Take only first two digits for hundredths
    hundredths = parseInt(hundredthsStr.substring(0, 2), 10);
  }

  if (isNaN(minutes) || isNaN(seconds) || isNaN(hundredths) ||
      minutes < 0 || seconds < 0 || seconds >= 60 || hundredths < 0 || hundredths >= 100) {
    return Infinity;
  }

  return (minutes * 60) + seconds + (hundredths / 100);
};

// Helper function to convert total seconds (float) back to mm:ss.ff string
export const secondsToTimeString = (totalSeconds: number): string => {
  const absSeconds = Math.abs(totalSeconds); // Work with absolute value for formatting
  const minutes = Math.floor(absSeconds / 60);
  const seconds = Math.floor(absSeconds % 60);
  const hundredths = Math.floor((absSeconds * 100) % 100);

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');
  const formattedHundredths = String(hundredths).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}.${formattedHundredths}`;
};

// Helper function to determine the current and next cut, and differences
export const getCutInfo = (bestTime: string, standards: StandardTime | undefined): CutInfo => {
  if (!standards) {
    return {
      achievedCut: "N/A",
      nextCut: "Standards not found.",
      absoluteDiff: null,
      relativeDiff: null,
    };
  }

  const userTimeInSeconds = timeToSeconds(bestTime);

  if (userTimeInSeconds === Infinity) {
    return {
      achievedCut: "N/A",
      nextCut: "Enter a valid time (mm:ss.ff)",
      absoluteDiff: null,
      relativeDiff: null,
    };
  }

  const cuts = [
    { level: 'AAAA', time: timeToSeconds(standards.AAAA), timeStr: standards.AAAA },
    { level: 'AAA', time: timeToSeconds(standards.AAA), timeStr: standards.AAA },
    { level: 'AA', time: timeToSeconds(standards.AA), timeStr: standards.AA },
    { level: 'A', time: timeToSeconds(standards.A), timeStr: standards.A },
    { level: 'BB', time: timeToSeconds(standards.BB), timeStr: standards.BB },
    { level: 'B', time: timeToSeconds(standards.B), timeStr: standards.B },
  ].filter(cut => cut.time !== Infinity); // Filter out invalid/missing standards

  if (cuts.length === 0) {
    return {
      achievedCut: "N/A",
      nextCut: "No valid standards for this event.",
      absoluteDiff: null,
      relativeDiff: null,
    };
  }

  let achievedCutLevel: string = "None";
  let nextCutIndex = -1;

  // Find the highest standard the user has achieved
  for (let i = 0; i < cuts.length; i++) {
    if (userTimeInSeconds <= cuts[i].time) {
      achievedCutLevel = cuts[i].level;
      nextCutIndex = i - 1; // The next goal is the one at the previous index (faster)
      break;
    }
  }

  // Case 1: Slower than the slowest standard (e.g., 'B' cut)
  if (achievedCutLevel === "None") {
    const nextCut = cuts[cuts.length - 1]; // The slowest cut is the next goal
    const timeToImproveInSeconds = userTimeInSeconds - nextCut.time;
    const relativeImprovementPercentage = (timeToImproveInSeconds / userTimeInSeconds) * 100;

    return {
      achievedCut: "None",
      nextCut: `${nextCut.level} (${nextCut.timeStr})`,
      absoluteDiff: `-${secondsToTimeString(timeToImproveInSeconds)}`,
      relativeDiff: `-${relativeImprovementPercentage.toFixed(1)}%`,
    };
  }

  // Case 2: Achieved the fastest standard ('AAAA')
  if (nextCutIndex < 0) {
    return {
      achievedCut: achievedCutLevel, // Will be 'AAAA'
      nextCut: 'Achieved all cuts!',
      absoluteDiff: null,
      relativeDiff: null,
    };
  }

  // Case 3: In between standards
  const nextCut = cuts[nextCutIndex];
  const timeToImproveInSeconds = userTimeInSeconds - nextCut.time;
  const relativeImprovementPercentage = (timeToImproveInSeconds / userTimeInSeconds) * 100;

  return {
    achievedCut: achievedCutLevel,
    nextCut: `${nextCut.level} (${nextCut.timeStr})`,
    absoluteDiff: `-${secondsToTimeString(timeToImproveInSeconds)}`,
    relativeDiff: `-${relativeImprovementPercentage.toFixed(1)}%`,
  };
};
