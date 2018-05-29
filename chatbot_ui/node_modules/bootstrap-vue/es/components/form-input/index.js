import bFormInput from './form-input';
import { registerComponents, vueUse } from '../../utils/plugins';

var components = {
  bFormInput: bFormInput,
  bInput: bFormInput
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
  }
};

vueUse(VuePlugin);

export default VuePlugin;