const DEFAULT_GETTEXT = '__'

import fs from 'fs';
import path from 'path';
import loaderUtils from 'loader-utils';
import gettextParser from 'gettext-parser';

import {
  extractTranslations,
  parseECMA,
  getFilename,
  makeRelativePath
} from './utils';

const root = process.env.PWD;
const config = require(path.join(root, 'gettext.config.js'));

module.exports = function(source) {

  if (this.cacheable){
    this.cacheable();
  }

  const outputs = [];

  if (config.output) {
    outputs.push({
        path: process.env.npm_lifecycle_event === 'maketranslationswidget'?
          `${root}/${config.widget}` :
          `${root}/${config.output}`
      })
  }

  if (config.outputs) {
    for (let key in config.outputs) {
      if(!config.outputs.hasOwnProperty(key)) continue;

      outputs.push({
          path: `${root}/${config.outputs[key]}`,
          language: key
        })
    }
  }

  const methodNames = config.methods || [DEFAULT_GETTEXT];

  const AST = parseECMA(source);
  const translations = extractTranslations(...methodNames)(AST);
  const fileName = makeRelativePath(this.request);

  if (!translations.length){
    return source;
  }

  for (let i = 0; i < outputs.length; i++) {
    let current;
    if (fs.existsSync(outputs[i].path)) {
      const buffer = fs.readFileSync(outputs[i].path);
      current = gettextParser.po.parse(buffer, 'utf-8');
    } else {
      current = {
        charset: 'utf-8',
        translations: {'': {}}
      };
    }
    const newStrings = (node) => !current.translations[''][node.text];
    const found = translations.filter(newStrings);

    if (found.length) {
      if (!config.silent) {
        console.log(
          `${found.length} new translations found in ${getFilename(this.resourcePath)}`
        );
      }
    }

    current.headers = config.header;
    let trans = current.translations[''];

    translations.forEach((translation) => {
      const msgid = translation.text;
      const reference = `${fileName}:${translation.loc.line}`;

      if (msgid && trans[msgid]) {
        trans[msgid].comments.reference += '\n' + reference;
      } else {
        trans[msgid] = {
          msgid,
          msgstr: (translation.pluralForm ? ['', ''] : ['']),
          comments: {
            reference: reference
          }
        };
        if (translation.pluralForm) {
          trans[msgid].msgid_plural = translation.pluralForm;
        }
      }
    });

    let outputBuf = gettextParser.po.compile(current);
    require('fs').writeFileSync(outputs[i].path, outputBuf);
  }

  return source;
}
