import bTable from './table';
import { registerComponents, vueUse } from '../../utils/plugins';

var components = {
  bTable: bTable
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
  }
};

vueUse(VuePlugin);

export default VuePlugin;