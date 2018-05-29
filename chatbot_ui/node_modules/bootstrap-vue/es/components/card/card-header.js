function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { mergeData } from 'vue-functional-data-merge';

import prefixPropName from '../../utils/prefix-prop-name';
import copyProps from '../../utils/copyProps';
import { assign } from '../../utils/object';
import cardMixin from '../../mixins/card-mixin';

export var props = assign({}, copyProps(cardMixin.props, prefixPropName.bind(null, 'header')), {
  header: {
    type: String,
    default: null
  },
  headerClass: {
    type: [String, Object, Array],
    default: null
  }
});

export default {
  functional: true,
  props: props,
  render: function render(h, _ref) {
    var _ref2;

    var props = _ref.props,
        data = _ref.data,
        slots = _ref.slots,
        children = _ref.children;

    return h(props.headerTag, mergeData(data, {
      staticClass: 'card-header',
      class: [props.headerClass, (_ref2 = {}, _defineProperty(_ref2, 'bg-' + props.headerBgVariant, Boolean(props.headerBgVariant)), _defineProperty(_ref2, 'border-' + props.headerBorderVariant, Boolean(props.headerBorderVariant)), _defineProperty(_ref2, 'text-' + props.headerTextVariant, Boolean(props.headerTextVariant)), _ref2)]
    }), children || [h('div', { domProps: { innerHTML: props.header } })]);
  }
};