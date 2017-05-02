'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

    return gettextFunctions.map(function (node) {
      var strings = node.arguments.slice(0, 2).map(function (x) {
        return x.value;
      });
      var location = node.loc.start;
      return {
        text: strings[0],
        pluralForm: strings[1],
        loc: {
          line: location.line,
          column: location.column
        }
      };
    });
  };
};

exports.default = extractTranslations;