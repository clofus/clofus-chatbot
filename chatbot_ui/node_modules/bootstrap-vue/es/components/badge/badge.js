import { mergeData } from 'vue-functional-data-merge';

import pluckProps from '../../utils/pluck-props';
import { assign } from '../../utils/object';
import Link, { propsFactory as linkPropsFactory } from '../link/link';

var linkProps = linkPropsFactory();
delete linkProps.href.default;
delete linkProps.to.default;

export var props = assign(linkProps, {
  tag: {
    type: String,
    default: 'span'
  },
  variant: {
    type: String,
    default: 'secondary'
  },
  pill: {
    type: Boolean,
    default: false
  }
});

export default {
  functional: true,
  props: props,
  render: function render(h, _ref) {
    var props = _ref.props,
        data = _ref.data,
        children = _ref.children;

    var tag = !props.href && !props.to ? props.tag : Link;

    var componentData = {
      staticClass: 'badge',
      class: [!props.variant ? 'badge-secondary' : 'badge-' + props.variant, {
        'badge-pill': Boolean(props.pill),
        active: props.active,
        disabled: props.disabled
      }],
      props: pluckProps(linkProps, props)
    };

    return h(tag, mergeData(data, componentData), children);
  }
};