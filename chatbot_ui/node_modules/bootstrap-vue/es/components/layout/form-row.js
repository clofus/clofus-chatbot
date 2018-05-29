import { mergeData } from 'vue-functional-data-merge';

export var props = {
  tag: {
    type: String,
    default: 'div'
  }
};

export default {
  functional: true,
  props: props,
  render: function render(h, _ref) {
    var props = _ref.props,
        data = _ref.data,
        children = _ref.children;

    return h(props.tag, mergeData(data, {
      staticClass: 'form-row'
    }), children);
  }
};