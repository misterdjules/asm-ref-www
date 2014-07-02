var generateX86 = require('./build/generate-x86.js');
var asmRef      = require('node-asm-ref');

var x86AsmRef = asmRef();

module.exports = function setupGrunt(grunt) {

    grunt.initConfig({
        jade: {
            index: {
                files: {
                    "public/static/index.html": "view/index.jade"
                },
                options: {
                    pretty: true
                }
            }
        }
    });

    grunt.registerTask('generate-index', ['jade:index']);

    grunt.registerTask('generate-x86', function (mnemonic) {
        var done = this.async();

        grunt.file.mkdir('./public/static/x86');

        if (mnemonic) {
            x86AsmRef.getInstructionByMnemonic(mnemonic.toUpperCase(), function (err, instruction) {
                if (err) {
                    grunt.log.error("Couldn't find instruction with mnemonic [%s].", mnemonic);
                    done();
                } else {
                    generateX86.generateInstructionPage('view/x86/instructions/instruction.jade',
                                                        './public/static/x86/instructions',
                                                        instruction,
                                                        function (err) {
                                                            if (err) {
                                                                grunt.log.error('Error when generating page for mnemonic %s: %s', mnemonic, err);
                                                            } else {
                                                                grunt.log.ok('Successfully generated page for mnemonic [%s]', mnemonic);
                                                            }

                                                            done();
                                                        });
                }
            });
        } else {
            grunt.log.writeln('Generating x86 static pages...');

            generateX86.generateAllInstructionsPages('view/x86/instructions/instruction.jade',
                                                     './public/static/x86', function (err) {
                if (err) {
                    grunt.log.error('Error when generating x86 static pages: ', err);
                } else {
                    grunt.log.ok('x86 pages generated successfully!');
                }

                done();
            });
        }
    });

    grunt.registerTask('default', ['generate-index', 'generate-x86']);

    grunt.loadNpmTasks('grunt-contrib-jade');
};