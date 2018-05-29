import bLink from './link';
import { registerComponents, vueUse } from '../../utils/plugins';

var components = {
  bLink: bLink
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
  }
};

vueUse(VuePlugin);

export default VuePlugin;