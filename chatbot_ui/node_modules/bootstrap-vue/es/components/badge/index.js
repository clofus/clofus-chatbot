import bBadge from './badge';
import { registerComponents, vueUse } from '../../utils/plugins';

var components = {
  bBadge: bBadge
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
  }
};

vueUse(VuePlugin);

export default VuePlugin;