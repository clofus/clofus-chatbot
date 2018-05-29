import { mergeData } from 'vue-functional-data-merge';
import InputGroupText from './input-group-text';

export var propsFactory = function propsFactory(append) {
  return {
    id: {
      type: String,
      default: null
    },
    tag: {
      type: String,
      default: 'div'
    },
    append: {
      type: Boolean,
      default: append
    },
    isText: {
      type: Boolean,
      default: false
    }
  };
};

export default {
  functional: true,
  props: propsFactory(false),
  render: function render(h, _ref) {
    var props = _ref.props,
        data = _ref.data,
        children = _ref.children;

    return h(props.tag, mergeData(data, {
      staticClass: 'input-group-' + (props.append ? 'append' : 'prepend'),
      attrs: {
        id: props.id
      }
    }), props.isText ? [h(InputGroupText, children)] : children);
  }
};