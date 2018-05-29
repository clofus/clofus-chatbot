function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { mergeData } from 'vue-functional-data-merge';

import prefixPropName from '../../utils/prefix-prop-name';
import unPrefixPropName from '../../utils/unprefix-prop-name';
import copyProps from '../../utils/copyProps';
import pluckProps from '../../utils/pluck-props';
import { assign } from '../../utils/object';
import cardMixin from '../../mixins/card-mixin';
import CardBody, { props as bodyProps } from './card-body';
import CardHeader, { props as headerProps } from './card-header';
import CardFooter, { props as footerProps } from './card-footer';
import CardImg, { props as imgProps } from './card-img';

var cardImgProps = copyProps(imgProps, prefixPropName.bind(null, 'img'));
cardImgProps.imgSrc.required = false;

export var props = assign({}, bodyProps, headerProps, footerProps, cardImgProps, copyProps(cardMixin.props), {
  align: {
    type: String,
    default: null
  },
  noBody: {
    type: Boolean,
    default: false
  }
});

export default {
  functional: true,
  props: props,
  render: function render(h, _ref) {
    var _class;

    var props = _ref.props,
        data = _ref.data,
        slots = _ref.slots,
        children = _ref.children;

    // The order of the conditionals matter.
    // We are building the component markup in order.
    var childNodes = [];
    var $slots = slots();
    var img = props.imgSrc ? h(CardImg, {
      props: pluckProps(cardImgProps, props, unPrefixPropName.bind(null, 'img'))
    }) : null;

    if (img) {
      // Above the header placement.
      if (props.imgTop || !props.imgBottom) {
        childNodes.push(img);
      }
    }
    if (props.header || $slots.header) {
      childNodes.push(h(CardHeader, { props: pluckProps(headerProps, props) }, $slots.header));
    }
    if (props.noBody) {
      childNodes.push($slots.default);
    } else {
      childNodes.push(h(CardBody, { props: pluckProps(bodyProps, props) }, $slots.default));
    }
    if (props.footer || $slots.footer) {
      childNodes.push(h(CardFooter, { props: pluckProps(footerProps, props) }, $slots.footer));
    }
    if (img && props.imgBottom) {
      // Below the footer placement.
      childNodes.push(img);
    }

    return h(props.tag, mergeData(data, {
      staticClass: 'card',
      class: (_class = {}, _defineProperty(_class, 'text-' + props.align, Boolean(props.align)), _defineProperty(_class, 'bg-' + props.bgVariant, Boolean(props.bgVariant)), _defineProperty(_class, 'border-' + props.borderVariant, Boolean(props.borderVariant)), _defineProperty(_class, 'text-' + props.textVariant, Boolean(props.textVariant)), _class)
    }), childNodes);
  }
};