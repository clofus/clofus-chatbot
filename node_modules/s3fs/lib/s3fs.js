'use strict';
/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2014-2016 Riptide Software Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
(function (module, fsInterface, util, Promise, AWS, s3Utils, extend, S3WriteStream, Stats) {
    var directoryRegExp = /\/$/,
        defaultCreateOptions = {};

    function S3fs(bucket, options) {
        if (!(this instanceof S3fs)) {
            return new S3fs(bucket, options);
        }

        if (!bucket) {
            throw new Error('bucket is required');
        }

        if (typeof bucket !== 'string') {
            throw new Error('bucket must be a string');
        }

        var bucketParts = s3Utils.decomposePath(bucket);
        this.s3 = options instanceof AWS.S3 ? options : new AWS.S3(options);
        this.bucket = bucketParts[0];
        this.path = bucketParts.slice(1).join('/');
        if (this.path) {
            this.path += '/';
        }
    }

    function whiteSpace(item) {
        return item;
    }

    util.inherits(S3fs, fsInterface);

    /*
     Begin FS Methods
     */

    S3fs.prototype.createReadStream = function (name, options) {
        return this.s3.getObject({
            Bucket: this.bucket,
            Key: s3Utils.toKey(s3Utils.joinPaths(this.path + s3Utils.toKey(name)))
        }).createReadStream(options);
    };

    S3fs.prototype.createWriteStream = function (name, options) {
        return new S3WriteStream(this.s3, this.bucket, s3Utils.toKey(s3Utils.joinPaths(this.path + s3Utils.toKey(name))), options);
    };

    S3fs.prototype.exists = function (name, callback) {
        var self = this;
        var promise = new Promise(function (resolve) {
            var key = s3Utils.toKey(s3Utils.joinPaths(self.path + s3Utils.toKey(name)));

            if (directoryRegExp.test(key)) {
                return resolve(true); //TODO: Can we query S3 for this to see if the directory actually exists?
            }
            self.s3.headObject(
                {
                    Bucket: self.bucket,
                    Key: key
                },
                function (err) {
                    if (err) {
                        return resolve(false);
                    }
                    resolve(true);
                });
        });

        if (!callback) {
            return promise;
        }

        promise.then(function (exists) {
            callback(exists);
        }, function () {
            // Swallow the error (if one is hit), since exists doesn't send callback with an error in the normal FS interface.
            callback(false);
        });
    };

    /**
     * [fs.mkdir(path[, mode], callback)](https://nodejs.org/api/fs.html#fs_fs_mkdir_path_mode_callback)
     *
     * Asynchronous mkdir(2). No arguments other than a possible exception are given to the completion callback.
     *
     * @param path Relative path to be created
     * @param callback Callback
     * @returns {Promise}
     */
    S3fs.prototype.mkdir = function mkdir(path, callback) {
        //TODO: Add support for Mode, which by some form of magic would translate to S3 permissions. Not sure how we would maintain the same FS interface and convert it to S3 for permissions.
        var promise = putObject(this.s3, this.bucket, s3Utils.toKey(s3Utils.joinPaths(this.path + s3Utils.toKey(path))) + '/');

        if (!callback) {
            return promise;
        }

        promise.then(function (data) {
            callback(null, data);
        }, function (reason) {
            callback(reason);
        });
    };

    /**
     * [fs.mkdirp(path[, mode], callback)](https://github.com/RiptideCloud/s3fs#s3fsmkdirppath-cb)
     *
     * Asynchronous recursive mkdir(2). No arguments other than a possible exception are given to the completion callback.
     *
     * @param path Relative path to be created
     * @param callback Callback
     * @returns {Promise}
     */
    S3fs.prototype.mkdirp = S3fs.prototype.mkdir;

    S3fs.prototype.stat = function (path, callback) {
        return getFileStats(this, path, callback);
    };

    S3fs.prototype.lstat = function (path, callback) {
        return getFileStats(this, path, callback);
    };

    S3fs.prototype.readdir = function (name, callback) {
        var prefix = s3Utils.toKey(s3Utils.joinPaths(this.path + s3Utils.toKey(name, this.bucket, this.path)));
        // Make sure directories have a trailing slash.
        if (prefix[prefix.length - 1] !== '/') {
            prefix += '/';
        }

        var promise = listAllObjectsFiles(this.s3, this.bucket, prefix, '/');
        if (!callback) {
            return promise;
        }

        promise.then(function (files) {
            callback(null, files);
        }, function (reason) {
            callback(reason);
        });
    };

    S3fs.prototype.readFile = function (name, options, callback) {
        var self = this;
        var encoding;
        var promise = new Promise(function(resolve) {
            if (typeof options === 'function') {
                callback = options;
                options = undefined;
            }

            options = options || {};

            // See: https://github.com/nodejs/node/blob/d6714ff1a48de5dcd9d3dfbb4b2e036efcd92b7c/lib/fs.js#L229-L235
            options = handleReadWriteFileOptions(options);

            encoding = options.encoding;
            if (options.encoding) {
                options = extend(true, {
                    ResponseContentEncoding: options.encoding
                }, options);
                delete options.encoding;
            }

            resolve(getObject(self.s3, self.bucket, s3Utils.toKey(s3Utils.joinPaths(self.path + s3Utils.toKey(name, self.bucket, self.path))), options));
        });

        if (!callback) {
            return promise;
        }

        promise.then(function (data) {
            // See: https://github.com/RiptideElements/s3fs/issues/37#issuecomment-135460856
            if (encoding) {
                return callback(null, data.Body.toString(encoding));
            }
            callback(null, data.Body); // Keep this in line with the FS interface and only return the contents.
        }, function (reason) {
            callback(reason);
        });
    };

    S3fs.prototype.rmdir = function (path, callback) {
        var promise = deleteObject(this.s3, this.bucket, s3Utils.toKey(s3Utils.joinPaths(this.path + s3Utils.toKey(path))) + '/');

        if (!callback) {
            return promise;
        }

        promise.then(function (data) {
            callback(null, data);
        }, function (reason) {
            callback(reason);
        });
    };

    S3fs.prototype.unlink = function (name, callback) {
        var promise = deleteObject(this.s3, this.bucket, s3Utils.toKey(s3Utils.joinPaths(this.path + s3Utils.toKey(name, this.bucket, this.path))));

        if (!callback) {
            return promise;
        }

        promise.then(function (data) {
            callback(null, data);
        }, function (reason) {
            callback(reason);
        });
    };

    S3fs.prototype.writeFile = function (name, data, options, callback) {
        var self = this;
        var promise = new Promise(function(resolve) {
            if (typeof options === 'function') {
                callback = options;
                options = undefined;
            }

            options = options || {};

            // See: https://github.com/nodejs/node/blob/d6714ff1a48de5dcd9d3dfbb4b2e036efcd92b7c/lib/fs.js#L1120-L1126
            options = handleReadWriteFileOptions(options);

            if (options.encoding) {
                options = extend(true, {
                    ContentEncoding: options.encoding
                }, options);
                delete options.encoding;
            }

            resolve(putObject(self.s3, self.bucket, s3Utils.toKey(s3Utils.joinPaths(self.path + s3Utils.toKey(name, self.bucket, self.path))), data, options));
        });

        if (!callback) {
            return promise;
        }

        promise.then(function (res) {
            callback(null, res);
        }, function (reason) {
            callback(reason);
        });
    };

    /*
     End FS Methods
     */

    /*
     Begin Custom Methods
     */

    /**
     * Provides a path by concatenating bucket with paths.
     *
     * @example
     * ```js
     * // Create an instance of S3FS which has a current working directory of `test-folder` within the S3 bucket `test-bucket`
     * var fsImpl = new S3FS(options, 'test-bucket/test-folder');
     *
     * // Returns location to directory `test-bucket/test-folder/styles
     * var fsImplStyles = fsImpl.getPath('styles');
     * // Returns location to file `test-bucket/test-folder/styles/main.css
     * var fsImplStyles = fsImpl.getPath('styles/main.css');
     * // Returns location to file `test-bucket/test-folder
     * var fsImplStyles = fsImpl.getPath();
     * ```
     *
     * @param path `String`. _Optional_. The path to to directory or file
     * @returns {String}
     */
    S3fs.prototype.getPath = function (path) {
        return s3Utils.joinPaths(this.bucket, s3Utils.joinPaths(this.path, path));
    };

    /**
     * Provides a clone of the instance of S3FS which has relative access to the specified directory.
     *
     * @example
     * ```js
     * // Create an instance of S3FS which has a current working directory of `test-folder` within the S3 bucket `test-bucket`
     * var fsImpl = new S3FS(options, 'test-bucket/test-folder');
     * // Creates a copy (which uses the same instance of S3FS) which has a current working directory of `test-folder/styles`
     * var fsImplStyles = fsImpl.clone('styles');
     * ```
     *
     * @param path `String`. _Optional_. The relative path to extend the current working directory
     * @returns {S3fs}
     */
    S3fs.prototype.clone = function (path) {
        return new S3fs(s3Utils.joinPaths(this.bucket, s3Utils.joinPaths(this.path, path)), this.s3);
    };

    /**
     * Allows a file to be copied from one path to another path within the same bucket. Paths are relative to
     * the bucket originally provided.
     *
     * @example
     * ```js
     * var fsImpl = new S3FS('test-bucket', options);
     * fsImpl.copyFile('test-folder/test-file.txt', 'other-folder/test-file.txt').then(function() {
     *   // Object was successfully copied
     * }, function(reason) {
     *   // Something went wrong
     * });
     * ```
     *
     * @param sourceFile `String`. **Required**. Relative path to the source file
     * @param destinationFile `String`. **Required**. Relative path to the destination file
     * @param options `Object`. _Optional_. The options to be used when copying the file. See [AWS SDK](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#copyObject-property)
     * @param callback `Function`. _Optional_. Callback to be used, if not provided will return a Promise
     * @returns {Promise|*} Returns a `Promise` if a callback is not provided
     */
    S3fs.prototype.copyFile = function (sourceFile, destinationFile, options, callback) {
        var self = this;
        var promise = new Promise(function (resolve, reject) {
            if (typeof options === 'function') {
                callback = options;
                options = undefined;
            }

            options = options || {};

            self.s3.copyObject(extend(true, options, {
                Bucket: self.bucket,
                Key: s3Utils.toKey(s3Utils.joinPaths(self.path + s3Utils.toKey(destinationFile))),
                CopySource: [self.bucket, s3Utils.toKey(s3Utils.joinPaths(self.path + s3Utils.toKey(sourceFile)))].join('/')
            }), function (err, data) {
                if (err) {
                    return reject(err);
                }
                return resolve(data);
            });
        });

        if (!callback) {
            return promise;
        }

        promise.then(function (data) {
            callback(null, data);
        }, function (reason) {
            callback(reason);
        });
    };

    /**
     * Creates a new bucket on S3.
     *
     * @example
     * ```js
     * var fsImpl = new S3FS('test-bucket', options);
     * fsImpl.create().then(function() {
     *   // Bucket was successfully created
     * }, function(reason) {
     *   // Something went wrong
     * });
     * ```
     *
     * @param options `Object`. _Optional_. The options to be used when creating the bucket. See [AWS SDK](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#createBucket-property)
     * @param callback `Function`. _Optional_. Callback to be used, if not provided will return a Promise
     * @returns {Promise|*} Returns a `Promise` if a callback is not provided
     */
    S3fs.prototype.create = function (options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = undefined;
        }

        var self = this;
        var params = extend(true, defaultCreateOptions, options, {Bucket: this.bucket});
        var promise = new Promise(function (resolve, reject) {
            self.s3.createBucket(params, function (err, data) {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });

        if (!callback) {
            return promise;
        }

        promise.then(function () {
            callback();
        }, function (reason) {
            callback(reason);
        });
    };

    /**
     * Deletes a bucket on S3, can only be deleted when empty. If you need to delete one that isn't empty use
     * `[destroy(cb)](#s3fs.destroy(cb))` instead.
     *
     * @example
     * ```js
     * var fsImpl = new S3FS('test-bucket', options);
     * fsImpl.delete().then(function() {
     *   // Bucket was successfully deleted
     * }, function(reason) {
     *   // Something went wrong
     * });
     * ```
     *
     * @param callback `Function`. _Optional_. Callback to be used, if not provided will return a Promise
     * @returns {Promise|*} Returns a `Promise` if a callback is not provided
     */
    S3fs.prototype.delete = function (callback) {
        var self = this;
        var promise = new Promise(function (resolve, reject) {
            self.s3.deleteBucket({Bucket: self.bucket}, function (err, data) {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });

        if (!callback) {
            return promise;
        }

        promise.then(function () {
            callback();
        }, function (reason) {
            callback(reason);
        });
    };

    /**
     * Retrieves the details about an object, but not the contents.
     *
     * @example
     * ```js
     * var fsImpl = new S3FS('test-bucket', options);
     * fsImpl.headObject('test-file.txt').then(function(details) {
     *   // Details contains details such as the `ETag` about the object. See [AWS SDK](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#headObject-property) for details.
     * }, function(reason) {
     *   // Something went wrong
     * });
     * ```
     *
     * @param path `String`. **Required**. Path to the object to retrieve the head for
     * @param callback `Function`. _Optional_. Callback to be used, if not provided will return a Promise
     * @returns {Promise|*} Returns a `Promise` if a callback is not provided
     */
    S3fs.prototype.headObject = function (path, callback) {
        //TODO: Convert the rest of the code to using this method for retrieving the head.
        var self = this;
        var promise = new Promise(function (resolve, reject) {
            self.s3.headObject({
                Bucket: self.bucket,
                Key: s3Utils.toKey(s3Utils.joinPaths(self.path + s3Utils.toKey(path)))
            }, function (err, data) {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });

        if (!callback) {
            return promise;
        }

        promise.then(function (data) {
            callback(null, data);
        }, function (reason) {
            callback(reason);
        });
    };

    /**
     * Retrieves a list of all objects within the specific path. The result is similar to that of [headObject(path, cb](#s3fs.headObject(path, cb))
     * expect that it contains an array of objects.
     *
     * @example
     * ```js
     * var fsImpl = new S3FS('test-bucket', options);
     * fsImpl.listContents('/', '/').then(function(data) {
     *   // Data.Contents contains details such as the `ETag` about the object. See [AWS SDK](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#headObject-property) for details.
     * }, function(reason) {
     *   // Something went wrong
     * });
     * ```
     *
     * @param path `String`. **Required**. The path to list all of the objects for
     * @param marker `String`. **Required**. The key to start with when listing objects
     * @param callback `Function`. _Optional_. Callback to be used, if not provided will return a Promise
     * @returns {Promise|*} Returns a `Promise` if a callback is not provided
     */
    S3fs.prototype.listContents = function (path, marker, callback) {
        if (typeof marker === 'function') {
            callback = marker;
            marker = undefined;
        }

        var promise = listAllObjects(this.s3, this.bucket, s3Utils.toKey(s3Utils.joinPaths(this.path + s3Utils.toKey(path))) + '/', '/', marker);

        if (!callback) {
            return promise;
        }

        promise.then(function (data) {
            callback(null, data);
        }, function (reason) {
            callback(reason);
        });
    };

    /*
     Begin Recursive Custom Methods
     */

    /**
     * Recursively copies a directory from the source path to the destination path.
     *
     * @example
     * ```js
     * var fsImpl = new S3FS('test-bucket', options);
     * fsImpl.copyDir('test-folder', 'other-folder').then(function() {
     *   // Directory was successfully copied
     * }, function(reason) {
     *   // Something went wrong
     * });
     * ```
     *
     * @param sourcePath `String`. **Required**. The source directory to be copied
     * @param destinationPath `String`. **Required**. The destination directory to be copied to
     * @param callback `Function`. _Optional_. Callback to be used, if not provided will return a Promise
     * @returns {Promise|*} Returns a `Promise` if a callback is not provided
     */
    S3fs.prototype.copyDir = function (sourcePath, destinationPath, callback) {
        var self = this;
        var promise = listAllObjectsFiles(this.s3, this.bucket, s3Utils.toKey(s3Utils.joinPaths(this.path + s3Utils.toKey(sourcePath))) + '/').then(function (files) {
            var promises = [];
            files.forEach(function (file) {
                promises.push(self.copyFile([s3Utils.toKey(sourcePath), file].join('/'), [s3Utils.toKey(destinationPath), file].join('/')));
            });
            return Promise.all(promises).return();
        });

        if (!callback) {
            return promise;
        }

        promise.then(function () {
            callback();
        }, function (reason) {
            callback(reason);
        });
    };

    /**
     * Recursively deletes all files within the bucket and then deletes the bucket.
     *
     * @example
     * ```js
     * var fsImpl = new S3FS('test-bucket', options);
     * fsImpl.destroy().then(function() {
     *   // Bucket was successfully destroyed
     * }, function(reason) {
     *   // Something went wrong
     * });
     * ```
     *
     * @param callback `Function`. _Optional_. Callback to be used, if not provided will return a Promise
     * @returns {Promise|*} Returns a `Promise` if a callback is not provided
     */
    S3fs.prototype.destroy = function (callback) {
        var self = this;
        var promise = self.rmdirp()
            .then(function () {
                return listAllObjectsFiles(self.s3, self.bucket).then(function (objects) {
                    return Promise.all(objects.filter(function (object) {
                        //filter items
                        return !directoryRegExp.test(object);
                    }).map(function (object) {
                        //remove all the objects
                        return deleteObject(self.s3, self.bucket, object);
                    }).concat(objects.filter(function (object) {
                        return directoryRegExp.test(object);
                    }).map(function (object) {
                        //remove all folders
                        return deleteObject(self.s3, self.bucket, object);
                    })));
                });
            })
            .then(function () {
                return self.delete();
            });

        if (!callback) {
            return promise;
        }

        promise.then(function () {
            callback();
        }, function (reason) {
            callback(reason);
        });
    };

    /**
     * Adds/Updates a lifecycle on a bucket.
     *
     * @example
     * ```js
     * var fsImpl = new S3FS('test-bucket', options);
     * // Remove the Cached contents in the `/cache` directory each day.
     * fsImpl.putBucketLifecycle('expire cache', 'cache', 1).then(function() {
     *   // Bucket Lifecycle was successfully added/updated
     * }, function(reason) {
     *   // Something went wrong
     * });
     * ```
     *
     * @param name `String`. **Required**. The name of the lifecycle. The value cannot be longer than 255 characters.
     * @param prefix `String`. **Required**. Prefix identifying one or more objects to which the rule applies.
     * @param days Indicates the lifetime, in days, of the objects that are subject to the rule. The value must be a non-zero positive integer.
     * @param callback `Function`. _Optional_. Callback to be used, if not provided will return a Promise
     * @returns {Promise|*} Returns a `Promise` if a callback is not provided
     */
    S3fs.prototype.putBucketLifecycle = function (name, prefix, days, callback) {
        var promise = putBucketLifecycle(this.s3, this.bucket, name, prefix, days);

        if (!callback) {
            return promise;
        }

        promise.then(function () {
            callback();
        }, function (reason) {
            callback(reason);
        });
    };

    /**
     * Recursively reads a directory.
     *
     * @example
     * ```js
     * var fsImpl = new S3FS('test-bucket', options);
     * fsImpl.readdirp('test-folder').then(function(files) {
     *   // Files contains a list of all of the files similar to [fs.readdir(path, callback)](http://nodejs.org/api/fs.html#fs_fs_readdir_path_callback) but with recursive contents
     * }, function(reason) {
     *   // Something went wrong
     * });
     * ```
     *
     * @param path `String`. **Required**. The path to the directory to read from
     * @param callback `Function`. _Optional_. Callback to be used, if not provided will return a Promise
     * @returns {Promise|*} Returns a `Promise` if a callback is not provided
     */
    S3fs.prototype.readdirp = function (path, callback) {
        var prefix = s3Utils.toKey(s3Utils.joinPaths(this.path + s3Utils.toKey(path, this.bucket, this.path)));
        if (prefix[prefix.length - 1] !== '/') {
            prefix += '/'; // Make sure we have a trailing slash for the directory
        }
        var promise = listAllObjectsFiles(this.s3, this.bucket, prefix);

        if (!callback) {
            return promise;
        }

        promise.then(function (data) {
            callback(null, data);
        }, function (reason) {
            callback(reason);
        });
    };

    /**
     * Recursively deletes a directory.
     *
     * @example
     * ```js
     * var fsImpl = new S3FS('test-bucket', options);
     * fsImpl.rmdirp('test-folder').then(function() {
     *   // Directory has been recursively deleted
     * }, function(reason) {
     *   // Something went wrong
     * });
     * ```
     *
     * @param path The path to the directory to delete
     * @param callback `Function`. _Optional_. Callback to be used, if not provided will return a Promise
     * @returns {Promise|*} Returns a `Promise` if a callback is not provided
     */
    S3fs.prototype.rmdirp = function (path, callback) {
        var self = this,
            promise = listAllObjectsFiles(this.s3, this.bucket, path ? s3Utils.toKey(s3Utils.joinPaths(this.path + s3Utils.toKey(path))) + '/' : undefined).then(function (objects) {
                return Promise.all(objects.filter(function (object) {
                    //filter items
                    return !directoryRegExp.test(object);
                }).map(function (object) {
                    //remove all the items
                    return self.unlink((path ? s3Utils.toKey(path) + '/' : '') + object);
                }).concat(objects.filter(function (object) {
                    return directoryRegExp.test(object);
                }).map(function (object) {
                    //remove all folders
                    return self.rmdir((path ? s3Utils.toKey(path) + '/' : '') + object);
                })));
            });

        if (!callback) {
            return promise;
        }

        promise.then(function () {
            callback();
        }, function (reason) {
            callback(reason);
        });
    };

    /*
     End Recursive Custom Methods
     */

    /*
     End Custom Methods
     */

    /*
     Begin Helper Methods
     */

    function getFileStats(s3fs, path, callback) {
        /* eslint-disable camelcase */
        var promise = new Promise(function (resolve, reject) {
            // S3 doesn't return information on directories and it automatically creates any that don't exist.
            // So we can return semi-static information about the stats of a directory.
            if (directoryRegExp.test(path)) {
                var date = new Date(),
                    stats = new Stats({
                        dev: 0,
                        ino: 0,
                        mode: 0,
                        nlink: 1,
                        uid: 0,
                        gid: 0,
                        rdev: 0,
                        size: 0,
                        /* jscs: disable requireCamelCaseOrUpperCaseIdentifiers */
                        /* jshint camelcase: false */
                        atim_msec: date,
                        mtim_msec: date,
                        ctim_msec: date,
                        /* jshint camelcase: true */
                        /* jscs: enable requireCamelCaseOrUpperCaseIdentifiers */
                        path: path
                    });
                return resolve(stats);
            }
            s3fs.s3.headObject({
                Bucket: s3fs.bucket,
                Key: s3Utils.toKey(s3Utils.joinPaths(s3fs.path + s3Utils.toKey(path, s3fs.bucket, s3fs.path)))
            }, function (err, data) {
                if (err) {
                    err.message = err.name;
                    return reject(err);
                }
                var statObj = new Stats({
                    dev: 0,
                    ino: 0,
                    mode: 0,
                    nlink: 0,
                    uid: 0,
                    gid: 0,
                    rdev: 0,
                    size: Number(data.ContentLength),
                    /* jscs: disable requireCamelCaseOrUpperCaseIdentifiers */
                    /* jshint camelcase: false */
                    atim_msec: data.LastModified,
                    mtim_msec: data.LastModified,
                    ctim_msec: data.LastModified,
                    /* jshint camelcase: true */
                    /* jscs: enable requireCamelCaseOrUpperCaseIdentifiers */
                    path: path
                });
                return resolve(statObj);
            });
        });
        /* eslint-enable camelcase */

        if (!callback) {
            return promise;
        }

        promise.then(function (stats) {
            callback(null, stats);
        }, function (reason) {
            callback(reason);
        });
    }

    function contentToKey(content) {
        return content.Key;
    }

    function contentPrefixesToPrefix(content) {
        return content.Prefix;
    }

    function listAllObjects(s3, bucket, prefix, delimiter, marker) {
        var objectPrefix = prefix === '/' ? undefined : prefix;
        return new Promise(function (resolve, reject) {
            s3.listObjects({
                Bucket: bucket,
                Delimiter: delimiter,
                Marker: marker,
                Prefix: objectPrefix
            }, function (err, data) {
                if (err) {
                    return reject(err);
                }
                var contentsList = data.Contents.map(function (item) {
                    if (objectPrefix && item && item.Key && item.Key.indexOf(objectPrefix) === 0) {
                        item.Key = item.Key.replace(objectPrefix, '');
                    }

                    return item;
                }).filter(function (item) {
                    return item && item.Key;
                });

                if (data.IsTruncated) {
                    return listAllObjects(s3, bucket, prefix, delimiter, data.NextMarker).then(function (contents) {
                        resolve(contentsList.concat(contents));
                    }, function (reason) {
                        reject(reason);
                    });
                }
                return resolve(contentsList);
            });
        });
    }

    function listAllObjectsFiles(s3, bucket, prefix, delimiter, marker) {
        var objectPrefix = prefix === '/' ? undefined : prefix;
        return new Promise(function (resolve, reject) {
            s3.listObjects({
                Bucket: bucket,
                Delimiter: delimiter,
                Marker: marker,
                Prefix: objectPrefix
            }, function (err, data) {
                if (err) {
                    return reject(err);
                }
                var fileList = data.Contents.map(contentToKey).concat(data.CommonPrefixes.map(contentPrefixesToPrefix)).map(function (item) {
                    if (objectPrefix && item.indexOf(objectPrefix) === 0) {
                        return item.replace(objectPrefix, '');
                    }

                    return item;
                });
                if (data.IsTruncated) {
                    return listAllObjectsFiles(s3, bucket, prefix, delimiter, data.NextMarker).then(function (files) {
                        resolve(fileList.concat(files));
                    }, function (reason) {
                        reject(reason);
                    });
                }
                resolve(fileList.filter(whiteSpace));
            });
        });
    }

    function getObject(s3, bucket, key, options) {
        var s3Options = extend(typeof options === 'object' ? options : {}, {
            Bucket: bucket,
            Key: key
        });
        return new Promise(function (resolve, reject) {
            s3.getObject(s3Options, function (err, data) {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });
    }

    function putObject(s3, bucket, key, body, options) {
        var s3Options = extend(typeof options === 'object' ? options : {}, {
            Bucket: bucket,
            Key: key,
            Body: body
        });
        return new Promise(function (resolve, reject) {
            s3.putObject(s3Options, function (err, data) {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });
    }

    function deleteObject(s3, bucket, key) {
        return new Promise(function (resolve, reject) {
            s3.deleteObject({
                Bucket: bucket,
                Key: key
            }, function (err, data) {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });
    }

    function putBucketLifecycle(s3, bucket, name, prefix, days) {
        var options = {
            Bucket: bucket,
            LifecycleConfiguration: {
                Rules: [
                    {
                        Prefix: prefix,
                        Status: 'Enabled',
                        Expiration: {
                            Days: days
                        },
                        ID: name
                    }
                ]
            }
        };
        return new Promise(function (resolve, reject) {
            s3.putBucketLifecycle(options, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    function handleReadWriteFileOptions(options) {
        if (typeof options === 'function' || !options) {
            options = { encoding: null };
        } else if (typeof options === 'string') {
            options = { encoding: options };
        } else if (!options) {
            options = { encoding: null };
        } else if (typeof options !== 'object') {
            throw new TypeError('Bad arguments');
        }

        return options;
    }

    /*
     End Helper Methods
     */

    module.exports = S3fs;

}(module, require('./fsInterface'), require('util'), require('bluebird'), require('aws-sdk'), require('./utils'), require('extend'), require('./s3WriteStream'),
    require('./Stats')));
