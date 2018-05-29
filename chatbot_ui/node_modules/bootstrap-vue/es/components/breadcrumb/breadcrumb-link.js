import { mergeData } from 'vue-functional-data-merge';
import pluckProps from '../../utils/pluck-props';
import { assign } from '../../utils/object';
import Link, { propsFactory as linkPropsFactory } from '../link/link';

export var props = assign(linkPropsFactory(), {
  text: {
    type: String,
    default: null
  },
  active: {
    type: Boolean,
    default: false
  },
  href: {
    type: String,
    default: '#'
  },
  ariaCurrent: {
    type: String,
    default: 'location'
  }
});

export default {
  functional: true,
  props: props,
  render: function render(h, _ref) {
    var suppliedProps = _ref.props,
        data = _ref.data,
        children = _ref.children;

    var tag = suppliedProps.active ? 'span' : Link;

    var componentData = {
      props: pluckProps(props, suppliedProps),
      domProps: { innerHTML: suppliedProps.text }
    };

    if (suppliedProps.active) {
      componentData.attrs = { 'aria-current': suppliedProps.ariaCurrent };
    } else {
      componentData.attrs = { href: suppliedProps.href };
    }

    return h(tag, mergeData(data, componentData), children);
  }
};