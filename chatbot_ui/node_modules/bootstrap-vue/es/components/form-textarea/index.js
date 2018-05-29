import bFormTextarea from './form-textarea';
import { registerComponents, vueUse } from '../../utils/plugins';

var components = {
  bFormTextarea: bFormTextarea,
  bTextarea: bFormTextarea
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
  }
};

vueUse(VuePlugin);

export default VuePlugin;