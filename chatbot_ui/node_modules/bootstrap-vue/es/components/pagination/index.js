import bPagination from './pagination';
import { registerComponents, vueUse } from '../../utils/plugins';

var components = {
  bPagination: bPagination
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
  }
};

vueUse(VuePlugin);

export default VuePlugin;