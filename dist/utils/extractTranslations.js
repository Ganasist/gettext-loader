'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ramda = require('ramda');

var _estreeUtils = require('estree-utils');

var extractTranslations = function extractTranslations() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return function (ast) {

    var gettextFunctions = _estreeUtils.filterTreeForMethodsAndFunctionsNamed.apply(undefined, args)(ast);

    if (!gettextFunctions.length) {
      return [];
    }

    var gettextLocations = (0, _ramda.map)(function (node) {
      return node.loc.start;
    })(gettextFunctions);
    var firstArgument = (0, _ramda.compose)((0, _ramda.prop)('value'), _ramda.head, (0, _ramda.prop)('arguments'));
    var translationStrings = (0, _ramda.map)(firstArgument)(gettextFunctions);

    var addLocation = function addLocation(string) {
      var location = gettextLocations[translationStrings.indexOf(string)];
      return {
        text: string,
        loc: {
          line: location.line,
          column: location.column
        }
      };
    };

    return (0, _ramda.map)(addLocation)(translationStrings);
  };
};

exports.default = extractTranslations;