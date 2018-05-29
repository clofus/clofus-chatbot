import bModal from './modal';
import { registerDirectives, vueUse } from '../../utils/plugins';

var directives = {
  bModal: bModal
};

var VuePlugin = {
  install: function install(Vue) {
    registerDirectives(Vue, directives);
  }
};

vueUse(VuePlugin);

export default VuePlugin;