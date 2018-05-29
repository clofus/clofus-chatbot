import bFormGroup from './form-group';
import { registerComponents, vueUse } from '../../utils/plugins';

var components = {
  bFormGroup: bFormGroup,
  bFormFieldset: bFormGroup
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
  }
};

vueUse(VuePlugin);

export default VuePlugin;