# S3FS
[![npm](https://img.shields.io/npm/v/s3fs.svg)](https://www.npmjs.com/package/s3fs)
[![npm](https://img.shields.io/npm/dm/s3fs.svg)](https://www.npmjs.com/package/s3fs)
[![Build Status](https://travis-ci.org/RiptideElements/s3fs.svg?branch=master)](https://travis-ci.org/RiptideElements/s3fs)
[![Coverage Status](https://img.shields.io/coveralls/RiptideElements/s3fs.svg)](https://coveralls.io/r/RiptideElements/s3fs)
[![Codacy](https://img.shields.io/codacy/13e0385fd6fc4929a2d1a974c7d0d67f.svg)](https://www.codacy.com/public/davidtpate/s3fs)
[![Code Climate](https://codeclimate.com/github/RiptideElements/s3fs/badges/gpa.svg)](https://codeclimate.com/github/RiptideElements/s3fs)
[![David](https://img.shields.io/david/RiptideElements/s3fs.svg)](https://david-dm.org/RiptideElements/s3fs)
[![David](https://img.shields.io/david/dev/RiptideElements/s3fs.svg)](https://david-dm.org/RiptideElements/s3fs)
[![David](https://img.shields.io/david/peer/RiptideElements/s3fs.svg)](https://david-dm.org/RiptideElements/s3fs)

Implementation of Node.JS [FS interface](http://nodejs.org/api/fs.html) using [Amazon Simple Storage Service (S3)](http://aws.amazon.com/s3/) for storage.

**Lead Maintainer**: [David Pate](https://github.com/DavidTPate)

## Purpose
S3FS provides a drop-in replacement for the File System (FS) implementation that is available with Node.JS allowing a distributed file-system to be used
by Node.JS applications through the well-known [FS interface](http://nodejs.org/api/fs.html) used by Node.JS.

## Minimum IAM Policy
Below is a policy for AWS [Identity and Access Management](http://aws.amazon.com/iam/) which provides the minimum privileges needed to use S3FS.

```json
{
  "Statement": [
    {
      "Action": [
        "s3:ListBucket"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:s3:::your-bucket"
      ]
    },
    {
      "Action": [
        "s3:AbortMultipartUpload",
        "s3:CreateBucket",
        "s3:DeleteBucket",
        "s3:DeleteBucketPolicy",
        "s3:DeleteObject",
        "s3:GetBucketPolicy",
        "s3:GetLifecycleConfiguration",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:ListBucketMultipartUploads",
        "s3:ListMultipartUploadParts",
        "s3:PutBucketPolicy",
        "s3:PutLifecycleConfiguration",
        "s3:PutObject"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:s3:::your-bucket/*"
      ]
    }
  ]
}
```

## Currently Supported Methods
The methods below from Node.JS's [FS interface](http://nodejs.org/api/fs.html) are the only currently supported methods
matching the signature and functionality of the `fs` module. All of the methods support either usage through callbacks
or promises. There isn't any support for synchronous actions currently as there isn't a need.

* [fs.createReadStream(path, [options])](http://nodejs.org/api/fs.html#fs_fs_createreadstream_path_options)
* [fs.createWriteStream(path, [options])](http://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options)
* [fs.exists(path, callback)](http://nodejs.org/api/fs.html#fs_fs_exists_path_callback)
* [fs.stat(path, callback)](http://nodejs.org/api/fs.html#fs_fs_stat_path_callback)
* [fs.lstat(path, callback)](http://nodejs.org/api/fs.html#fs_fs_lstat_path_callback)
* [fs.mkdir(path, [mode], callback)](http://nodejs.org/api/fs.html#fs_fs_mkdir_path_mode_callback)
* [fs.readdir(path, callback)](http://nodejs.org/api/fs.html#fs_fs_readdir_path_callback)
* [fs.readFile(filename, [options], callback)](http://nodejs.org/api/fs.html#fs_fs_readfile_filename_options_callback)
* [fs.rmdir(path, callback)](http://nodejs.org/api/fs.html#fs_fs_rmdir_path_callback)
* [fs.unlink(path, callback)](http://nodejs.org/api/fs.html#fs_fs_unlink_path_callback)
* [fs.writeFile(filename, data, [options], callback)](http://nodejs.org/api/fs.html#fs_fs_writefile_filename_data_options_callback)

### Constructor Details
Creating an instance of `S3fs` takes in the `bucketPath` and `options` which are passed on to the [S3 constructor](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property).

```js
var bucketPath = 'mySuperCoolBucket';
var s3Options = {
  region: 'us-east-1',
  
};
var fsImpl = new S3FS(bucketPath, s3Options);
```

### Example Callback Usage
```js
var S3FS = require('s3fs');
var fsImpl = new S3FS('test-bucket', options);
fsImpl.writeFile('message.txt', 'Hello Node', function (err) {
  if (err) throw err;
  console.log('It\'s saved!');
});
```

### Example Promise Usage
```js
var S3FS = require('s3fs');
var fsImpl = new S3FS('test-bucket', options);
fsImpl.writeFile('message.txt', 'Hello Node').then(function() {
  console.log('It\'s saved!');
}, function(reason) {
  throw reason;
});
```

## Custom Supported Methods
Besides the methods from Node.JS's [FS interface](http://nodejs.org/api/fs.html) we also support some custom expansions
to the interface providing various methods such as recursive methods and S3 specific methods. They are described below.

### s3fs.getPath(path)
Provides a location by concatenating the bucket with path(s).

* path `String`. _Optional_. The relative path to the working directory or file

```js
 // Create an instance of S3FS which has a current working directory of `test-folder` within the S3 bucket `test-bucket`
 var fsImpl = new S3FS('test-bucket/test-folder', options);
 
 // Returns location to directory `test-bucket/test-folder/styles
 var fsImplStyles = fsImpl.getPath('styles');
 // Returns location to file `test-bucket/test-folder/styles/main.css
 var fsImplStyles = fsImpl.getPath('styles/main.css');
 // Returns location to file `test-bucket/test-folder
 var fsImplStyles = fsImpl.getPath();
```

### s3fs.clone(path)
Provides a clone of the instance of S3FS which has relative access to the specified directory.

* path `String`. _Optional_. The relative path to extend the current working directory

```js
// Create an instance of S3FS which has a current working directory of `test-folder` within the S3 bucket `test-bucket`
var fsImpl = new S3FS('test-bucket/test-folder', options);
// Creates a copy (which uses the same instance of S3FS) which has a current working directory of `test-folder/styles`
var fsImplStyles = fsImpl.clone('styles');
```

### s3fs.copyFile(sourcePath, destinationPath[, options, callback])
Allows a file to be copied from one path to another path within the same bucket. Paths are relative to
the bucket originally provided.

* sourceFile `String`. **Required**. Relative path to the source file
* destinationFile `String`. **Required**. Relative path to the destination file
* options `Object`. _Optional_. The options to be used when copying the file. See [AWS SDK](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#copyObject-property)
* callback `Function`. _Optional_. Callback to be used, if not provided will return a Promise

```js
var fsImpl = new S3FS('test-bucket', options);
fsImpl.copyFile('test-folder/test-file.txt', 'other-folder/test-file.txt').then(function(data) {
  // File was successfully copied
  // Data contains details such as the `ETag` about the object. See [AWS SDK](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#copyObject-property) for details.
}, function(reason) {
  // Something went wrong
});
```

### s3fs.copyDir(sourcePath, destinationPath[, callback])
Recursively copies a directory from the source path to the destination path.

* sourcePath `String`. **Required**. The source directory to be copied
* destinationPath `String`. **Required**. The destination directory to be copied to
* callback `Function`. _Optional_. Callback to be used, if not provided will return a Promise

```js
var fsImpl = new S3FS('test-bucket', options);
fsImpl.copyDir('test-folder', 'other-folder').then(function() {
  // Directory was successfully copied
}, function(reason) {
  // Something went wrong
});
```

### s3fs.create(options[, callback])
Creates a new bucket on S3.

* options `Object`. _Optional_. The options to be used when creating the bucket. See [AWS SDK](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#createBucket-property)
* callback `Function`. _Optional_. Callback to be used, if not provided will return a Promise

```js
var fsImpl = new S3FS('test-bucket', options);
fsImpl.create().then(function() {
  // Bucket was successfully created
}, function(reason) {
  // Something went wrong
});
```

### s3fs.delete([callback])
Deletes a bucket on S3, can only be deleted when empty. If you need to delete one that isn't empty use
[`destroy([callback])`](#s3fsdestroycallback) instead.

* callback `Function`. _Optional_. Callback to be used, if not provided will return a Promise

```js
var fsImpl = new S3FS('test-bucket', options);
fsImpl.delete().then(function() {
  // Bucket was successfully deleted
}, function(reason) {
  // Something went wrong
});
```

### s3fs.destroy([callback])
Recursively deletes all files within the bucket and then deletes the bucket.

* callback `Function`. _Optional_. Callback to be used, if not provided will return a Promise

```js
var fsImpl = new S3FS('test-bucket', options);
fsImpl.destroy().then(function() {
  // Bucket was successfully destroyed
}, function(reason) {
  // Something went wrong
});
```

### s3fs.headObject(path[, callback])
Retrieves the details about an object, but not the contents.

* path `String`. **Required**. Path to the object to retrieve the head for
* callback `Function`. _Optional_. Callback to be used, if not provided will return a Promise

```js
var fsImpl = new S3FS('test-bucket', options);
fsImpl.headObject('test-file.txt').then(function(details) {
  // Details contains details such as the `ETag` about the object. See [AWS SDK](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#headObject-property) for details.
}, function(reason) {
  // Something went wrong
});
```

### s3fs.listContents(path, marker[, callback])
Retrieves a list of all objects within the specific path. The result is similar to that of [`headObject(path[, callback])`](#s3fsheadobjectpath-callback)
expect that it contains an array of objects.

* path `String`. **Required**. The path to list all of the objects for
* marker `String`. **Required**. The key to start with when listing objects
* callback `Function`. _Optional_. Callback to be used, if not provided will return a Promise

```js
var fsImpl = new S3FS('test-bucket', options);
fsImpl.listContents('/', '/').then(function(data) {
  // Data.Contents contains details such as the `ETag` about the object. See [AWS SDK](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#headObject-property) for details.
}, function(reason) {
  // Something went wrong
});
```

### s3fs.putBucketLifecycle(name, prefix, days[, callback])
Adds/Updates a lifecycle on a bucket.

* name `String`. **Required**. The name of the lifecycle. The value cannot be longer than 255 characters.
* prefix `String`. **Required**. Prefix identifying one or more objects to which the rule applies.
* days Indicates the lifetime, in days, of the objects that are subject to the rule. The value must be a non-zero positive integer.
* callback `Function`. _Optional_. Callback to be used, if not provided will return a Promise

```js
var fsImpl = new S3FS('test-bucket', options);
// Remove the Cached contents in the `/cache` directory each day.
fsImpl.putBucketLifecycle('expire cache', 'cache', 1).then(function() {
  // Bucket Lifecycle was successfully added/updated
}, function(reason) {
  // Something went wrong
});
```

### s3fs.readdirp(path[, callback])
Recursively reads a directory.

* path `String`. **Required**. The path to the directory to read from

```js
var fsImpl = new S3FS('test-bucket', options);
fsImpl.readdirp('test-folder').then(function(files) {
  // Files contains a list of all of the files similar to [`fs.readdir(path, callback)`](http://nodejs.org/api/fs.html#fs_fs_readdir_path_callback) but with recursive contents
}, function(reason) {
  // Something went wrong
});
```

### s3fs.mkdirp(path[, callback])
Recursively creates a directory.

* path The path to the directory to create
* callback `Function`. _Optional_. Callback to be used, if not provided will return a Promise

```js
var fsImpl = new S3FS('test-bucket', options);
fsImpl.mkdirp('test-folder').then(function() {
  // Directory has been recursively created
}, function(reason) {
  // Something went wrong
});
```

### s3fs.rmdirp(path[, callback])
Recursively deletes a directory.

* path The path to the directory to delete
* callback `Function`. _Optional_. Callback to be used, if not provided will return a Promise

```js
var fsImpl = new S3FS('test-bucket', options);
fsImpl.rmdirp('test-folder').then(function() {
  // Directory has been recursively deleted
}, function(reason) {
  // Something went wrong
});
```

## Testing
This repository uses [Mocha](http://mochajs.org/) as its test runner. Tests can be run by executing the following command:

```bash
npm test
```

This will run all tests and report on their success/failure in the console, additionally it will include our [Code Coverage](#code-coverage).

## Code Coverage
This repository uses [Istanbul](http://gotwarlost.github.io/istanbul/) as its code coverage tool. Code Coverage will be calculated when executing the following command:

```bash
npm test
```

This will report the Code Coverage to the console similar to the following:

```bash
=============================== Coverage summary ===============================
Statements   : 78.07% ( 356/456 )
Branches     : 50.23% ( 107/213 )
Functions    : 74.77% ( 83/111 )
Lines        : 78.07% ( 356/456 )
================================================================================
```

Additionally, an interactive HTML report will be generated in `./coverage/lcov-report/index.html` which allows browsing the coverage by file.


## License
[MIT](LICENSE)

## Copyright
> Copyright (c) 2015 Riptide Software Inc.
