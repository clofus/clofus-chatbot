import bTooltip from './tooltip';
import { registerDirectives, vueUse } from '../../utils/plugins';

var directives = {
  bTooltip: bTooltip
};

var VuePlugin = {
  install: function install(Vue) {
    registerDirectives(Vue, directives);
  }
};

vueUse(VuePlugin);

export default VuePlugin;