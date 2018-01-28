module.exports = function grunt(_grunt) {
  const options = {
    pkg: _grunt.file.readJSON('package.json'),
    jasmine_node: {
      options: {
        forceExit: true,
        match: '.',
        matchall: false,
        extensions: 'js',
        specNameMatcher: 'spec',
      },
      all: ['spec/'],
    },
  };

  _grunt.initConfig(options);
  _grunt.loadNpmTasks('grunt-jasmine-node');
  _grunt.registerTask('test', 'jasmine_node');
};
