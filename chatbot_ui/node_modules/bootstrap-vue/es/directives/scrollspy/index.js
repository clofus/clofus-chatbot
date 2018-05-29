import bScrollspy from './scrollspy';
import { registerDirectives, vueUse } from '../../utils/plugins';

var directives = {
  bScrollspy: bScrollspy
};

var VuePlugin = {
  install: function install(Vue) {
    registerDirectives(Vue, directives);
  }
};

vueUse(VuePlugin);

export default VuePlugin;