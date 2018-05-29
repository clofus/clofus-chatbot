function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { mergeData } from 'vue-functional-data-merge';

var props = {
  disabled: {
    type: Boolean,
    default: false
  },
  ariaLabel: {
    type: String,
    default: 'Close'
  },
  textVariant: {
    type: String,
    default: null
  }
};

export default {
  functional: true,
  props: props,
  render: function render(h, _ref) {
    var props = _ref.props,
        data = _ref.data,
        listeners = _ref.listeners,
        slots = _ref.slots;

    var componentData = {
      staticClass: 'close',
      class: _defineProperty({}, 'text-' + props.textVariant, props.textVariant),
      attrs: {
        type: 'button',
        disabled: props.disabled,
        'aria-label': props.ariaLabel ? String(props.ariaLabel) : null
      },
      on: {
        click: function click(e) {
          // Ensure click on button HTML content is also disabled
          if (props.disabled && e instanceof Event) {
            e.stopPropagation();
            e.preventDefault();
          }
        }
      }
      // Careful not to override the slot with innerHTML
    };if (!slots().default) {
      componentData.domProps = { innerHTML: '&times;' };
    }
    return h('button', mergeData(data, componentData), slots().default);
  }
};