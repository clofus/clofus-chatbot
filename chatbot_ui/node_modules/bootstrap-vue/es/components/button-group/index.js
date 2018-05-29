import bButtonGroup from './button-group';
import { registerComponents, vueUse } from '../../utils/plugins';

var components = {
  bButtonGroup: bButtonGroup,
  bBtnGroup: bButtonGroup
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
  }
};

vueUse(VuePlugin);

export default VuePlugin;