var path      = require('path');
var asmRef    = require('node-asm-ref');
var jade      = require('jade');
var async     = require('async');
var fs        = require('fs');
var util      = require('util');
var x86AsmRef = asmRef();

function generateInstructionPage(instruction, done) {
   x86AsmRef.getInstructionByMnemonic(instruction.mnemonic, function (err, detailedInstruction) {
        var fileName = detailedInstruction.mnemonic.toLowerCase() + '.html';
        var filePath = path.join(__dirname, 'www', fileName);
        var html = jade.renderFile('instruction.jade',
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

async.waterfall([
    function getAllInstructions(callback) {
        x86AsmRef.getAllInstructions(function (err, instructions) {
            writeInstructionsToFile(instructions, 'instructions.json', callback);
        });
    },
    function generateEachInstructionPage(instructions, callback) {
        if (instructions) {
            async.eachSeries(instructions, function (instruction, done) {
                generateInstructionPage(instruction, done);
            }, function (err) {
                callback();
            });
        }
    }
], function (err, results) {
    if (err) {
        console.log('Error: ', err);
    } else {
        console.log('Done!');
    }
});