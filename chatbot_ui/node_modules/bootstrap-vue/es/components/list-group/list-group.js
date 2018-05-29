import { mergeData } from 'vue-functional-data-merge';

export var props = {
  tag: {
    type: String,
    default: 'div'
  },
  flush: {
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
        children = _ref.children;

    var componentData = {
      staticClass: 'list-group',
      class: { 'list-group-flush': props.flush }
    };

    return h(props.tag, mergeData(data, componentData), children);
  }
};