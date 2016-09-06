'use strict';

var ArrayList = require('dw/util/ArrayList');

/**
 * Map method for dw.util.Collection subclass instance
 * @param {dw.util.Collection} collection - Collection subclass instance to map over
 * @param {Function} callback - Callback function for each item
 * @returns {Array} Array of results of map
 */
function map(collection, callback) {
    var iterator = collection.iterator();
    var index = 0;
    var item = null;
    var result = [];
    while (iterator.hasNext()) {
        item = iterator.next();
        result.push(callback(item, index, collection));
        index++;
    }
    return result;
}

/**
 * forEach method for dw.util.Collection subclass instances
 * @param {dw.util.Collection} collection - Collection subclass instance to map over
 * @param {Function} callback - Callback function for each item
 * @returns {void}
 */
function forEach(collection, callback) {
    var iterator = collection.iterator();
    var index = 0;
    var item = null;
    while (iterator.hasNext()) {
        item = iterator.next();
        callback(item, index, collection);
        index++;
    }
}

/**
 * concat method for dw.util.Collection subclass instances
 * @param  {...dw.util.Collection} arguments - first collection to concatinate
 * @return {dw.util.ArrayList} ArrayList containing all passed collections
 */
function concat() {
    var result = new ArrayList();
    for (var i = 0, l = arguments.length; i < l; i++) {
        result.addAll(arguments[i]);
    }
    return result;
}

/**
 * reduce method for dw.util.Collection subclass instances
 * @param {dw.util.Collection} collection - Collection subclass instance to reduce
 * @param {Function} callback - Function to execute on each value in the array
 * @return {Object} result of the execution of callback function on all items
 */
function reduce(collection, callback) {
    if (typeof callback !== 'function') {
        throw new TypeError(callback + ' is not a function');
    }

    var value;
    var index = 1;
    var iterator = collection.iterator();

    if (arguments.length === 3) {
        value = arguments[2];
        index = 0;
    } else if (iterator.hasNext() && (collection.getLength() !== 1 && !value)) {
        value = iterator.next();
    }

    if (collection.getLength() === 0 && !value) {
        throw new TypeError('Reduce of empty array with no initial value');
    }

    if ((collection.getLength() === 1 && !value) || (collection.getLength() === 0 && value)) {
        return collection.getLength() === 1 ? iterator.next() : value;
    }

    while (iterator.hasNext()) {
        var item = iterator.next();
        value = callback(value, item, index, collection);
        index++;
    }

    return value;
}

/**
 * Pluck method for dw.util.Collection subclass instance
 * @param {dw.util.Collection} collection - Collection subclass instance to pluck from
 * @param {String} property - Object property to pluck
 * @returns {Array} Array of results of plucked properties
 */
function pluck(collection, property) {
    var result = [];
    var iterator = collection.iterator();
    while (iterator.hasNext()) {
        var temp = iterator.next();
        result.push(temp[property]);
    }
    return result;
}

module.exports = {
    map: map,
    forEach: forEach,
    concat: concat,
    reduce: reduce,
    pluck: pluck
};
