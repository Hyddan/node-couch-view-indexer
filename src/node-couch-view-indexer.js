module.exports = {
    index: function (options) {
        var _fs = require('fs'),
                _nodeCouch = require('node-couch'),
                _options = Object.assign({
                    logExceptions: false
                }, options),
                _couchDb = new _nodeCouch.Client().initialize(_options.nodeCouch),
                _indexDatabaseViews = function (database, callback) {
                    _couchDb.Database.select(database)
                        .parent()
                        .configuration({
                            timeout: 30000
                        })
                        .View.query({
                            query: 'startkey="_design/"&endkey="_design0"&include_docs=true',
                            view: '_all_docs'
                        }, function (error, response) {
                            if (error) {
                                console.log(Color.red('Failed to get design documents for database: ' + database));
                                _options.logExceptions && console.log(error);

                                return;
                            }

                            var _designDocuments = new _nodeCouch.Mappers.Response.View().map(response),
                                    _queries = [];
                            for (var dd in _designDocuments) {
                                if (!_designDocuments.hasOwnProperty(dd) || !_designDocuments[dd].hasOwnProperty('views')) continue;

                                for (var v in _designDocuments[dd].views) {
                                    if (!_designDocuments[dd].views.hasOwnProperty(v)) continue;

                                    _queries.push({
                                        designDocumentId: _designDocuments[dd]._id,
                                        query: 'include_docs=true',
                                        view: v
                                    });

                                    break;
                                }
                            }

                            if (0 === _queries.length) {
                                callback && callback();

                                return;
                            }

                            var _queryCount = _queries.length;
                            _queries.forEach(function (query) {
                                (function (q) { // Re-scope query object
                                    _couchDb.configuration({
                                            timeout: 1000
                                        })
                                        .View.query(q, function (queryError) {
                                            if (queryError && -1 === (queryError.message || '').indexOf('timed out')) {
                                                console.log(Color.red('Failed to query view: ' + q.view + ' in design document: ' + q.designDocumentId + ' in database: ' + database));
                                                _options.logExceptions && console.log(queryError);
                                            }
                                            else {
                                                console.log(Color.green('Queried view: ' + q.view + ' in design document: ' + q.designDocumentId + ' in database: ' + database));
                                            }

                                            0 === --_queryCount && callback && callback();
                                        });
                                })(query);
                            });
                        });
                },
                Color = {
                    green: function (text) {
                        return '\033[92m' + text + '\x1b[0m';
                    },
                    red: function (text) {
                        return '\033[91m' + text + '\x1b[0m';
                    }
                };

        if (_options.nodeCouch.database) {
            // Index views of specific database
            _indexDatabaseViews(_options.nodeCouch.database, function () {
                console.log(Color.green('Finished triggering indexing of all views in database: ' + _options.nodeCouch.database));
            });

            return;
        }

        // Index views of all databases
        _couchDb.Server.databases(function (error, response) {
            if (error) {
                console.log(Color.red('Failed to get all databases'));
                _options.logExceptions && console.log(error);

                return;
            }

            var _databaseCount = response.length;
            response.forEach(function (database) {
                (function (db) { // Re-scope database object
                    _indexDatabaseViews(db, function () {
                        console.log(Color.green('Finished triggering indexing of all views in database: ' + db));
                        console.log();
                        console.log();

                        if (0 === --_databaseCount) {
                            console.log();
                            console.log(Color.green('Finished triggering indexing of all views of all databases'));
                        }
                    });
                })(database);
            });
        });
    }
};