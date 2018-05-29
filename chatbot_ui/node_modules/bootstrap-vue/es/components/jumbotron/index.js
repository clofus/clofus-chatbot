import bJumbotron from './jumbotron';
import { registerComponents, vueUse } from '../../utils/plugins';

var components = {
  bJumbotron: bJumbotron
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
  }
};

vueUse(VuePlugin);

export default VuePlugin;