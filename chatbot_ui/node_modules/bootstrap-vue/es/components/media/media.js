import { mergeData } from 'vue-functional-data-merge';
import MediaBody from './media-body';
import MediaAside from './media-aside';

export var props = {
  tag: {
    type: String,
    default: 'div'
  },
  rightAlign: {
    type: Boolean,
    default: false
  },
  verticalAlign: {
    type: String,
    default: 'top'
  },
  noBody: {
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
        slots = _ref.slots,
        children = _ref.children;

    var childNodes = props.noBody ? children : [];
    var $slots = slots();

    if (!props.noBody) {
      if ($slots.aside && !props.rightAlign) {
        childNodes.push(h(MediaAside, { staticClass: 'mr-3', props: { verticalAlign: props.verticalAlign } }, $slots.aside));
      }

      childNodes.push(h(MediaBody, $slots.default));

      if ($slots.aside && props.rightAlign) {
        childNodes.push(h(MediaAside, { staticClass: 'ml-3', props: { verticalAlign: props.verticalAlign } }, $slots.aside));
      }
    }

    return h(props.tag, mergeData(data, { staticClass: 'media' }), childNodes);
  }
};