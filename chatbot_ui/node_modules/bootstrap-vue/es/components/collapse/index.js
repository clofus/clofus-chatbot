import bCollapse from './collapse';
import togglePlugin from '../../directives/toggle';
import { registerComponents, vueUse } from '../../utils/plugins';

var components = {
  bCollapse: bCollapse
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
    Vue.use(togglePlugin);
  }
};

vueUse(VuePlugin);

export default VuePlugin;