function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { mergeData } from 'vue-functional-data-merge';
import Container from '../layout/container';

export var props = {
  fluid: {
    type: Boolean,
    default: false
  },
  containerFluid: {
    type: Boolean,
    default: false
  },
  header: {
    type: String,
    default: null
  },
  headerTag: {
    type: String,
    default: 'h1'
  },
  headerLevel: {
    type: [Number, String],
    default: '3'
  },
  lead: {
    type: String,
    default: null
  },
  leadTag: {
    type: String,
    default: 'p'
  },
  tag: {
    type: String,
    default: 'div'
  },
  bgVariant: {
    type: String,
    default: null
  },
  borderVariant: {
    type: String,
    default: null
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
    var _class2;

    var props = _ref.props,
        data = _ref.data,
        slots = _ref.slots;

    // The order of the conditionals matter.
    // We are building the component markup in order.
    var childNodes = [];
    var $slots = slots();

    // Header
    if (props.header || $slots.header) {
      childNodes.push(h(props.headerTag, {
        class: _defineProperty({}, 'display-' + props.headerLevel, Boolean(props.headerLevel))
      }, $slots.header || props.header));
    }

    // Lead
    if (props.lead || $slots.lead) {
      childNodes.push(h(props.leadTag, { staticClass: 'lead' }, $slots.lead || props.lead));
    }

    // Default slot
    if ($slots.default) {
      childNodes.push($slots.default);
    }

    // If fluid, wrap content in a container/container-fluid
    if (props.fluid) {
      // Children become a child of a container
      childNodes = [h(Container, { props: { 'fluid': props.containerFluid } }, childNodes)];
    }
    // Return the jumbotron
    return h(props.tag, mergeData(data, {
      staticClass: 'jumbotron',
      class: (_class2 = {
        'jumbotron-fluid': props.fluid
      }, _defineProperty(_class2, 'text-' + props.textVariant, Boolean(props.textVariant)), _defineProperty(_class2, 'bg-' + props.bgVariant, Boolean(props.bgVariant)), _defineProperty(_class2, 'border-' + props.borderVariant, Boolean(props.borderVariant)), _defineProperty(_class2, 'border', Boolean(props.borderVariant)), _class2)
    }), childNodes);
  }
};