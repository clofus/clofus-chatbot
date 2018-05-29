function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { mergeData } from 'vue-functional-data-merge';

export var props = {
  tag: {
    type: String,
    default: 'nav'
  },
  type: {
    type: String,
    default: 'light'
  },
  variant: {
    type: String
  },
  toggleable: {
    type: [Boolean, String],
    default: false
  },
  toggleBreakpoint: {
    // Deprecated.  Set toggleable to a string breakpoint
    type: String,
    default: null
  },
  fixed: {
    type: String
  },
  sticky: {
    type: Boolean,
    default: false
  }
};

export default {
  functional: true,
  props: props,
  render: function render(h, _ref) {
    var _class;

    var props = _ref.props,
        data = _ref.data,
        children = _ref.children;

    var breakpoint = props.toggleBreakpoint || (props.toggleable === true ? 'sm' : props.toggleable) || 'sm';
    return h(props.tag, mergeData(data, {
      staticClass: 'navbar',
      class: (_class = {}, _defineProperty(_class, 'navbar-' + props.type, Boolean(props.type)), _defineProperty(_class, 'bg-' + props.variant, Boolean(props.variant)), _defineProperty(_class, 'fixed-' + props.fixed, Boolean(props.fixed)), _defineProperty(_class, 'sticky-top', props.sticky), _defineProperty(_class, 'navbar-expand-' + breakpoint, props.toggleable !== false), _class)
    }), children);
  }
};