/*
 * Copyright (c) 2016 José F. Maldonado
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. 
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// Load dependencies.
const expect  = require("chai").expect;
const SpellChecker = require('./index.js');
const fs = require('fs');

describe("Module methods", function() {
    beforeEach(function () {
        // Delete the extracted dictionary file. This will force us to extract again.
        var dicPath = __dirname + "/dict/en-US.dic";
        if (fs.existsSync(dicPath)) {
            fs.unlinkSync(dicPath);
        }
    });

    it("getDictionary()", function(done) {
        // Get async dictionary.
        SpellChecker.getDictionary("en-US", function(err, asyncDict) {
            // Dictionary should be loaded.
            expect(asyncDict).to.not.be.null;
            done();
        });
    });

    it("getDictionarySync()", function() {
        // Get sync dictionary.
        var syncDict = SpellChecker.getDictionarySync("en-US");
        // Dictionary should be loaded.
        expect(syncDict).to.not.be.null;
    });
});


describe("Dictionary methods", function() {
    var dictionary = null;
    
    // Load dictionary.
    before(function (done) {
        SpellChecker.getDictionary("en-US", function(err, dict) {
            dictionary = dict;
            done();
        });
    });
  
    describe("spellCheck()", function() {
        it("should return true for 'December'", function() {
            expect(dictionary.spellCheck('December')).to.be.true;
        });
        it("should return true for 'december'", function() {
            expect(dictionary.spellCheck('december')).to.be.true;
        });
        it("should return true for 'house'", function() {
            expect(dictionary.spellCheck('house')).to.be.true;
        });
        it("should return true for 'a'", function() {
            expect(dictionary.spellCheck('a')).to.be.true;
        });
        it("should return true for 'zymurgy'", function() {
            expect(dictionary.spellCheck('zymurgy')).to.be.true;
        });
        it("should return true for \"Zorro's\"", function() {
            expect(dictionary.spellCheck("Zorro's")).to.be.true;
        });
        it("should return false for 'housec'", function() {
            expect(dictionary.spellCheck('housec')).to.be.false;
        });
        it("should return false for 'decembe'", function() {
            expect(dictionary.spellCheck('decembe')).to.be.false;
        });
    });
  
    describe("isMisspelled()", function() {
        it("should return false for 'December'", function() {
            expect(dictionary.isMisspelled('December')).to.be.false;
        });
        it("should return false for 'december'", function() {
            expect(dictionary.isMisspelled('december')).to.be.false;
        });
        it("should return false for 'house'", function() {
            expect(dictionary.isMisspelled('house')).to.be.false;
        });
        it("should return false for 'a'", function() {
            expect(dictionary.isMisspelled('a')).to.be.false;
        });
        it("should return false for 'zymurgy'", function() {
            expect(dictionary.isMisspelled('zymurgy')).to.be.false;
        });
        it("should return false for \"Zorro's\"", function() {
            expect(dictionary.isMisspelled("Zorro's")).to.be.false;
        });
        it("should return true for 'housec'", function() {
            expect(dictionary.isMisspelled('housec')).to.be.true;
        });
        it("should return true for 'decembe'", function() {
            expect(dictionary.isMisspelled('decembe')).to.be.true;
        });
    });

    describe("getSuggestions()", function() {
        it("should get suggestions for 'house'", function() {
            expect(dictionary.getSuggestions('house').length).to.be.above(0);
        });
        it("should get suggestions for 'housec'", function() {
            expect(dictionary.getSuggestions('housec').length).to.be.above(0);
        });
    });

    describe("checkAndSuggest()", function() {
        it("should return true and get suggestions for 'house'", function() {
            var res = dictionary.checkAndSuggest('house');
            expect(res.misspelled).to.be.false;
            expect(res.suggestions.length).to.be.above(0);
        });
        it("should return false and get suggestions for 'housec'", function() {
            var res = dictionary.checkAndSuggest('housec');
            expect(res.misspelled).to.be.true;
            expect(res.suggestions.length).to.be.above(0);
        });
    });

    describe("addRegex() and clearRegexs()", function() {
        it("should validate numbers", function() {
            expect(dictionary.spellCheck('1234')).to.be.false;
            expect(dictionary.spellCheck('1234.45')).to.be.false;
            dictionary.addRegex(/^-?\d*\.?\d*$/);
            expect(dictionary.spellCheck('1234')).to.be.true;
            expect(dictionary.spellCheck('1234.45')).to.be.true;
            dictionary.clearRegexs();
        });
        it("should validate emails", function() {
            expect(dictionary.spellCheck('john@doe.com')).to.be.false;
            expect(dictionary.spellCheck('jane@doe.net')).to.be.false;
            expect(dictionary.spellCheck('jane@joe')).to.be.false;
            dictionary.addRegex(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
            expect(dictionary.spellCheck('john@doe.com')).to.be.true;
            expect(dictionary.spellCheck('jane@doe.net')).to.be.true;
            expect(dictionary.spellCheck('jane@joe')).to.be.false;
            dictionary.clearRegexs();
        });
        it("should validate URLs", function() {
            expect(dictionary.spellCheck('https://www.test.com')).to.be.false;
            expect(dictionary.spellCheck('http://www.test.com')).to.be.false;
            expect(dictionary.spellCheck('http://test.com')).to.be.false;
            dictionary.addRegex(/(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/);
            expect(dictionary.spellCheck('https://www.test.com')).to.be.true;
            expect(dictionary.spellCheck('http://www.test.com')).to.be.true;
            expect(dictionary.spellCheck('http://test.com')).to.be.true;
            dictionary.clearRegexs();
        });
    });    
});
