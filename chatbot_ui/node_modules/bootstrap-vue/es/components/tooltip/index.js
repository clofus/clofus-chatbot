import bTooltip from './tooltip';
import { registerComponents, vueUse } from '../../utils/plugins';

var components = {
  bTooltip: bTooltip
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
  }
};

vueUse(VuePlugin);

export default VuePlugin;