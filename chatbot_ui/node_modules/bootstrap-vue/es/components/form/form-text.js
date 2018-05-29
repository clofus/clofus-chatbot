function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { mergeData } from 'vue-functional-data-merge';

export var props = {
  id: {
    type: String,
    default: null
  },
  tag: {
    type: String,
    default: 'small'
  },
  textVariant: {
    type: String,
    default: 'muted'
  },
  inline: {
    type: Boolean,
    default: false
  }
};

export default {
  functional: true,
  props: props,
  render: function render(h, _ref) {
    var props = _ref.props,
        data = _ref.data,
        children = _ref.children;

    return h(props.tag, mergeData(data, {
      class: _defineProperty({
        'form-text': !props.inline
      }, 'text-' + props.textVariant, Boolean(props.textVariant)),
      attrs: {
        id: props.id
      }
    }), children);
  }
};