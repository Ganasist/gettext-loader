'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _loaderUtils = require('loader-utils');

var _loaderUtils2 = _interopRequireDefault(_loaderUtils);

var _gettextParser = require('gettext-parser');

var _gettextParser2 = _interopRequireDefault(_gettextParser);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var DEFAULT_GETTEXT = '__';

var root = process.env.PWD;
var config = require(_path2.default.join(root, 'gettext.config.js'));

module.exports = function (source) {
  var _this = this;

  if (this.cacheable) {
    this.cacheable();
  }

  var outputs = [];

  if (config.output) {
    outputs.push({
      path: process.env.npm_lifecycle_event === 'maketranslationswidget' ? root + '/' + config.widget : root + '/' + config.output
    });
  }

  if (config.outputs) {
    for (var key in config.outputs) {
      if (!config.outputs.hasOwnProperty(key)) continue;

      outputs.push({
        path: root + '/' + config.outputs[key],
        language: key
      });
    }
  }

  var methodNames = config.methods || [DEFAULT_GETTEXT];

  var AST = (0, _utils.parseECMA)(source);
  var translations = _utils.extractTranslations.apply(undefined, _toConsumableArray(methodNames))(AST);
  var fileName = (0, _utils.makeRelativePath)(this.request);

  if (!translations.length) {
    return source;
  }

  var _loop = function _loop(i) {
    var current = void 0;
    if (_fs2.default.existsSync(outputs[i].path)) {
      var buffer = _fs2.default.readFileSync(outputs[i].path);
      current = _gettextParser2.default.po.parse(buffer, 'utf-8');
    } else {
      current = {
        charset: 'utf-8',
        translations: { '': {} }
      };
    }
    var newStrings = function newStrings(node) {
      return !current.translations[''][node.text];
    };
    var found = translations.filter(newStrings);

    if (found.length) {
      if (!config.silent) {
        console.log(found.length + ' new translations found in ' + (0, _utils.getFilename)(_this.resourcePath));
      }
    }

    current.headers = config.header;
    var trans = current.translations[''];

    translations.forEach(function (translation) {
      var msgid = translation.text;
      var reference = fileName + ':' + translation.loc.line;

      if (msgid && trans[msgid]) {
        trans[msgid].comments.reference += '\n' + reference;
      } else {
        trans[msgid] = {
          msgid: msgid,
          msgstr: translation.pluralForm ? ['', ''] : [''],
          comments: {
            reference: reference
          }
        };
        if (translation.pluralForm) {
          trans[msgid].msgid_plural = translation.pluralForm;
        }
      }
    });

    var outputBuf = _gettextParser2.default.po.compile(current);
    require('fs').writeFileSync(outputs[i].path, outputBuf);
  };

  for (var i = 0; i < outputs.length; i++) {
    _loop(i);
  }

  return source;
};