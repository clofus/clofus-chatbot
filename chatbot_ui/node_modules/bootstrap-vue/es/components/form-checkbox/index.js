import bFormCheckbox from './form-checkbox';
import bFormCheckboxGroup from './form-checkbox-group';
import { registerComponents, vueUse } from '../../utils/plugins';

var components = {
  bFormCheckbox: bFormCheckbox,
  bCheckbox: bFormCheckbox,
  bCheck: bFormCheckbox,
  bFormCheckboxGroup: bFormCheckboxGroup,
  bCheckboxGroup: bFormCheckboxGroup,
  bCheckGroup: bFormCheckboxGroup
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
  }
};

vueUse(VuePlugin);

export default VuePlugin;