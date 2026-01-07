import { TeamRecord } from "./records";

export function filterMap<T, R>(
  array: T[],
  filterFn: (value: T) => boolean,
  mapFn: (value: T) => R
): R[] {
  return array.reduce<R[]>((accumulator, current) => {
    if (filterFn(current)) {
      accumulator.push(mapFn(current));
    }
    return accumulator;
  }, []);
}

export enum TiebreakResult {
  Winner,
  Eliminated,
}

export type Tiebreak = {
  result: TiebreakResult;
  index: number;
} | null;

type IndexAndValue = { value: number; index: number } | null;

export function findTiebreak(
  records: TeamRecord[],
  mapFn: (record: TeamRecord) => number
): Tiebreak {
  let hasSeenMultipleValues = false;
  const result = records.reduce<{ min: IndexAndValue; max: IndexAndValue }>(
    (accumulator, record, index) => {
      let { min, max } = accumulator;
      const value = mapFn(record);

      if (min && min.value !== value) {
        hasSeenMultipleValues = true;
      }

      if (max && max.value !== value) {
        hasSeenMultipleValues = true;
      }

      if (!min || value < min.value) {
        min = { index, value };
      }

      if (!max || value > max.value) {
        max = { index, value };
      }

      return { min, max };
    },
    { min: null, max: null }
  );

  if (!hasSeenMultipleValues) {
    return null;
  }

  const { min, max } = result;

  // If we've either found either a distinct maximum or minimum value, we can break the tie and continue.
  if (max) {
    return { result: TiebreakResult.Winner, index: max.index };
  }

  if (min) {
    return { result: TiebreakResult.Eliminated, index: min.index };
  }

  return null;
}

export function separate<T>(array: T[], index: number) {
  // TODO: Can we do this without copying and splicing?
  const copy = [...array];
  const separatedItem = copy.splice(index, 1);
  return [copy, separatedItem[0]];
}
