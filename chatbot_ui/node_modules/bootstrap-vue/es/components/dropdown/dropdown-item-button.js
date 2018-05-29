import { mergeData } from 'vue-functional-data-merge';

export var props = {
  disabled: {
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
        parent = _ref.parent,
        children = _ref.children;

    return h('button', mergeData(data, {
      props: props,
      staticClass: 'dropdown-item',
      attrs: { role: 'menuitem', type: 'button', disabled: props.disabled },
      on: {
        click: function click(e) {
          parent.$root.$emit('clicked::link', e);
        }
      }
    }), children);
  }
};