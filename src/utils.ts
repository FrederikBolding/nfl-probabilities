export function setDiff<T>(a: T[], b: T[]) {
  return a.filter((x) => !b.includes(x));
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

export function separate<T>(array: T[], index: number) {
  // Can we do this without copying and splicing?
  const copy = [...array];
  const separatedItem = copy.splice(index);
  return [copy, separatedItem[0]];
}