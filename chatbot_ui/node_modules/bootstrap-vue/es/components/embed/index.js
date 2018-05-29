import bEmbed from './embed';
import { registerComponents, vueUse } from '../../utils/plugins';

var components = {
  bEmbed: bEmbed
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
  }
};

vueUse(VuePlugin);

export default VuePlugin;