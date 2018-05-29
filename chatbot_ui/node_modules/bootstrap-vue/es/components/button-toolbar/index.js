import bButtonToolbar from './button-toolbar';
import { registerComponents, vueUse } from '../../utils/plugins';

var components = {
  bButtonToolbar: bButtonToolbar,
  bBtnToolbar: bButtonToolbar
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
  }
};

vueUse(VuePlugin);

export default VuePlugin;