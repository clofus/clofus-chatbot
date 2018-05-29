var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

import { isArray } from './array';
import { assign } from './object';
import identity from './identity';

/**
 * @param {[]|{}} props
 * @param {Function} transformFn
 */
export default function copyProps(props) {
  var transformFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : identity;

  if (isArray(props)) {
    return props.map(transformFn);
  }
  // Props as an object.
  var copied = {};

  for (var prop in props) {
    if (props.hasOwnProperty(prop)) {
      if ((typeof prop === 'undefined' ? 'undefined' : _typeof(prop)) === 'object') {
        copied[transformFn(prop)] = assign({}, props[prop]);
      } else {
        copied[transformFn(prop)] = props[prop];
      }
    }
  }

  return copied;
}