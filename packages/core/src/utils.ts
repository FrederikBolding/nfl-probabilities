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

export function findMinIndex(array: number[]) {
  let hasSeenDifferent = false;
  const min = array.reduce<{ value: number; index: number } | null>(
    (acc, value, index) => {
      if (acc && value !== acc.value) {
        hasSeenDifferent = true;
      }
      if (acc && value > acc.value) {
        return acc;
      }
      return { value, index };
    },
    null
  );

  if (!hasSeenDifferent || !min) {
    return -1;
  }
  return min.index;
}

export function findMinIndexMap<T>(array: T[], mapFn: (value: T) => number) {
  let hasSeenDifferent = false;
  const min = array.reduce<{ value: number; index: number } | null>(
    (acc, value, index) => {
      const mappedValue = mapFn(value);
      if (acc && mappedValue !== acc.value) {
        hasSeenDifferent = true;
      }
      if (acc && mappedValue > acc.value) {
        return acc;
      }
      return { value: mappedValue, index };
    },
    null
  );

  if (!hasSeenDifferent || !min) {
    return -1;
  }
  return min.index;
}

export function separate<T>(array: T[], index: number) {
  // TODO: Can we do this without copying and splicing?
  const copy = [...array];
  const separatedItem = copy.splice(index, 1);
  return [copy, separatedItem[0]];
}
