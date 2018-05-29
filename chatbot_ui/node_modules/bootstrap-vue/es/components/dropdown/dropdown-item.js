import { mergeData } from 'vue-functional-data-merge';
import Link, { propsFactory as linkPropsFactory } from '../link/link';

export var props = linkPropsFactory();

export default {
  functional: true,
  props: props,
  render: function render(h, _ref) {
    var props = _ref.props,
        data = _ref.data,
        children = _ref.children;

    return h(Link, mergeData(data, {
      props: props,
      staticClass: 'dropdown-item',
      attrs: { role: 'menuitem' }
    }), children);
  }
};