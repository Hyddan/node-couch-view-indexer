# node-couch-view-indexer

> CouchDb view indexer for Node.Js using [node-couch](https://npmjs.com/package/node-couch)

## Installation
```shell
npm install node-couch-view-indexer --save
```

## NPM package
* https://npmjs.com/package/node-couch-view-indexer

## Usage
```js
var indexer = require('node-couch-view-indexer'),
        options = {
            logExceptions: false,
            nodeCouch: { // node-couch options
               credentials: {
                   userName: 'user',
                   password: 'pass'
               },
               database: 'database',
               url: {
                   hostName: 'localhost',
                   port: 5984
               }
           }
        };

indexer.index(options);
```

## Api
### Methods
#### .index(options)
Indexes CouchDb database views.

### Options
#### .logExceptions
`Boolean`. `Optional`. Whether or not to log exception data. Defaults to `false`.

#### .nodeCouch
`Object`. `Required`. See [node-couch](https://npmjs.com/package/node-couch) initialization data.

##### .nodeCouch.database
`String`. `Optional`. If specified, only views of this database will be indexed. Otherwise all views of all databases will be indexed.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality.

## Release History

 * 2017-10-12   v1.0.1   Disabled exception logging by default.
 * 2017-10-12   v1.0.0   Initial version.