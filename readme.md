# What is Force Sync?

Force Sync allows simple flow control over functions with callbacks. Simply calls an asynchronous function with a list of inputs synchronously, one at a time.

# Installation

```
npm install force-sync --save
```

# Arguments

Force Sync has the following signatures:
- fsync(input, task, cb)
- fsync(input, options, task, cb)
- fsync(input, options, task)

## Input

The first argument must be an array of inputs to pass into the task function in order. Keep in mind that you shouldn't include the callback in the input (as you would normally do when calling an asynchronous function with callback).

## Options

Options is an optional object with the following properties:
- `promise`: If `true`, Force Sync will return a promise instead of using the callback, which will be fulfilled when all the results are gathered from the task.
- `middleware`: A middleware function which will be called on each cycle of the task. This function has the arguments `input` and `result`, which are the input passed into the task and the result of the task on each cycle.

## Task

The task is the asynchronous function that will be called as many times as the number of inputs. On each cycle, an input will be sent to the task (FIFO) and the result will be gathered. Once all the inputs have been processed and assigned a result, Force Sync will return with all the results as an array.

## Callback/Promise

The callback would be used as default (if `options.promise` is not `true`) when all the operations are done in the order of the inputs. It will be called with an array holding all the results:

```javascript
fsync(['input1', 'input2'], myTask, results => {

  results.forEach(result => {

    console.log(result);

  });

});
```

However, if `options.promise` is `true`, the result would be a promise ([Kriskowal's Q](https://github.com/kriskowal/q)):

```javascript
fsync(['input1'. 'input2'], { promise: true }, myTask)

.then(results => {

  results.forEach(result => {

    console.log(result);

  });

});
```

# Usage Example

```javascript
const fsync = require('force-sync');
const request = require('request');

let input = [

  'http://google.com',
  'http://yahoo.com',
  {
    uri: 'http://localhost:4500',
    headers: {
      'Content': 'text/html',
      'Connection': 'keep-alive'
    }
  },
  'https://facebook.com'

];

let options = {

  promise: false,

  middleware: function(input, result) {

    console.log(`${input} => ${result}`);

  }

};

fsync(input, options, request, results => {

  results.forEach(result => {

    // result[0]: error
    // result[1]: response
    // result[2]: body

    if ( result[0] ) console.log('An error has occurred!');
    else console.log(result[2]);

  });

});
```
