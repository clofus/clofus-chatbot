'use strict';

var Promise    = require('promise');
var glob       = require('glob');
var Handlebars = require('handlebars');
var fs         = require('graceful-fs');
var Minimize   = require('minimize');
var path       = require('path');
var semver     = require('semver');
var utils      = require('./utils');
var helpers    = require('./helpers');

var minimize = new Minimize({
  empty: false,       // KEEP empty attributes
  cdata: true,        // KEEP CDATA from scripts
  comments: true,     // KEEP comments
  ssi: true,          // KEEP Server Side Includes
  conditionals: true, // KEEP conditional internet explorer comments
  spare: false,       // KEEP redundant attributes
  quotes: false,      // KEEP arbitrary quotes
  loose: false         // KEEP retain one whitespace
});

module.exports = NodeHandlebars;
// -----------------------------------------------------------------------------

function NodeHandlebars(config) {
  config || (config = {});

  this.handlebars  = config.handlebars || this.handlebars;
  this.compress    = config.compress || this.compress;
  this.extname     = config.extname || this.extname;
  this.layoutsDir  = config.layoutsDir || this.layoutsDir;
  this.partialsDir = config.partialsDir || this.partialsDir;
  this.minimize    = typeof config.minimize !== 'undefined' ?
                       config.minimize : true;

  this.handlebarsVersion = NodeHandlebars.getHandlebarsSemver(this.handlebars);

  if (this.extname.charAt(0) !== '.') {
    this.extname = '.' + this.extname;
  }

  this.defaultLayout = config.defaultLayout;
  this.helpers = helpers;

  this.compiled = {};
  this.precompiled = {};

  this.engine = this.renderView.bind(this);
}

NodeHandlebars._fsCache = {};

NodeHandlebars.getHandlebarsSemver = function(handlebars) {
  var version = handlebars.VERSION || '';

  // Makes sure the Handlebars version is a valid semver.
  if (version && !semver.valid(version)) {
    version = version.replace(/(\d\.\d)\.(\D.*)/, '$1.0-$2');
  }

  return version;
};

NodeHandlebars.prototype.handlebars = Handlebars;
NodeHandlebars.prototype.extname = '.html';
NodeHandlebars.prototype.layoutsDir = 'app/views/layout/';
NodeHandlebars.prototype.partialsDir = 'app/views/partial/';

NodeHandlebars.prototype.compileTemplate = function(template, options) {
  options || (options = {});

  var compiler = options.precompiled ? 'precompile' : 'compile',
    compile = this.handlebars[compiler];

  return compile(template);
};

NodeHandlebars.prototype.getPartials = function(options) {
  options || (options = {});

  var partialsDirs = Array.isArray(this.partialsDir) ?
    this.partialsDir : [this.partialsDir];

  partialsDirs = partialsDirs.map(function(dir) {
    var dirPath,
      dirTemplates,
      dirNamespace;

    // Support `partialsDir` collection with object entries that contain a
    // templates promise and a namespace.
    if (typeof dir === 'string') {
      dirPath = dir;
    } else if (typeof dir === 'object') {
      dirTemplates = dir.templates;
      dirNamespace = dir.namespace;
      dirPath = dir.dir;
    }

    // We must have some path to templates, or templates themselves.
    if (!(dirPath || dirTemplates)) {
      throw new Error('A partials dir must be a string or config object');
    }

    // Make sure we're have a promise for the templates.
    var templatesPromise = dirTemplates ? Promise.resolve(dirTemplates) :
      this.getTemplates(dirPath, options);

    return templatesPromise.then(function(templates) {
      return {
        templates: templates,
        namespace: dirNamespace
      };
    });
  }, this);

  return Promise.all(partialsDirs).then(function(dirs) {
    var getPartialName = this._getPartialName.bind(this);

    return dirs.reduce(function(partials, dir) {
      var templates = dir.templates,
        namespace = dir.namespace,
        filePaths = Object.keys(templates);

      filePaths.forEach(function(filePath) {
        var partialName = getPartialName(filePath, namespace);
        partials[partialName] = templates[filePath];
      });

      return partials;
    }, {});
  }.bind(this));
};

NodeHandlebars.prototype.getTemplate = function(filePath, options) {
  filePath = path.resolve(filePath);
  options || (options = {});

  var precompiled = options.precompiled,
    cache = precompiled ? this.precompiled : this.compiled,
    template = options.cache && cache[filePath];

  if (template) {
    return template;
  }

  // Optimistically cache template promise to reduce file system I/O, but
  // remove from cache if there was a problem.
  template = cache[filePath] = this._getFile(filePath, options)
    .then(function(file) {
      return this.compileTemplate(file, options);
    }.bind(this));

  return template.catch(function(err) {
    delete cache[filePath];
    throw err;
  });
};

