import bFormFile from './form-file';
import { registerComponents, vueUse } from '../../utils/plugins';

var components = {
  bFormFile: bFormFile,
  bFile: bFormFile
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
  }
};

vueUse(VuePlugin);

export default VuePlugin;