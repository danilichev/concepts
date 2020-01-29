export const compose = (fn, ...fns) =>
  fns.length === 0 ? fn : (...args) => fn(compose(...fns)(...args));
