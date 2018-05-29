import Link, { propsFactory } from '../link/link';
import { mergeData } from 'vue-functional-data-merge';
import pluckProps from '../../utils/pluck-props';
import { assign } from '../../utils/object';

var linkProps = propsFactory();
linkProps.href.default = undefined;
linkProps.to.default = undefined;

export var props = assign(linkProps, {
  tag: {
    type: String,
    default: 'div'
  }
});

export default {
  functional: true,
  props: props,
  render: function render(h, _ref) {
    var props = _ref.props,
        data = _ref.data,
        children = _ref.children;

    var isLink = Boolean(props.to || props.href);
    var tag = isLink ? Link : props.tag;

    return h(tag, mergeData(data, {
      staticClass: 'navbar-brand',
      props: isLink ? pluckProps(linkProps, props) : {}
    }), children);
  }
};