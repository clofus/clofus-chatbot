import bNavbar from './navbar';
import bNavbarNav from './navbar-nav';
import bNavbarBrand from './navbar-brand';
import bNavbarToggle from './navbar-toggle';
import navPlugin from '../nav';
import collapsePlugin from '../collapse';
import dropdownPlugin from '../dropdown';
import { registerComponents, vueUse } from '../../utils/plugins';

var components = {
  bNavbar: bNavbar,
  bNavbarNav: bNavbarNav,
  bNavbarBrand: bNavbarBrand,
  bNavbarToggle: bNavbarToggle,
  bNavToggle: bNavbarToggle
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
    Vue.use(navPlugin);
    Vue.use(collapsePlugin);
    Vue.use(dropdownPlugin);
  }
};

vueUse(VuePlugin);

export default VuePlugin;