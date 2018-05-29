import * as components from './components';
import * as directives from './directives';
import { vueUse } from './utils/plugins';

var VuePlugin = {
  install: function install(Vue) {
    if (Vue._bootstrap_vue_installed) {
      return;
    }

    Vue._bootstrap_vue_installed = true;

    // Register component plugins
    for (var plugin in components) {
      Vue.use(components[plugin]);
    }

    // Register directive plugins
    for (var _plugin in directives) {
      Vue.use(directives[_plugin]);
    }
  }
};

vueUse(VuePlugin);

export default VuePlugin;