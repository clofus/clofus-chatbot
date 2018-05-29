import bAlert from './alert';
import { registerComponents, vueUse } from '../../utils/plugins';

var components = {
  bAlert: bAlert
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
  }
};

vueUse(VuePlugin);

export default VuePlugin;