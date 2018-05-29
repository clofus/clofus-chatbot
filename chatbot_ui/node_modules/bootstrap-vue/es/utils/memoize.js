import { create } from './object';

export default function memoize(fn) {
  var cache = create(null);

  return function memoizedFn() {
    var args = JSON.stringify(arguments);
    return cache[args] = cache[args] || fn.apply(null, arguments);
  };
}