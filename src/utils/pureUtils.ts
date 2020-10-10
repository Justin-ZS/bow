// Never import any lib here!
// All utils should be pure function

// (['a', 'd'], {a: 1, b: 2, c: 3, d: 4}) -> {a: 1, d: 4}
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

export const once = <T extends (...args: any) => any>(fn: T) => {
  let isCalled = false;
  const wrapped = (...args: Parameters<T>): ReturnType<T> => {
    if (isCalled) return;

    isCalled = true;
    return fn(...args);
  };

  Object.defineProperty(wrapped, 'isCalled', {
    get() { return isCalled; },
    configurable: false,
  });
  return wrapped;
};

// (1, 5) -> [1, 2, 3, 4]
export const range = (from: number, to: number) => {
  const result: number[] = [];
  let n = from;
  while (n < to) {
    result.push(n);
    n += 1;
  }
  return result;
};
