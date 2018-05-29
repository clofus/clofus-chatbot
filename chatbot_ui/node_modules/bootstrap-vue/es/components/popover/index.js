import bPopover from './popover';
import { registerComponents, vueUse } from '../../utils/plugins';

var components = {
  bPopover: bPopover
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
  }
};

vueUse(VuePlugin);

export default VuePlugin;