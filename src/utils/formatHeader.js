import {reduce, keys, values, concat} from 'ramda';

export default function formatHeader(header, language){

  const headerKeys = keys(header)
  const headerValues = values(header)

  return reduce((accum, key) => {
    if (key === 'Language' && language) {
      headerValues[headerKeys.indexOf(key)] = language
    }
    return accum + `"${key} : ${headerValues[headerKeys.indexOf(key)]}\\n"\n`
  }, '')(headerKeys)

}
