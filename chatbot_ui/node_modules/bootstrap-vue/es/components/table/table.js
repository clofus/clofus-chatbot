var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

import startCase from 'lodash.startcase';
import get from 'lodash.get';
import looseEqual from '../../utils/loose-equal';
import stableSort from '../../utils/stable-sort';
import KeyCodes from '../../utils/key-codes';
import warn from '../../utils/warn';
import { keys, assign } from '../../utils/object';
import { isArray } from '../../utils/array';
import idMixin from '../../mixins/id';
import listenOnRootMixin from '../../mixins/listen-on-root';

// Import styles
import './table.css';

function toString(v) {
  if (!v) {
    return '';
  }
  if (v instanceof Object) {
    return keys(v).map(function (k) {
      return toString(v[k]);
    }).join(' ');
  }
  return String(v);
}

function recToString(obj) {
  if (!(obj instanceof Object)) {
    return '';
  }
  return toString(keys(obj).reduce(function (o, k) {
    // Ignore fields that start with _
    if (!/^_/.test(k)) {
      o[k] = obj[k];
    }
    return o;
  }, {}));
}

function defaultSortCompare(a, b, sortBy) {
  if (typeof a[sortBy] === 'number' && typeof b[sortBy] === 'number') {
    return a[sortBy] < b[sortBy] && -1 || a[sortBy] > b[sortBy] && 1 || 0;
  }
  return toString(a[sortBy]).localeCompare(toString(b[sortBy]), undefined, {
    numeric: true
  });
}

function processField(key, value) {
  var field = null;
  if (typeof value === 'string') {
    // Label shortcut
    field = { key: key, label: value };
  } else if (typeof value === 'function') {
    // Formatter shortcut
    field = { key: key, formatter: value };
  } else if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
    field = assign({}, value);
    field.key = field.key || key;
  } else if (value !== false) {
    // Fallback to just key
    field = { key: key };
  }
  return field;
}

