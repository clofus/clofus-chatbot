import { bindTargets, unbindTargets } from '../../utils/target';
import { setAttr, removeAttr } from '../../utils/dom';

var listenTypes = { click: true };

export default {
  // eslint-disable-next-line no-shadow-restricted-names
  bind: function bind(el, binding, vnode) {
    bindTargets(vnode, binding, listenTypes, function (_ref) {
      var targets = _ref.targets,
          vnode = _ref.vnode;

      targets.forEach(function (target) {
        vnode.context.$root.$emit('bv::show::modal', target, vnode.elm);
      });
    });
    if (el.tagName !== 'BUTTON') {
      // If element is not a button, we add `role="button"` for accessibility
      setAttr(el, 'role', 'button');
    }
  },
  unbind: function unbind(el, binding, vnode) {
    unbindTargets(vnode, binding, listenTypes);
    if (el.tagName !== 'BUTTON') {
      // If element is not a button, we add `role="button"` for accessibility
      removeAttr(el, 'role', 'button');
    }
  }
};