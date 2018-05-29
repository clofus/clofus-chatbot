import bPopover from './popover';
import { registerDirectives, vueUse } from '../../utils/plugins';

var directives = {
  bPopover: bPopover
};

var VuePlugin = {
  install: function install(Vue) {
    registerDirectives(Vue, directives);
  }
};

vueUse(VuePlugin);

export default VuePlugin;