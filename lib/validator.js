var validator = require('validator');

// Here add all the extends that we want
// Remember that all inputs are transformed to strings!!
validator.extend('isPassword', function (str) {
  return validator.isAlphanumeric(str) && validator.isLength(str, 6);
});

validator.extend('isAny', function (str) {
  return true;
});

validator.extend('isFile', function (str) {
  // Tests that its a formidable file type
  // Using a fork of the original formidable
  return /File:(.*), Path:/.test(str);
});

/**
 * This function returns a validator function that returns true in case of a valid validation or undefined
 * @param {Function} validatorFn
 * @returns {Function}
 */
validator.optional = function (validatorFn) {
  if(typeof validatorFn != 'function'){
    console.log('Validator optional called with a non function');
    // fallback to a function that always fails
    return function(){return false};
  }
  return function (str) {
    if(str === undefined) return true;
    return validatorFn(str);
  };
};

module.exports = validator;