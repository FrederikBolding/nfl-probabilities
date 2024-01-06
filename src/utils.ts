export function setDiff<T>(a: T[], b: T[]) {
  return a.filter((x) => !b.includes(x));
}