NodeHandlebars.prototype.getTemplates = function(dirPath, options) {
  options || (options = {});

  return this._getDir(dirPath, options).then(function(filePaths) {
    var templates = filePaths.map(function(filePath) {
      return this.getTemplate(path.join(dirPath, filePath), options);
    }, this);

    return Promise.all(templates).then(function(templates) {
      return filePaths.reduce(function(map, filePath, i) {
        map[filePath] = templates[i];
        return map;
      }, {});
    });
  }.bind(this));
};

NodeHandlebars.prototype.render = function(filePath, context, options) {
  options || (options = {});

  // Force `precompiled` to `false` since we're rendering to HTML.
  if (options.precompiled) {
    options = utils.extend({}, options, {
      precompiled: false
    });
  }

  return Promise.all([
    this.getTemplate(filePath, options),
    options.partials || this.getPartials(options)
  ]).then(function(templates) {
    var template = templates[0];
    var partials = templates[1];
    var data     = options.data;

    var helpers = options.helpers || utils.extend({}, this.handlebars.helpers, this.helpers);

    return this._renderTemplate(template, context, {
      data: data,
      helpers: helpers,
      partials: partials
    });
  }.bind(this));
};

NodeHandlebars.prototype.renderView = function(viewPath, options, callback) {
  var context = options;
  var data = options.data;

  var helpers = utils.extend({},
    this.handlebars.helpers, this.helpers, options.helpers);

  // Pluck-out NodeHandlebars-specific options.
  options = {
    cache: options.cache,
    layout: 'layout' in options ? options.layout : this.defaultLayout,
    precompiled: false
  };

  // Extend `options` with Handlebars-specific rendering options.
  utils.extend(options, {
    data: data,
    helpers: helpers,
    partials: this.getPartials(options)
  });

  this.render(viewPath, context, options)
    .then(function(body) {
      var layoutPath = this._resolveLayoutPath(options.layout);

      if (layoutPath) {
        context = utils.extend({}, context, {
          body: body
        });
        return this.render(layoutPath, context, options);
      }

      if(this.minimize){
        minimize.parse(body, function (err, data) {
          body = data;
        });
      }

      return body;
    }.bind(this))
    .then(utils.passValue(callback))
    .catch(utils.passError(callback));
};

NodeHandlebars.prototype._getDir = function(dirPath, options) {
  dirPath = path.resolve(dirPath);

  var cache = NodeHandlebars._fsCache,
    dir = options.cache && cache[dirPath];

  if (dir) {
    return dir.then(function(dir) {
      return dir.concat();
    });
  }

  var pattern = '**/*' + this.extname;

  // Optimistically cache dir promise to reduce file system I/O, but remove
  // from cache if there was a problem.
  dir = cache[dirPath] = new Promise(function(resolve, reject) {
    glob(pattern, {
      cwd: dirPath
    }, function(err, dir) {
      if (err) {
        reject(err);
      } else {
        resolve(dir);
      }
    });
  });

  return dir.then(function(dir) {
    return dir.concat();
  }).catch(function(err) {
    delete cache[dirPath];
    throw err;
  });
};

NodeHandlebars.prototype._getFile = function(filePath, options) {
  filePath = path.resolve(filePath);

  var cache = NodeHandlebars._fsCache,
    file = options.cache && cache[filePath];

  if (file) {
    return file;
  }

  // Optimistically cache file promise to reduce file system I/O, but remove
  // from cache if there was a problem.
  file = cache[filePath] = new Promise(function(resolve, reject) {
    fs.readFile(filePath, 'utf8', function(err, file) {
      if (err) {
        reject(err);
      } else {
        resolve(file);
      }
    });
  });

  return file.catch(function(err) {
    delete cache[filePath];
    throw err;
  });
};

NodeHandlebars.prototype._getPartialName = function(filePath, namespace) {
  var extRegex = new RegExp(this.extname + '$'),
    name = filePath.replace(extRegex, ''),
    version = this.handlebarsVersion;

  if (namespace) {
    name = namespace + '/' + name;
  }

  // Fixes a Handlebars bug in versions prior to 1.0.rc.2 which caused
  // partials with "/"s in their name to not be found.
  // https://github.com/wycats/handlebars.js/pull/389
  if (version && !semver.satisfies(version, '>=1.0.0-rc.2')) {
    name = name.replace(/\//g, '.');
  }

  return name;
};

NodeHandlebars.prototype._renderTemplate = function(template, context, options) {
  return template(context, options);
};

NodeHandlebars.prototype._resolveLayoutPath = function(layoutPath) {
  if (!layoutPath) {
    return null;
  }

  if (!path.extname(layoutPath)) {
    layoutPath += this.extname;
  }

  if (layoutPath.charAt(0) !== '/') {
    layoutPath = path.join(this.layoutsDir, layoutPath);
  }

  return layoutPath;
};
