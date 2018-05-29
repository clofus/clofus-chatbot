import bNav from './nav';
import bNavItem from './nav-item';
import bNavText from './nav-text';
import bNavForm from './nav-form';
import bNavItemDropdown from './nav-item-dropdown';
import dropdownPlugin from '../dropdown';
import { registerComponents, vueUse } from '../../utils/plugins';

var components = {
  bNav: bNav,
  bNavItem: bNavItem,
  bNavText: bNavText,
  bNavForm: bNavForm,
  bNavItemDropdown: bNavItemDropdown,
  bNavItemDd: bNavItemDropdown,
  bNavDropdown: bNavItemDropdown,
  bNavDd: bNavItemDropdown
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
    Vue.use(dropdownPlugin);
  }
};

vueUse(VuePlugin);

export default VuePlugin;