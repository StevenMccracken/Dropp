module.exports = function grunt(_grunt) {
  // Check if database is meant to be run in mock mode with the 'mock' argument
  process.argv.forEach((arg) => {
    const mockMatches = arg.match(/--mock/gi) || [];
    if (mockMatches.length > 0) process.env.MOCK = '1';
  });

  const options = {
    pkg: _grunt.file.readJSON('package.json'),
    jasmine_node: {
      options: {
        forceExit: true,
        match: '.',
        matchall: false,
        extensions: 'js',
        captureExceptions: true,
        specNameMatcher: 'spec',
      },
      all: ['spec/'],
    },
  };

  _grunt.initConfig(options);
  _grunt.loadNpmTasks('grunt-jasmine-node');
  _grunt.registerTask('test', 'jasmine_node');
};
