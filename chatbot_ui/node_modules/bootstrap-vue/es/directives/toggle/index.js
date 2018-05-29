import bToggle from './toggle';
import { registerDirectives, vueUse } from '../../utils/plugins';

var directives = {
  bToggle: bToggle
};

var VuePlugin = {
  install: function install(Vue) {
    registerDirectives(Vue, directives);
  }
};

vueUse(VuePlugin);

export default VuePlugin;