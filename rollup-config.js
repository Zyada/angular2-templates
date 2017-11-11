import rollup      from 'rollup'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs    from 'rollup-plugin-commonjs';
import uglify      from 'rollup-plugin-uglify'
import { buildOptimizer } from '@angular-devkit/build-optimizer';

function angularBuildOptimizer() {
  return {
    name: 'angular-optimizer',
    transform: (content) => buildOptimizer({ content }).content,
  }
}

export default {
  input: 'appjs/app/main_aot.js',
  output: {
    file: 'aot-build.min.js', // output a single application bundle
    format: 'iife'
  },
  
  sourceMap: false,
  
  onwarn: function(warning) {
    // Skip certain warnings

    // should intercept ... but doesn't in some rollup versions
    if ( warning.code === 'THIS_IS_UNDEFINED' ) { return; }
    
    // console.warn everything else
    console.warn( warning.message );
  },
  plugins: [
      angularBuildOptimizer(),
      nodeResolve({jsnext: true, module: true}),      
      commonjs({
        include: 'node_modules/rxjs/**'
      }),
      uglify()
  ]
}
