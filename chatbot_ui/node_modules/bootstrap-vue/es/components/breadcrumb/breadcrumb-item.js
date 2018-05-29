import { mergeData } from 'vue-functional-data-merge';
import { assign } from '../../utils/object';
import BreadcrumbLink, { props as crumbLinks } from './breadcrumb-link';

export var props = assign({}, crumbLinks, {
  text: {
    type: String,
    default: null
  },
  href: {
    type: String,
    default: null
  }
});

export default {
  functional: true,
  props: props,
  render: function render(h, _ref) {
    var props = _ref.props,
        data = _ref.data,
        children = _ref.children;

    return h('li', mergeData(data, {
      staticClass: 'breadcrumb-item',
      class: { active: props.active },
      attrs: { role: 'presentation' }
    }), [h(BreadcrumbLink, { props: props }, children)]);
  }
};