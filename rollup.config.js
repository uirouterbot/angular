import nodeResolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';
import sourcemaps from 'rollup-plugin-sourcemaps';
import commonjs from 'rollup-plugin-commonjs';

let MINIFY = process.env.MINIFY;

let pkg = require('./package.json');
let banner = `/**
 * ${pkg.description}
 * @version v${pkg.version}
 * @link ${pkg.homepage}
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */`;

let uglifyOpts = { output: {} };
// retain multiline comment with @license
uglifyOpts.output.comments = (node, comment) => comment.type === 'comment2' && /@license/i.test(comment.value);

let plugins = [nodeResolve({ jsnext: true }), sourcemaps(), commonjs()];

if (MINIFY) plugins.push(uglify(uglifyOpts));

let extension = MINIFY ? '.min.js' : '.js';

const onwarn = warning => {
  // Suppress this error message... https://github.com/rollup/rollup/wiki/Troubleshooting#this-is-undefined
  const ignores = ['THIS_IS_UNDEFINED'];
  if (!ignores.some(code => code === warning.code)) {
    console.error(warning.message);
  }
};

function isExternal(id) {
  // @uirouter/core and ui-router-rx should be external
  // All rxjs and @angular/* should be external
  // except for @angular/router/src/router_config_loader
  let externals = [
    /^ui-router-rx/,
    /^@uirouter\/rx/,
    /^@uirouter\/core/,
    /^rxjs/,
    /^@angular\/(?!router\/src\/router_config_loader)/,
  ];
  return externals.map(regex => regex.exec(id)).reduce((acc, val) => acc || !!val, false);
}

const CONFIG = {
  input: 'lib/index.js',
  output: {
    name: '@uirouter/angular',
    file: '_bundles/ui-router-ng2' + extension,
    sourcemap: true,
    format: 'umd',
    exports: 'named',
    banner: banner,
    globals: {
      tslib: 'tslib',
      '@uirouter/core': '@uirouter/core',
      '@uirouter/rx': '@uirouter/rx',
      'ui-router-rx': 'ui-router-rx',
      '@angular/core': 'ng.core',
      '@angular/common': 'ng.common',
      '@angular/router': 'ng.router',
    },
  },

  plugins: plugins,
  onwarn: onwarn,
  external: isExternal,
};

export default CONFIG;
