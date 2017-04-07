import {filterTreeForMethodsAndFunctionsNamed} from 'estree-utils';

const extractTranslations = (...args) => (ast) => {

  const gettextFunctions = filterTreeForMethodsAndFunctionsNamed(...args)(ast);

  if (!gettextFunctions.length){
    return [];
  }

  return gettextFunctions.map(
      (node) => {
        let strings = node.arguments.slice(0, 2).map((x) => x.value);
        let location = node.loc.start;
        return {
          text: strings[0],
          pluralForm: strings[1],
          loc: {
            line: location.line,
            column: location.column
          }
        }
      }
  );
}

export default extractTranslations;
