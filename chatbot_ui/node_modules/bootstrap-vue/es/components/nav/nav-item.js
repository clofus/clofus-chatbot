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

    return h('li', mergeData(data, {
      staticClass: 'nav-item'
    }), [h(Link, { staticClass: 'nav-link', props: props }, children)]);
  }
};