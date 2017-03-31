const DEFAULT_GETTEXT = '__'

import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import loaderUtils from 'loader-utils';
import po2json from 'po2json';
import {compose, prop, filter} from 'ramda';

import {
  extractTranslations,
  formatHeader,
  parseECMA,
  addFilePath,
  formatWithRequest,
  getFilename,
  getFolderPath
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
  if (!translations.length){
    return source;
  }

  const formatTranslations = formatWithRequest(this.request);

  for (let i = 0; i < outputs.length; i++) {
    try {
      const buffer = fs.readFileSync(outputs[i].path);
      const current = po2json.parse(buffer);
      const newStrings = (node) => !current[prop('text')(node)];
      const found = filter(newStrings)(translations);

      if (found.length) {

        console.log(
          `${found.length} new translations found in ${getFilename(this.resourcePath)}`
        );

        outputs[i].source = formatTranslations(found);
        fs.appendFileSync(outputs[i].path, outputs[i].source);
      }

    } catch (error) {
      const header_prefix = config.header_prefix || '';
      const header = formatHeader(config.header, outputs[i].language);
      const body = formatTranslations(translations);
      outputs[i].source = `${header_prefix}\n${header}\n${body}`;

      mkdirp.sync(getFolderPath(outputs[i].path));
      fs.writeFileSync(outputs[i].path, outputs[i].source);
    }
  }

  return source;
}
