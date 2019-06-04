Simple Spellchecker
===================

> A simple and fast spellchecker with spelling suggestions and Electron's integration


Features
--------

**Simple Spellchecker** is a spellchecker module for Node.js, that allows to check if a word is misspelled and to get spelling suggestions.

It comes with dictionaries for English, Spanish, French, German and Dutch, but you can easily add more languages by simply defining a text file with a list of valid words.

It also has a CLI tool that allows to check words from the command line.

Usage
-----

In order to use the module, you must first install it using NPM.

    npm install simple-spellchecker

And then require the module, get a `Dictionary` object and invoke their methods.

```javascript
var SpellChecker = require('simple-spellchecker');
SpellChecker.getDictionary("fr-FR", function(err, dictionary) {
    if(!err) {
        var misspelled = ! dictionary.spellCheck('maisonn');
        if(misspelled) {
            var suggestions = dictionary.getSuggestions('maisonn');
        }
    }
});    
```

Methods
-------

### Module

The module has three public methods: `getDictionary()`,  `getDictionarySync()` and `normalizeDictionary()`.

#### getDictionary(fileName [, folderPath], callback)

This method allows to get a `Dictionary` instance from a file. 

Parameters:
 * `fileName`: The name of the dictionary's file. The method is going to first search a file with `.dic` extension, if not found, then is going to search a `.zip` and is going to unzip it.
 * `folderPath`: The folder in which the dictionary's file is located. This parameter is optional, by default it assumes that the file is in the `dict` folder.
 * `callback`: A function which is going to be invoked for return the `Dictionary` object.

Example: 

```javascript
var SpellChecker = require('simple-spellchecker');
SpellChecker.getDictionary("fr-FR", function(err, result) {
    var dictionary = result;
});    
```

#### getDictionarySync(fileName [, folderPath])

This method allows to get a `Dictionary` instance from a file, in a synchronous way.

Parameters:
 * `fileName`: The name of the dictionary's file. The file must have `.dic` extension.
 * `folderPath`: The folder in which the dictionary's file is located. This parameter is optional, by default it assumes that the file is in the `dict` folder.

Returns:
 * A `Dictionary` object. 

Example: 

```javascript
var SpellChecker = require('simple-spellchecker');
var dictionary = SpellChecker.getDictionarySync("fr-FR");    
```

#### normalizeDictionary(inputPath [, outputPath], callback)

This methods reads a UTF-8 dictionary file, removes the BOM and `\r` characters and sorts the list of words.

Parameters:
 * `inputPath`: The path of the dictionary file.
 * `outputPath`: The path for the normalized dictionary file. This parameter is optional, by deafult the original file is overwritten.
 * `callback`: A function which is going to be invoked when the process has finished.

Example:

```javascript
var SpellChecker = require('simple-spellchecker');
SpellChecker.normalizeDictionary(inputFile, outputFile, function(err, success) {
    if(success) console.log("The file was normalized");
}); 
```   

### Dictionary

The `Dictionary` class has six public methods: `getLength()`,  `setWordlist()`,  `spellCheck()`,  `isMisspelled()`,  `getSuggestions()` and `checkAndSuggest()`

#### getLength()

This method allows to get the quantity of words that the dictionary has.

Returns:
 * An integer with the number of words. 

#### setWordlist(wordlist)

This method allows to set the words of the dictionary.

Parameter:
 * `wordlist`: an array of strings.

### spellCheck(word)

This method allows to verify is a word is correctly written or not.

Parameter:
 * `word`: the word to verify.

Returns:
 * `true` if the word is in the dictionary, `false` if not. 

#### isMisspelled(word)

This method allows to verify is a word is misspelled or not.

Parameter:
 * `word`: the word to verify.

Returns:
 * `true` if the word is misspelled, `false` if not

#### getSuggestions(word [, limit] [, maxDistance])

This method allows to get spelling suggestions for a word.

Parameters:
 * `word`: the word used to generate the suggestions.
 * `limit`: the maximum number of suggestions to get (by default, 5).
 * `maxDistance`: the maximum _edit distance_ that a word can have from the `word` parameter, in order to being considered as a valid suggestion (by default, 2).

Returns:
 * An array of strings.

