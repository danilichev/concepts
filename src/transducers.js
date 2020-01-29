import { compose } from './compose';

const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const isOdd = val => val % 2 !== 0;
const double = val => val * 2;
const sum = (a, b) => a + b;

const doubleOddSum = arr
  .filter(isOdd)
  .map(double)
  .reduce(sum, 0);

console.log('Initial result:', doubleOddSum);

const filterReducer = pred => (acc, val) =>
  pred(val) ? acc.concat([val]) : acc;

const mapReducer = map => (acc, val) => acc.concat(map(val));

const doubleOddSumByReducers = arr
  .reduce(filterReducer(isOdd), [])
  .reduce(mapReducer(double), [])
  .reduce(sum, 0);

console.log('With reducers:', doubleOddSumByReducers);

export const filterTransducer = pred => reduce => (acc, val) =>
  pred(val) ? reduce(acc, val) : acc;

export const mapTransducer = map => reduce => (acc, val) =>
  reduce(acc, map(val));

const doubleOddSumByComposeTransducers = arr.reduce(
  compose(filterTransducer(isOdd), mapTransducer(double))(sum),
  0
);

console.log('With compose transducers:', doubleOddSumByComposeTransducers);

export const transduce = (xform, reduce, init, arr) =>
  arr.reduce(xform(reduce), init);

const doubleOddSumByTransduce = transduce(
  compose(filterTransducer(isOdd), mapTransducer(double)),
  sum,
  0,
  arr
);

console.log('With transduce:', doubleOddSumByTransduce);
