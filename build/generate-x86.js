var path      = require('path');
var asmRef    = require('node-asm-ref');
var jade      = require('jade');
var async     = require('async');
var fs        = require('fs');
var util      = require('util');

var x86AsmRef = asmRef();

var INSTRUCTIONS_SUBDIR = 'instructions';

function generateInstructionPage(templatePath, x86FolderPath, instruction, done) {
   x86AsmRef.getInstructionByMnemonic(instruction.mnemonic, function (err, detailedInstruction) {
        var fileName = detailedInstruction.mnemonic.toLowerCase() + '.html';
        var filePath = path.join(x86FolderPath, fileName);
        var html = jade.renderFile(templatePath,
                                   {
                                     instruction: detailedInstruction,
                                     pretty: true,
                                     compileDebug: false
                                   });
        console.log('Generating HTML for instruction [%s] to file [%s]: ',
                    instruction.mnemonic,
                    filePath);
        var htmlWriteStream = fs.createWriteStream(filePath);

        htmlWriteStream.on('error', function (err) {
            console.log('Error: ', err);
        });

        htmlWriteStream.on('finish', function () {
            done();
        })

        htmlWriteStream.write(html);
        htmlWriteStream.end();
    });
}

function writeInstructionsToFile(instructions, filePath, callback) {
    if (instructions) {
        var instructionsListStream = fs.createWriteStream(filePath);
        if (instructionsListStream) {

            instructionsListStream.on('finish', function () {
                callback(null, instructions);
            });

            instructionsListStream.on('error', function (err) {
                callback(err, instructions);
            });

            var simpleInstructions = [];
            instructions.forEach(function (instruction) {
                simpleInstructions.push({mnemonic: instruction.mnemonic, synopsis: instruction.synopsis});
            });

            instructionsListStream.write(JSON.stringify(simpleInstructions, null, " "));
            instructionsListStream.end();

        } else {
            return callback(err, instructions);
        }
    } else {
        return callback(err, instructions);
    }
}

function generateX86Instructions(instructionTemplatePath, x86FolderPath, done) {
    async.waterfall([
        function getAllInstructions(callback) {
            x86AsmRef.getAllInstructions(function (err, instructions) {
                writeInstructionsToFile(instructions,
                                        path.join(x86FolderPath, 'instructions.json'),
                                        callback);
            });
        },
        function generateInstructionsPages(instructions, callback) {
            async.series([
                function createInstructionsSubdir(callback) {
                    var instructionsSubdirPath = path.join(x86FolderPath, INSTRUCTIONS_SUBDIR);
                    fs.exists(instructionsSubdirPath, function (exists) {
                        if (!exists) {
                            fs.mkdir(instructionsSubdirPath, function mkdirCallback(err) {
                                callback(err);
                            });
                        } else {
                            callback();
                        }
                    });
                },
                function generateEachInstructionPage(callback) {
                    if (instructions) {
                        async.eachSeries(instructions, function (instruction, done) {
                            generateInstructionPage(instructionTemplatePath,
                                                    path.join(x86FolderPath, INSTRUCTIONS_SUBDIR),
                                                    instruction,
                                                    done);
                        }, function (err) {
                            callback(err);
                        });
                    }
                }], function (err, results) {
                    callback(err);
                });
        }
    ], function (err, results) {
        done(err);
    });
}

module.exports = {
    generateAllInstructionsPages: generateX86Instructions,
    generateInstructionPage     : generateInstructionPage
};