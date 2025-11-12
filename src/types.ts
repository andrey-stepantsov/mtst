export interface StandardTime {
  Event: string;
  B: string;
  BB: string;
  A: string;
  AA: string;
  AAA: string;
  AAAA: string;
}

export interface CutInfo {
  achievedCut: string;
  nextCut: string | null;
  absoluteDiff: string | null;
  relativeDiff: string | null;
}

export interface CourseStandards {
  [course: string]: StandardTime[];
}

export interface GenderStandards {
  [gender: string]: CourseStandards;
}

export interface AgeGroupStandards {
  [ageGroup: string]: GenderStandards;
}

export interface SelectedEvent {
  name:string;
  time: string;
}

export interface SwimmerProfile {
  age: string;
  gender: string;
  selectedEvents: { [course: string]: SelectedEvent[] };
}

export interface SwimmerProfiles {
  [swimmerName: string]: SwimmerProfile;
}
