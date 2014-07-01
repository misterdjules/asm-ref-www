var generateX86InstructionsPages = require('./build/generate-x86.js')
module.exports = function setupGrunt(grunt) {

    grunt.initConfig({
        jade: {
            index: {
                files: {
                    "public/static/index.html": "view/index.jade"
                }
            }
        }
    });

    grunt.registerTask('generate-index', ['jade:index']);

    grunt.registerTask('generate-x86', function () {
        var done = this.async();
        grunt.log.writeln('Generating x86 static pages...');

        grunt.file.mkdir('./public/static/x86');

        generateX86InstructionsPages('view/x86/instructions/instruction.jade',
                                     './public/static/x86', function (err) {
            if (err) {
                grunt.log.error('Error when generating x86 static pages: ', err);
            } else {
                grunt.log.ok('x86 pages generated successfully!');
            }

            done();
        });
    });

    grunt.registerTask('default', ['generate-index', 'generate-x86']);

    grunt.loadNpmTasks('grunt-contrib-jade');
};