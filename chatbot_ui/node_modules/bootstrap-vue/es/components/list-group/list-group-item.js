function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { mergeData } from 'vue-functional-data-merge';
import pluckProps from '../../utils/pluck-props';
import { assign } from '../../utils/object';
import { arrayIncludes } from '../../utils/array';
import Link, { propsFactory as linkPropsFactory } from '../link/link';

var actionTags = ['a', 'router-link', 'button', 'b-link'];
var linkProps = linkPropsFactory();
delete linkProps.href.default;
delete linkProps.to.default;

export var props = assign({
  tag: {
    type: String,
    default: 'div'
  },
  action: {
    type: Boolean,
    default: null
  },
  button: {
    type: Boolean,
    default: null
  },
  variant: {
    type: String,
    default: null
  }
}, linkProps);

export default {
  functional: true,
  props: props,
  render: function render(h, _ref) {
    var _class;

    var props = _ref.props,
        data = _ref.data,
        children = _ref.children;

    var tag = props.button ? 'button' : !props.href && !props.to ? props.tag : Link;
    var isAction = Boolean(props.href || props.to || props.action || props.button || arrayIncludes(actionTags, props.tag));
    var componentData = {
      staticClass: 'list-group-item',
      class: (_class = {}, _defineProperty(_class, 'list-group-item-' + props.variant, Boolean(props.variant)), _defineProperty(_class, 'list-group-item-action', isAction), _defineProperty(_class, 'active', props.active), _defineProperty(_class, 'disabled', props.disabled), _class),
      attrs: tag === 'button' && props.disabled ? { disabled: true } : {},
      props: props.button ? {} : pluckProps(linkProps, props)
    };

    return h(tag, mergeData(data, componentData), children);
  }
};