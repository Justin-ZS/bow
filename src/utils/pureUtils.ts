// Never import any lib here!
// All utils should be pure function

export const pick = <T = unknown>(
  names: string[],
  obj: Record<string, T>
): Record<string, T> => names
  .reduce((acc, name) => {
    if (name in obj) {
      acc[name] = obj[name];
    }
    return acc;
  }, {});