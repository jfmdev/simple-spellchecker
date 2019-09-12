/*
 * Copyright (c) 2016 José F. Maldonado
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. 
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// Load dependencies.
const fs = require('fs');
const path = require('path');
const tmp = require('tmp');
const Zip = require('adm-zip');
const stripBOM = require('strip-bom');
const Dictionary = require('./dictionary.js');

const FOLDER_PATH = __dirname + '/dict';

// Define module.
var SpellChecker = {
    /**
     * Create a dictionary from a file, which might be either a .dic or a .zip file.
     *
     * @param {String} fileName The name of the file from which read the word list.
     * @param {String} folderPath The path to the directory in which the file is located (optional).
     * @param {Callback} callback A function to invoke when either the dictionary was created or an error was found.
     */
    getDictionary: function(fileName, folderPath /*, callback*/) {
        try{
            // Initialize variables.
            var folder = (!folderPath || typeof folderPath != 'string')? FOLDER_PATH : folderPath;
            var callback = arguments[arguments.length - 1];
            var dic_path = folder + '/' + fileName + '.dic';
            var zip_path = folder + '/' + fileName + '.zip';
            
            // Verify if the dictionary file exists.
            fs.exists(dic_path, function(exists) {
                if(exists) {
                    // The file exists, read it.
                    SpellChecker._readFile(dic_path, callback);
                } else {
                    // The file do not exists, verify if the ZIP file exists.
                    fs.exists(zip_path, function(exists) {
                        if(exists) {
                            try{
                                // The file ZIP exists, unzip it.
                                SpellChecker._unzipSync(zip_path, folder);
                                SpellChecker._readFile(dic_path, callback);
                            } catch(errZip) {
                                // Return error.
                                if(callback) callback('An unexpected error ocurred: ' + errZip, null);
                            }
                        } else {
                            // The ZIP file also doesn't exists, return an error.
                            callback('The dictionary could not be read, no file with the name "' + fileName + '" could be found', null);
                        } 
                    });
                }
            });
        } catch(err) {
            // Return error.
            if(callback) callback('An unexpected error ocurred: ' + err, null);
        }
    },
  
    /**
     * Create a dictionary from a .dic file.
     *
     * @param {String} file_path The path of the file.
     * @param {Callback} callback A function to invoke when either the dictionary was created or an error was found.
     */  
    _readFile: function(file_path, callback) {
        fs.readFile(file_path, 'utf8', function(err, text) {
            // Check for errors.
            if (!err) {
                // Create dictionary and return it.
                var dictionary = new Dictionary(text.split('\n'));
                callback(null, dictionary);
            } else {
                // Return an error.
                callback("The dictionary file could not be read: " + err, null);
            }
        });
    },

    /**
     * Create a dictionary from a .dic file synchronously.
     *
     * @param {String} file_path The path of the file.
     * @returns The created dictionary
     * @throws An error if the file couldn't be opened
     */  
    _readFileSync: function(file_path) {
        try {
            var text = fs.readFileSync(file_path, 'utf8')
            // Create dictionary and return it.
            var dictionary = new Dictionary(text.split('\n'));
            return dictionary;
        } catch(err) {
            // Return an error.
            throw new Error("The dictionary file could not be read: " + file_path + ". Error: " + err);
        }
    },

    /**
     * Unzip a zip file.
     *
     * Each entry in the zip file will be extracted atomically. From the perspective of another
     * process, the unzipped file will either not exist or will be fully unzipped.
     *
     * @param {String} zipPath The path of the zip file.
     * @param {String} destinationDir The directory to unzip into.
     * @throws An error if the file couldn't be unzipped.
     */
    _unzipSync: function(zipPath, destinationDir) {
        // Unzip into a tmp directory.
        var tmpDir = tmp.dirSync({ dir: destinationDir });
        var zip = new Zip(zipPath);
        zip.extractAllTo(tmpDir.name);

        // Move the unzipped files out of the tmp directory and into the destination directory.
        zip.getEntries().forEach(({ entryName }) => {
            var from = path.join(tmpDir.name, entryName);
            var to = path.join(destinationDir, entryName);
            fs.renameSync(from, to);
        });

        // Clean up the tmp directory
        tmpDir.removeCallback();
    },
  
    /**
     * Create a dictionary from a .dic file .
     *
     * @param {String} fileName The name of the file from which read the word list.
     * @param {String} folderPath The path to the directory in which the file is located (optional).
     * @return {Object} An instance of the Dictionary class.
     * @throws {Exception} If the dictionary's file can't be found or is invalid.
     */  
    getDictionarySync: function(fileName, folderPath) {
        try{
            // Initialize variables.
            var folder = (!folderPath || typeof folderPath != 'string')? FOLDER_PATH : folderPath;
            var dic_path = folder + '/' + fileName + '.dic';
            var zip_path = folder + '/' + fileName + '.zip';
          
            // Verify if the dictionary file exists.
            if(fs.existsSync(dic_path)) {
                // The file exists, read it.
                var dictionary = SpellChecker._readFileSync(dic_path);
                return dictionary;
            } else {
                // The file do not exists, verify if the ZIP file exists.
                var exists = fs.existsSync(zip_path);
                if(exists) {
                    // The file ZIP exists, unzip it.
                    SpellChecker._unzipSync(zip_path, folder);
                    var dictionary = SpellChecker._readFileSync(dic_path);
                    return dictionary;
                } else {
                    // The ZIP file also doesn't exists, return an error.
                    throw new Error('The dictionary could not be read, no file with the name "' + fileName + '" could be found');
                } 
            }
        } catch(err) {
            // Throw an error.
            throw new Error('An unexpected error ocurred: ' + err);
        }
    },
    
    /**
     * Reads a UTF8 dictionary file, removes the BOM and \r characters and sorts the list of words.
     *
     * @param {String} inputPath The path for the input file.
     * @param {String} outputPath The path to output (optional, by default is equals to the input file).
     * @param {Callback} callback A function to invoke after finishing.
     */
    normalizeDictionary: function(inputPath, outputPath /*, callback*/) {
        try{
            // Parses arguments
            if(!outputPath || typeof outputPath != 'string') outputPath = inputPath;
            var callback = arguments.length > 0? arguments[arguments.length - 1] : function() {};
            
            // Verify if the dictionary file exists.
            fs.exists(inputPath, function(exists) {
                if(exists) {
                    // The file exists, read it.
                    fs.readFile(inputPath, 'utf8', function(err, content) {
                        // Check for errors.
                        if (!err) {
                            // Remove BOM and \r characters.
                            content = stripBOM(content);
                            content = content.replace(/\r/g, '');
                            
                            // Sort words.
                            var lines = content.split('\n');      
                            var collator = new Intl.Collator(); // Use this comparator for consider accents and special characters.
                            lines = lines.sort(collator.compare);
                            
                            // Generate output content.
                            var newContent = '';  
                            var first = true;
                            for(var i=0; i<lines.length; i++) {          
                                if(lines[i] != '' && lines[i] != '\n') {
                                    if(!first) newContent += '\n';
                                    newContent += lines[i];
                                    first = false;
                                }
                            }
                            
                            // Write output file.
                            fs.writeFile(outputPath, newContent, 'utf8', function(err) {
                                // Return result.
                                callback(err? ("The output file could not be writted: " + err) : null, !err);
                            });
                        } else {
                            // Return an error.
                            callback("The input file could not be read: " + err, false);
                        }
                    });
                } else {
                    // Return an error indicating that the file doens't exists.
                    callback("The input file does not exists", false);
                }            
            });
        } catch(err) {
            // Return an error.
            callback('An unexpected error ocurred: ' + err, false);
        }
    }
}

// Export module.
module.exports = SpellChecker;
