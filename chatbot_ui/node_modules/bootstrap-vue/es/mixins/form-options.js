import { isArray } from '../utils/array';
import { keys } from '../utils/object';

function isObject(obj) {
  return obj && {}.toString.call(obj) === '[object Object]';
}

export default {

  props: {
    options: {
      type: [Array, Object],
      default: function _default() {
        return [];
      }
    },
    valueField: {
      type: String,
      default: 'value'
    },
    textField: {
      type: String,
      default: 'text'
    },
    disabledField: {
      type: String,
      default: 'disabled'
    }
  },
  computed: {
    formOptions: function formOptions() {
      var options = this.options;

      var valueField = this.valueField;
      var textField = this.textField;
      var disabledField = this.disabledField;

      if (isArray(options)) {
        // Normalize flat-ish arrays to Array of Objects
        return options.map(function (option) {
          if (isObject(option)) {
            return {
              value: option[valueField],
              text: String(option[textField]),
              disabled: option[disabledField] || false
            };
          }
          return {
            value: option,
            text: String(option),
            disabled: false
          };
        });
      } else {
        // options is Object
        // Normalize Objects to Array of Objects
        return keys(options).map(function (key) {
          var option = options[key] || {};
          if (isObject(option)) {
            var value = option[valueField];
            var text = option[textField];
            return {
              value: typeof value === 'undefined' ? key : value,
              text: typeof text === 'undefined' ? key : String(text),
              disabled: option[disabledField] || false
            };
          }
          return {
            value: key,
            text: String(option),
            disabled: false
          };
        });
      }
    }
  }
};