import bButton from './button';
import bButtonClose from './button-close';
import { registerComponents, vueUse } from '../../utils/plugins';

var components = {
  bButton: bButton,
  bBtn: bButton,
  bButtonClose: bButtonClose,
  bBtnClose: bButtonClose
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
  }
};

vueUse(VuePlugin);

export default VuePlugin;