export default {
  mixins: [idMixin, listenOnRootMixin],
  render: function render(h) {
    var _this = this;

    var $slots = this.$slots;
    var $scoped = this.$scopedSlots;
    var fields = this.computedFields;
    var items = this.computedItems;

    // Build the caption
    var caption = h(false);
    if (this.caption || $slots['table-caption']) {
      var data = { style: this.captionStyles };
      if (!$slots['table-caption']) {
        data.domProps = { innerHTML: this.caption };
      }
      caption = h('caption', data, $slots['table-caption']);
    }

    // Build the colgroup
    var colgroup = $slots['table-colgroup'] ? h('colgroup', {}, $slots['table-colgroup']) : h(false);

    // factory function for thead and tfoot cells (th's)
    var makeHeadCells = function makeHeadCells() {
      var isFoot = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      return fields.map(function (field, colIndex) {
        var data = {
          key: field.key,
          class: _this.fieldClasses(field),
          style: field.thStyle || {},
          attrs: {
            tabindex: field.sortable ? '0' : null,
            abbr: field.headerAbbr || null,
            title: field.headerTitle || null,
            'aria-colindex': String(colIndex + 1),
            'aria-label': field.sortable ? _this.localSortDesc && _this.localSortBy === field.key ? _this.labelSortAsc : _this.labelSortDesc : null,
            'aria-sort': field.sortable && _this.localSortBy === field.key ? _this.localSortDesc ? 'descending' : 'ascending' : null
          },
          on: {
            click: function click(evt) {
              evt.stopPropagation();
              evt.preventDefault();
              _this.headClicked(evt, field);
            },
            keydown: function keydown(evt) {
              var keyCode = evt.keyCode;
              if (keyCode === KeyCodes.ENTER || keyCode === KeyCodes.SPACE) {
                evt.stopPropagation();
                evt.preventDefault();
                _this.headClicked(evt, field);
              }
            }
          }
        };
        var slot = isFoot && $scoped['FOOT_' + field.key] ? $scoped['FOOT_' + field.key] : $scoped['HEAD_' + field.key];
        if (slot) {
          slot = [slot({ label: field.label, column: field.key, field: field })];
        } else {
          data.domProps = { innerHTML: field.label };
        }
        return h('th', data, slot);
      });
    };

    // Build the thead
    var thead = h(false);
    if (this.isStacked !== true) {
      // If in always stacked mode (this.isStacked === true), then we don't bother rendering the thead
      thead = h('thead', { class: this.headClasses }, [h('tr', { class: this.theadTrClass }, makeHeadCells(false))]);
    }

    // Build the tfoot
    var tfoot = h(false);
    if (this.footClone && this.isStacked !== true) {
      // If in always stacked mode (this.isStacked === true), then we don't bother rendering the tfoot
      tfoot = h('tfoot', { class: this.footClasses }, [h('tr', { class: this.tfootTrClass }, makeHeadCells(true))]);
    }

    // Prepare the tbody rows
    var rows = [];

    // Add static Top Row slot (hidden in visibly stacked mode as we can't control the data-label)
    // If in always stacked mode, we don't bother rendering the row
    if ($scoped['top-row'] && this.isStacked !== true) {
      rows.push(h('tr', { key: 'top-row', class: ['b-table-top-row', this.tbodyTrClass] }, [$scoped['top-row']({ columns: fields.length, fields: fields })]));
    } else {
      rows.push(h(false));
    }

    // Add the item data rows
    items.forEach(function (item, rowIndex) {
      var detailsSlot = $scoped['row-details'];
      var rowShowDetails = Boolean(item._showDetails && detailsSlot);
      var detailsId = rowShowDetails ? _this.safeId('_details_' + rowIndex + '_') : null;
      var toggleDetailsFn = function toggleDetailsFn() {
        if (detailsSlot) {
          _this.$set(item, '_showDetails', !item._showDetails);
        }
      };
      // For each item data field in row
      var tds = fields.map(function (field, colIndex) {
        var data = {
          key: 'row-' + rowIndex + '-cell-' + colIndex,
          class: _this.tdClasses(field, item),
          attrs: _this.tdAttrs(field, item, colIndex),
          domProps: {}
        };
        var childNodes = void 0;
        if ($scoped[field.key]) {
          childNodes = [$scoped[field.key]({
            item: item,
            index: rowIndex,
            field: field,
            unformatted: get(item, field.key),
            value: _this.getFormattedValue(item, field),
            toggleDetails: toggleDetailsFn,
            detailsShowing: Boolean(item._showDetails)
          })];
          if (_this.isStacked) {
            // We wrap in a DIV to ensure rendered as a single cell when visually stacked!
            childNodes = [h('div', {}, [childNodes])];
          }
        } else {
          var formatted = _this.getFormattedValue(item, field);
          if (_this.isStacked) {
            // We innerHTML a DIV to ensure rendered as a single cell when visually stacked!
            childNodes = [h('div', formatted)];
          } else {
            // Non stacked
            childNodes = formatted;
          }
        }
        // Render either a td or th cell
        return h(field.isRowHeader ? 'th' : 'td', data, childNodes);
      });
      // Calculate the row number in the dataset (indexed from 1)
      var ariaRowIndex = null;
      if (_this.currentPage && _this.perPage && _this.perPage > 0) {
        ariaRowIndex = (_this.currentPage - 1) * _this.perPage + rowIndex + 1;
      }
      // Assemble and add the row
      rows.push(h('tr', {
        key: 'row-' + rowIndex,
        class: [_this.rowClasses(item), { 'b-table-has-details': rowShowDetails }],
        attrs: {
          'aria-describedby': detailsId,
          'aria-rowindex': ariaRowIndex,
          role: _this.isStacked ? 'row' : null
        },
        on: {
          click: function click(evt) {
            _this.rowClicked(evt, item, rowIndex);
          },
          dblclick: function dblclick(evt) {
            _this.rowDblClicked(evt, item, rowIndex);
          },
          mouseenter: function mouseenter(evt) {
            _this.rowHovered(evt, item, rowIndex);
          }
        }
      }, tds));
      // Row Details slot
      if (rowShowDetails) {
        var tdAttrs = { colspan: String(fields.length) };
        var trAttrs = { id: detailsId };
        if (_this.isStacked) {
          tdAttrs['role'] = 'cell';
          trAttrs['role'] = 'row';
        }
        var details = h('td', { attrs: tdAttrs }, [detailsSlot({
          item: item,
          index: rowIndex,
          fields: fields,
          toggleDetails: toggleDetailsFn
        })]);
        rows.push(h('tr', {
          key: 'details-' + rowIndex,
          class: ['b-table-details', _this.tbodyTrClass],
          attrs: trAttrs
        }, [details]));
      } else if (detailsSlot) {
        // Only add the placeholder if a the table has a row-details slot defined (but not shown)
        rows.push(h(false));
      }
    });

    // Empty Items / Empty Filtered Row slot
    if (this.showEmpty && (!items || items.length === 0)) {
      var empty = this.filter ? $slots['emptyfiltered'] : $slots['empty'];
      if (!empty) {
        empty = h('div', {
          class: ['text-center', 'my-2'],
          domProps: { innerHTML: this.filter ? this.emptyFilteredText : this.emptyText }
        });
      }
      empty = h('td', {
        attrs: {
          colspan: String(fields.length),
          role: this.isStacked ? 'cell' : null
        }
      }, [h('div', { attrs: { role: 'alert', 'aria-live': 'polite' } }, [empty])]);
      rows.push(h('tr', {
        key: 'empty-row',
        class: ['b-table-empty-row', this.tbodyTrClass],
        attrs: this.isStacked ? { role: 'row' } : {}
      }, [empty]));
    } else {
      rows.push(h(false));
    }

    // Static bottom row slot (hidden in visibly stacked mode as we can't control the data-label)
    // If in always stacked mode, we don't bother rendering the row
    if ($scoped['bottom-row'] && this.isStacked !== true) {
      rows.push(h('tr', { key: 'bottom-row', class: ['b-table-bottom-row', this.tbodyTrClass] }, [$scoped['bottom-row']({ columns: fields.length, fields: fields })]));
    } else {
      rows.push(h(false));
    }

    // Assemble the rows into the tbody
    var tbody = h('tbody', { class: this.bodyClasses, attrs: this.isStacked ? { role: 'rowgroup' } : {} }, rows);

    // Assemble table
    var table = h('table', {
      class: this.tableClasses,
      attrs: {
        id: this.safeId(),
        role: this.isStacked ? 'table' : null,
        'aria-busy': this.computedBusy ? 'true' : 'false',
        'aria-colcount': String(fields.length),
        'aria-rowcount': this.$attrs['aria-rowcount'] || this.perPage && this.perPage > 0 ? '-1' : null
      }
    }, [caption, colgroup, thead, tfoot, tbody]);

    // Add responsive wrapper if needed and return table
    return this.isResponsive ? h('div', { class: this.responsiveClass }, [table]) : table;
  },
  data: function data() {
    return {
      localSortBy: this.sortBy || '',
      localSortDesc: this.sortDesc || false,
      localItems: [],
      // Note: filteredItems only used to determine if # of items changed
      filteredItems: [],
      localBusy: false
    };
  },

  props: {
    items: {
      type: [Array, Function],
      default: function _default() {
        return [];
      }
    },
    fields: {
      type: [Object, Array],
      default: null
    },
    sortBy: {
      type: String,
      default: null
    },
    sortDesc: {
      type: Boolean,
      default: false
    },
    caption: {
      type: String,
      default: null
    },
    captionTop: {
      type: Boolean,
      default: false
    },
    striped: {
      type: Boolean,
      default: false
    },
    bordered: {
      type: Boolean,
      default: false
    },
    outlined: {
      type: Boolean,
      default: false
    },
    dark: {
      type: Boolean,
      default: function _default() {
        if (this && typeof this.inverse === 'boolean') {
          // Deprecate inverse
          warn("b-table: prop 'inverse' has been deprecated. Use 'dark' instead");
          return this.dark;
        }
        return false;
      }
    },
    inverse: {
      // Deprecated in v1.0.0 in favor of `dark`
      type: Boolean,
      default: null
    },
    hover: {
      type: Boolean,
      default: false
    },
    small: {
      type: Boolean,
      default: false
    },
    fixed: {
      type: Boolean,
      default: false
    },
    footClone: {
      type: Boolean,
      default: false
    },
    responsive: {
      type: [Boolean, String],
      default: false
    },
    stacked: {
      type: [Boolean, String],
      default: false
    },
    headVariant: {
      type: String,
      default: ''
    },
    footVariant: {
      type: String,
      default: ''
    },
    theadClass: {
      type: [String, Array],
      default: null
    },
    theadTrClass: {
      type: [String, Array],
      default: null
    },
    tbodyClass: {
      type: [String, Array],
      default: null
    },
    tbodyTrClass: {
      type: [String, Array],
      default: null
    },
    tfootClass: {
      type: [String, Array],
      default: null
    },
    tfootTrClass: {
      type: [String, Array],
      default: null
    },
    perPage: {
      type: Number,
      default: 0
    },
    currentPage: {
      type: Number,
      default: 1
    },
    filter: {
      type: [String, RegExp, Function],
      default: null
    },
    sortCompare: {
      type: Function,
      default: null
    },
    noLocalSorting: {
      type: Boolean,
      default: false
    },
    noProviderPaging: {
      type: Boolean,
      default: false
    },
    noProviderSorting: {
      type: Boolean,
      default: false
    },
    noProviderFiltering: {
      type: Boolean,
      default: false
    },
    busy: {
      type: Boolean,
      default: false
    },
    value: {
      type: Array,
      default: function _default() {
        return [];
      }
    },
    labelSortAsc: {
      type: String,
      default: 'Click to sort Ascending'
    },
    labelSortDesc: {
      type: String,
      default: 'Click to sort Descending'
    },
    showEmpty: {
      type: Boolean,
      default: false
    },
    emptyText: {
      type: String,
      default: 'There are no records to show'
    },
    emptyFilteredText: {
      type: String,
      default: 'There are no records matching your request'
    },
    apiUrl: {
      // Passthrough prop. Passed to the context object. Not used by b-table directly
      type: String,
      default: ''
    }
  },
  watch: {
    items: function items(newVal, oldVal) {
      if (oldVal !== newVal) {
        this._providerUpdate();
      }
    },
    context: function context(newVal, oldVal) {
      if (!looseEqual(newVal, oldVal)) {
        this.$emit('context-changed', newVal);
      }
    },
    filteredItems: function filteredItems(newVal, oldVal) {
      if (this.localFiltering && newVal.length !== oldVal.length) {
        // Emit a filtered notification event, as number of filtered items has changed
        this.$emit('filtered', newVal);
      }
    },
    sortDesc: function sortDesc(newVal, oldVal) {
      if (newVal === this.localSortDesc) {
        return;
      }
      this.localSortDesc = newVal || false;
    },
    localSortDesc: function localSortDesc(newVal, oldVal) {
      // Emit update to sort-desc.sync
      if (newVal !== oldVal) {
        this.$emit('update:sortDesc', newVal);
        if (!this.noProviderSorting) {
          this._providerUpdate();
        }
      }
    },
    sortBy: function sortBy(newVal, oldVal) {
      if (newVal === this.localSortBy) {
        return;
      }
      this.localSortBy = newVal || null;
    },
    localSortBy: function localSortBy(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.$emit('update:sortBy', newVal);
        if (!this.noProviderSorting) {
          this._providerUpdate();
        }
      }
    },
    perPage: function perPage(newVal, oldVal) {
      if (oldVal !== newVal && !this.noProviderPaging) {
        this._providerUpdate();
      }
    },
    currentPage: function currentPage(newVal, oldVal) {
      if (oldVal !== newVal && !this.noProviderPaging) {
        this._providerUpdate();
      }
    },
    filter: function filter(newVal, oldVal) {
      if (oldVal !== newVal && !this.noProviderFiltering) {
        this._providerUpdate();
      }
    },
    localBusy: function localBusy(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.$emit('update:busy', newVal);
      }
    }
  },
  mounted: function mounted() {
    var _this2 = this;

    this.localSortBy = this.sortBy;
    this.localSortDesc = this.sortDesc;
    if (this.hasProvider) {
      this._providerUpdate();
    }
    this.listenOnRoot('bv::refresh::table', function (id) {
      if (id === _this2.id || id === _this2) {
        _this2._providerUpdate();
      }
    });
  },

  computed: {
    isStacked: function isStacked() {
      return this.stacked === '' ? true : this.stacked;
    },
    isResponsive: function isResponsive() {
      var responsive = this.responsive === '' ? true : this.responsive;
      return this.isStacked ? false : responsive;
    },
    responsiveClass: function responsiveClass() {
      return this.isResponsive === true ? 'table-responsive' : this.isResponsive ? 'table-responsive-' + this.responsive : '';
    },
    tableClasses: function tableClasses() {
      return ['table', 'b-table', this.striped ? 'table-striped' : '', this.hover ? 'table-hover' : '', this.dark ? 'table-dark' : '', this.bordered ? 'table-bordered' : '', this.small ? 'table-sm' : '', this.outlined ? 'border' : '', this.fixed ? 'b-table-fixed' : '', this.isStacked === true ? 'b-table-stacked' : this.isStacked ? 'b-table-stacked-' + this.stacked : ''];
    },
    headClasses: function headClasses() {
      return [this.headVariant ? 'thead-' + this.headVariant : '', this.theadClass];
    },
    bodyClasses: function bodyClasses() {
      return [this.tbodyClass];
    },
    footClasses: function footClasses() {
      var variant = this.footVariant || this.headVariant || null;
      return [variant ? 'thead-' + variant : '', this.tfootClass];
    },
    captionStyles: function captionStyles() {
      // Move caption to top
      return this.captionTop ? { captionSide: 'top' } : {};
    },
    hasProvider: function hasProvider() {
      return this.items instanceof Function;
    },
    localFiltering: function localFiltering() {
      return this.hasProvider ? this.noProviderFiltering : true;
    },
    localSorting: function localSorting() {
      return this.hasProvider ? this.noProviderSorting : !this.noLocalSorting;
    },
    localPaging: function localPaging() {
      return this.hasProvider ? this.noProviderPaging : true;
    },
    context: function context() {
      return {
        perPage: this.perPage,
        currentPage: this.currentPage,
        filter: this.filter,
        sortBy: this.localSortBy,
        sortDesc: this.localSortDesc,
        apiUrl: this.apiUrl
      };
    },
    computedFields: function computedFields() {
      var _this3 = this;

      // We normalize fields into an array of objects
      // [ { key:..., label:..., ...}, {...}, ..., {..}]
      var fields = [];
      if (isArray(this.fields)) {
        // Normalize array Form
        this.fields.filter(function (f) {
          return f;
        }).forEach(function (f) {
          if (typeof f === 'string') {
            fields.push({ key: f, label: startCase(f) });
          } else if ((typeof f === 'undefined' ? 'undefined' : _typeof(f)) === 'object' && f.key && typeof f.key === 'string') {
            // Full object definition. We use assign so that we don't mutate the original
            fields.push(assign({}, f));
          } else if ((typeof f === 'undefined' ? 'undefined' : _typeof(f)) === 'object' && keys(f).length === 1) {
            // Shortcut object (i.e. { 'foo_bar': 'This is Foo Bar' }
            var key = keys(f)[0];
            var field = processField(key, f[key]);
            if (field) {
              fields.push(field);
            }
          }
        });
      } else if (this.fields && _typeof(this.fields) === 'object' && keys(this.fields).length > 0) {
        // Normalize object Form
        keys(this.fields).forEach(function (key) {
          var field = processField(key, _this3.fields[key]);
          if (field) {
            fields.push(field);
          }
        });
      }
      // If no field provided, take a sample from first record (if exits)
      if (fields.length === 0 && this.computedItems.length > 0) {
        var sample = this.computedItems[0];
        var ignoredKeys = ['_rowVariant', '_cellVariants', '_showDetails'];
        keys(sample).forEach(function (k) {
          if (!ignoredKeys.includes(k)) {
            fields.push({ key: k, label: startCase(k) });
          }
        });
      }
      // Ensure we have a unique array of fields and that they have String labels
      var memo = {};
      return fields.filter(function (f) {
        if (!memo[f.key]) {
          memo[f.key] = true;
          f.label = typeof f.label === 'string' ? f.label : startCase(f.key);
          return true;
        }
        return false;
      });
    },
    computedItems: function computedItems() {
      // Grab some props/data to ensure reactivity
      var perPage = this.perPage;
      var currentPage = this.currentPage;
      var filter = this.filter;
      var sortBy = this.localSortBy;
      var sortDesc = this.localSortDesc;
      var sortCompare = this.sortCompare;
      var localFiltering = this.localFiltering;
      var localSorting = this.localSorting;
      var localPaging = this.localPaging;
      var items = this.hasProvider ? this.localItems : this.items;
      if (!items) {
        this.$nextTick(this._providerUpdate);
        return [];
      }
      // Array copy for sorting, filtering, etc.
      items = items.slice();
      // Apply local filter
      if (filter && localFiltering) {
        if (filter instanceof Function) {
          items = items.filter(filter);
        } else {
          var regex = void 0;
          if (filter instanceof RegExp) {
            regex = filter;
          } else {
            regex = new RegExp('.*' + filter + '.*', 'ig');
          }
          items = items.filter(function (item) {
            var test = regex.test(recToString(item));
            regex.lastIndex = 0;
            return test;
          });
        }
      }
      if (localFiltering) {
        // Make a local copy of filtered items to trigger filtered event
        this.filteredItems = items.slice();
      }
      // Apply local Sort
      if (sortBy && localSorting) {
        items = stableSort(items, function (a, b) {
          var ret = null;
          if (typeof sortCompare === 'function') {
            // Call user provided sortCompare routine
            ret = sortCompare(a, b, sortBy);
          }
          if (ret === null || ret === undefined) {
            // Fallback to defaultSortCompare if sortCompare not defined or returns null
            ret = defaultSortCompare(a, b, sortBy);
          }
          // Handle sorting direction
          return (ret || 0) * (sortDesc ? -1 : 1);
        });
      }
      // Apply local pagination
      if (Boolean(perPage) && localPaging) {
        // Grab the current page of data (which may be past filtered items)
        items = items.slice((currentPage - 1) * perPage, currentPage * perPage);
      }
      // Update the value model with the filtered/sorted/paginated data set
      this.$emit('input', items);
      return items;
    },
    computedBusy: function computedBusy() {
      return this.busy || this.localBusy;
    }
  },
  methods: {
    keys: keys,
    fieldClasses: function fieldClasses(field) {
      return [field.sortable ? 'sorting' : '', field.sortable && this.localSortBy === field.key ? 'sorting_' + (this.localSortDesc ? 'desc' : 'asc') : '', field.variant ? 'table-' + field.variant : '', field.class ? field.class : '', field.thClass ? field.thClass : ''];
    },
    tdClasses: function tdClasses(field, item) {
      var cellVariant = '';
      if (item._cellVariants && item._cellVariants[field.key]) {
        cellVariant = (this.dark ? 'bg' : 'table') + '-' + item._cellVariants[field.key];
      }
      return [field.variant && !cellVariant ? (this.dark ? 'bg' : 'table') + '-' + field.variant : '', cellVariant, field.class ? field.class : '', this.getTdValues(item, field.key, field.tdClass, '')];
    },
    tdAttrs: function tdAttrs(field, item, colIndex) {
      var attrs = {};
      attrs['aria-colindex'] = String(colIndex + 1);
      if (this.isStacked) {
        // Generate the "header cell" label content in stacked mode
        attrs['data-label'] = field.label;
        if (field.isRowHeader) {
          attrs['role'] = 'rowheader';
        } else {
          attrs['role'] = 'cell';
        }
      }
      return assign({}, attrs, this.getTdValues(item, field.key, field.tdAttr, {}));
    },
    rowClasses: function rowClasses(item) {
      return [item._rowVariant ? (this.dark ? 'bg' : 'table') + '-' + item._rowVariant : '', this.tbodyTrClass];
    },
    rowClicked: function rowClicked(e, item, index) {
      if (this.stopIfBusy(e)) {
        // If table is busy (via provider) then don't propagate
        return;
      }
      this.$emit('row-clicked', item, index, e);
    },
    rowDblClicked: function rowDblClicked(e, item, index) {
      if (this.stopIfBusy(e)) {
        // If table is busy (via provider) then don't propagate
        return;
      }
      this.$emit('row-dblclicked', item, index, e);
    },
    rowHovered: function rowHovered(e, item, index) {
      if (this.stopIfBusy(e)) {
        // If table is busy (via provider) then don't propagate
        return;
      }
      this.$emit('row-hovered', item, index, e);
    },
    headClicked: function headClicked(e, field) {
      if (this.stopIfBusy(e)) {
        // If table is busy (via provider) then don't propagate
        return;
      }
      var sortChanged = false;
      if (field.sortable) {
        if (field.key === this.localSortBy) {
          // Change sorting direction on current column
          this.localSortDesc = !this.localSortDesc;
        } else {
          // Start sorting this column ascending
          this.localSortBy = field.key;
          this.localSortDesc = false;
        }
        sortChanged = true;
      } else if (this.localSortBy) {
        this.localSortBy = null;
        this.localSortDesc = false;
        sortChanged = true;
      }
      this.$emit('head-clicked', field.key, field, e);
      if (sortChanged) {
        // Sorting parameters changed
        this.$emit('sort-changed', this.context);
      }
    },
    stopIfBusy: function stopIfBusy(evt) {
      if (this.computedBusy) {
        // If table is busy (via provider) then don't propagate
        evt.preventDefault();
        evt.stopPropagation();
        return true;
      }
      return false;
    },
    refresh: function refresh() {
      // Expose refresh method
      if (this.hasProvider) {
        this._providerUpdate();
      }
    },
    _providerSetLocal: function _providerSetLocal(items) {
      this.localItems = items && items.length > 0 ? items.slice() : [];
      this.localBusy = false;
      this.$emit('refreshed');
      // Deprecated root emit
      this.emitOnRoot('table::refreshed', this.id);
      // New root emit
      if (this.id) {
        this.emitOnRoot('bv::table::refreshed', this.id);
      }
    },
    _providerUpdate: function _providerUpdate() {
      var _this4 = this;

      // Refresh the provider items
      if (this.computedBusy || !this.hasProvider) {
        // Don't refresh remote data if we are 'busy' or if no provider
        return;
      }
      // Set internal busy state
      this.localBusy = true;
      // Call provider function with context and optional callback
      var data = this.items(this.context, this._providerSetLocal);
      if (data && data.then && typeof data.then === 'function') {
        // Provider returned Promise
        data.then(function (items) {
          _this4._providerSetLocal(items);
        });
      } else {
        // Provider returned Array data
        this._providerSetLocal(data);
      }
    },
    getTdValues: function getTdValues(item, key, tdValue, defValue) {
      var parent = this.$parent;
      if (tdValue) {
        if (typeof tdValue === 'function') {
          var value = get(item, key);
          return tdValue(value, key, item);
        } else if (typeof tdValue === 'string' && typeof parent[tdValue] === 'function') {
          var _value = get(item, key);
          return parent[tdValue](_value, key, item);
        }
        return tdValue;
      }
      return defValue;
    },
    getFormattedValue: function getFormattedValue(item, field) {
      var key = field.key;
      var formatter = field.formatter;
      var parent = this.$parent;
      var value = get(item, key);
      if (formatter) {
        if (typeof formatter === 'function') {
          value = formatter(value, key, item);
        } else if (typeof formatter === 'string' && typeof parent[formatter] === 'function') {
          value = parent[formatter](value, key, item);
        }
      }
      return value;
    }
  }
};