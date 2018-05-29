import bFormSelect from './form-select';
import { registerComponents, vueUse } from '../../utils/plugins';

var components = {
  bFormSelect: bFormSelect,
  bSelect: bFormSelect
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
  }
};

vueUse(VuePlugin);

export default VuePlugin;