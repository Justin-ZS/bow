// Never import any lib here!
// All utils should be pure function

export const isFunction = (x: unknown) => x && typeof x === 'function';
export const isRecord = (x: unknown) => x && typeof x === 'object' && !Array.isArray(x);
export const isArray = (x: unknown) => Array.isArray(x);
const isPropertyInRecord = (prop: string, obj: Record<string, unknown>) => Object.prototype.hasOwnProperty.call(obj, prop);

// (['a', 'd'], {a: 1, b: 2, c: 3, d: 4}) -> {a: 1, d: 4}
export const pick = <T = unknown>(
  names: string[],
  obj: Record<string, T>
): Record<string, T> => names
  .reduce((acc, name) => {
    if (isPropertyInRecord(name, obj)) {
      acc[name] = obj[name];
    }
    return acc;
  }, {});

// (['a', 'd'], {a: 1, b: 2, c: 3, d: 4}) -> {b: 2, c: 3}
export const omit = <T = unknown>(
  names: string[],
  obj: Record<string, T>
): Record<string, T> => {
  const map = names
    .reduce((acc, name) => {
      acc[name] = 1;
      return acc;
    }, {});

  return Object.keys(obj)
    .reduce((acc, name) => {
      if (!isPropertyInRecord(name, map)) {
        acc[name] = obj[name];
      }
      return acc;
    }, {});
};

export const once = <T extends (...args: any[]) => any>(fn: T) => {
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

// (i => i + 1, { a: 1, b: 2 }) -> { a: 2, b: 3 }
export const mapRecord = <T = unknown, V = unknown>(
  callbackfn: (value: T, key: string) => V,
  record: Record<string, T>,
): Record<string, V> => Object
  .keys(record)
  .reduce((acc, key) => {
    acc[key] = callbackfn(record[key], key);
    return acc;
  }, {});

// (String, Unknown) -> Record -> Boolean
export const isFn = <T = Record<string, unknown>>(
  prop: string,
  values: unknown,
) => {
  let matchValues = v => v === values;
  if (Array.isArray(values)) matchValues = v => values.includes(v);

  return (obj: T) => {
    if (obj && typeof obj === 'object') {
      return matchValues(obj[prop]);
    }
    return false;
  };
};
// [1, 2, 3] -> { 1: 1, 2: 2, 3: 3 }
// [{ key: 'A' }, { key: 'B' }] -> { A: { key: 'A' }, B: { key: 'B' } }
export const list2Record = (xs: any[], keyName = 'key') => xs
  .reduce((record, x, idx) => {
    if (!isRecord(x)) record[idx] = x;
    else record[x[keyName] ?? idx] = x;
    return record;
  }, {});

export const lens = (getter = i => i, setter) => ({
  view: getter,
  set: setter,
  over: (fn, obj) => setter(fn(getter(obj)), obj),
});

// get a function to exec string code
export const instantiate = (esCode: string, ...args: string[]) => Function(...args, `return ${esCode}`);