#### checkAndSuggest(word [, limit] [, maxDistance])

This method allows to verify if a word is misspelled and to get spelling suggestions.

Parameters:
 * `word`: the word to verify.
 * `limit`: the maximum number of suggestions to get (by default, 5).
 * `maxDistance`: the maximum _edit distance_ that a word can have from the `word` parameter, in order to being considered as a valid suggestion (by default, 2).

Returns:
 * An object with the fields `misspelled`, which contains a boolean, and `suggestions`, which contains an array of strings.

#### addRegex(regex)

This method adds a regular expression that will be used to verify if a word is valid even though is not in the dictionary.

This might be useful when avoiding marking special words as misspelled, such as numbers, emails, or URL addresses.

Parameters:
 * `regex`: a regular expression object.

#### clearRegex

This method removes all previous regular expressions added using the method `addRegex()`.

Add dictionaries
----------------

In order to use custom dictionaries, you must define a text file with a list of valid words, where each word is separated by a new line. 

### File's name

The file's extension must be `.dic`, and the name should (preferably) be composed by the language code and the region designator (e.g. `es-AR` if the language is Spanish and the region is Argentina).

Optionally you can also pack the file in a ZIP package, the module is going to be able to unzip it and read it as long as the `.zip` file has the same name has the `.dic` file (e.g. a file `es-AR.zip` that contains the file `es-AR.dic`). 

### File's encoding

The file must be encoded in UTF8 (without BOM), the words must be separated with a _Line Feed_ (i.e. `\n`) and not with a _Carriage Return_ plus a _Line Feed_ (i.e. `\r\n`), and the words must be sorted in ascending order.

The module can remove all unwanted characters and sort the words, if you either invoke the `normalize()` method or pack the file in a ZIP file (the module automatically calls the `normalize()` method after unzip it).

CLI tools
---------

The module comes with a script that allows to normalize dictionaries and to test them.

### Test

In order to test a dictionary file, you must execute the script indicating the folder and the name of the dictionary's file and the word that you want to test. 

For example, the following sentence will search in the `dict` folder a dictionary which is either in the file `en-GB.dic` or `en-GB.zip`, and is going to verify if the word `house` is misspelled or not and is going to search some spelling suggestions.

    node cli.js check "./dict" en-GB house
    

### Normalize

In order to normalize a dictionary file, you must execute the script indicating the file's path:

    node cli.js normalize "./dict/en-GB.dic"

If you don't want to override the original file, you can specify the path for an output file:

    node cli.js normalize "./dict/en-GB.dic" "C:/output/en-GB.dic"

Electron's integration
----------------------

There are several ways in which you can integrate this module with Electron. But if you want a starting point, the following example shows how to enable the English dictionary:

**1)** Install the module as a dependency of your project (`npm install simple-spellchecker --save`).

**2)** In the main process, require the module, load the dictionary, and define a function to access to his methods:

```javascript
// Initialization.
var SpellChecker = require('simple-spellchecker');
var myDictionary = null;

// Load dictionary.
SpellChecker.getDictionary("en-US", "./node_modules/simple-spellchecker/dict", function(err, result) {
    if(!err) {
        myDictionary = result;
    }
});

// Define function for consult the dictionary.
ipcMain.on('checkspell', function(event, word) {
    var res = null;
    if(myDictionary != null && word != null) {
        res = myDictionary.spellCheck(word);
    }
    event.returnValue = res;
});
```

**3)** In the renderer process, define a spell checker provider that uses the previously loaded dictionary.

```javascript
// Get web frame.
var webFrame = require('electron').webFrame;

webFrame.setSpellCheckProvider("en-US", false, {
    spellCheck: function(text) {      
        var res = ipcRenderer.sendSync('checkspell', text);
        return res != null? res : true;
    }
});
```

Unit testing
------------

The module is partially tested by the file `test.js` (using _Mocha_ and _Chai_). In order to run the tests, just execute the command `npm test`.

License
-------

Simple Spellchecker is free software; you can redistribute it and/or modify it under the terms of the Mozilla Public License v2.0. 
You should have received a copy of the MPL 2.0 along with this library, otherwise you can obtain one at <http://mozilla.org/MPL/2.0/>.
