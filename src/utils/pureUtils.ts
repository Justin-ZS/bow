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
