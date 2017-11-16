// Signature: fsync(input: Array, [options: Object], task: Function, [cb: Function]): Promise/void

// If options.promise is true, the return value would be a promise, otherwise, the forth argument
// (or third if no options) would be set as the callback (default)

module.exports = function(...args) {

  const q = require('q');
  let options, task, input, cb;
  let deferred = q.defer();
  let results = [];
  let lastInput;

  if ( args.length < 3 ) throw new Error('At least three arguments are needed!');

  input = args[0];

  // If the second argument is a function, then the signature is (input, task, cb)
  if ( typeof args[1] === 'function' ) {

    options = {
      promise: false
    };
    task = args[1];
    cb = args[2];

  }
  else {

    options = args[1];

    // If second argument is not a function and the length is 3, then the signature is (input, options, task)
    if ( args.length === 3 ) {

      task = args[2];

    }
    else {

      // The signature is (input, options, task, cb)
      task = args[2];
      cb = args[3];

    }

  }

  // Validation
  if ( typeof task !== 'function' ) throw new Error('Task must be a function!');
  if ( typeof input !== 'object' || ! input || input.constructor !== Array ) throw new Error('Input must be an array!');
  if ( typeof options !== 'object' || ! options || options.constructor !== Object ) throw new Error('Options must be an object!');
  if ( typeof cb !== 'function' && ! options.promise ) throw new Error('Callback must be a funtion!');
  if ( options.middleware && typeof options.middleware !== 'function' ) throw new Error('Middleware must be a funciton!');

  // Looper callback
  let looper = function(...result) {

    // Push the result of the previous call to results
    if ( result[0] !== '%FIRST_CYCLE%' ) {

      results.push(result);

      // Run the middleware if it's defined
      if ( options.middleware ) options.middleware(lastInput, result);

    }

    // If input is empty, end the cycle
    if ( ! input.length ) {

      if ( options.promise ) deferred.resolve(results);
      else cb(results);

      return;

    }

    // Call the task with the next input
    let currentInput = input.shift();
    lastInput = currentInput;

    // If current input is not an array, wrap it with one
    if ( typeof currentInput !== 'object' || ! currentInput || currentInput.constructor !== Array ) {

      currentInput = [currentInput];

    }

    // Call task
    task(...currentInput, looper);

  };

  // Start the cycle
  looper('%FIRST_CYCLE%');

  // Return a promise if indicated by user
  if ( options.promise ) return deferred.promise;

};
