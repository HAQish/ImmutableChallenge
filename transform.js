const Immutable = require('immutable');

function transformErrors(errorsObj, ...nested) {
  return errorsObj.map((value, key) => {
    if (nested.includes(key)) return deeplyStringifyLists(value);
    if (Immutable.Map.isMap(value)) return uniquiStringify(extractStrsFromMap(value));
    if (Immutable.List.isList(value)) return uniquiStringify(extractStrsFromList(value));
    throw 'Unrecognized type ' + value.constructor.name;
  });
}

function extractStrsFromList(list) { //el in mapping is either a map or a str, if str, leave alone, if map, turn into list of str, flatten at VERY end
  return list.map(el => { //recurse if value is list
    if (Immutable.Map.isMap(el)) { //send to other recursive call
      return extractStrsFromMap(el);
    } else { //el is a string
      return el;
    }
  }).flatten();
}

function extractStrsFromMap(map) {
  return map.map((value, key) => {
    if (Immutable.Map.isMap(value)) { //if value is map, recurse
      return extractStrsFromMap(value);
    } else { //value is list
      return extractStrsFromList(value);
    }
  }).valueSeq()
    .toList()
    .flatten();
}

function uniquiStringify(list) {
  return list.toSet()
    .toList()
    .map(s => s + ".")
    .join(" ");
}

function deeplyStringifyLists(map) {
  return map.map((value, key) => {
    if (Immutable.Map.isMap(value)) {
      //if el is a map, return deeply stringified version of this map, not flattened
      return deeplyStringifyLists(value);
    } else {
      //if el is a list
      if (value.every(Immutable.Map.isMap)) return value.map(deeplyStringifyLists);
      return uniquiStringify(value.flatten());
    }
  });
}

module.exports = transformErrors;