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
(function (module) {
    var splitDeviceRegExp = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;
    module.exports = {
        isAbsolute: function (path) {
            if (path[0] === '/') {
                return true;
            }
            if (path[1] === ':' && path[2] === '\\') {
                return true;
            }
            if (path.substring(0, 2) === '\\\\') {
                // Microsoft Azure absolute path
                return true;
            }
            return false;
        },
        normalizeArray: function (parts, allowAboveRoot) {
            // if the path tries to go above the root, `up` ends up > 0
            var up = 0,
                i,
                last;
            for (i = parts.length - 1; i >= 0; i--) {
                last = parts[i];
                if (last === '.') {
                    parts.splice(i, 1);
                } else if (last === '..') {
                    parts.splice(i, 1);
                    up++;
                } else if (up) {
                    parts.splice(i, 1);
                    up--;
                }
            }

            // if the path is allowed to go above the root, restore leading ..s
            if (allowAboveRoot) {
                for (; up--; up) {
                    parts.unshift('..');
                }
            }

            return parts;
        },
        normalizePath: function (path) {
            var tailIndex = 3;
            var result = splitDeviceRegExp.exec(path),
                device = result[1] || '',
                isAbsolute = this.isAbsolute(path),
                tail = result[tailIndex],
                trailingSlash = /[\\\/]$/.test(tail);

            // Normalize the tail path
            tail = this.normalizeArray(tail.split(/[\\\/]+/).filter(function (p) {
                return !!p;
            }), !isAbsolute).join('/');

            if (tail && trailingSlash) {
                tail += '/';
            }

            // Smash multiple slashes
            return (device + (isAbsolute ? '\\' : '') + tail).replace(/[\\\/]+/g, '/');
        },
        decomposePath: function (path) {
            var pathArray = [];
            return path ? path.split('/').reduce(function (array, value) {
                if (value) {
                    array.push(value);
                }
                return array;
            }, pathArray) : pathArray;
        },
        toKey: function (fullPath, bucket, bucketPath) {
            fullPath = fullPath || '';
            var path = fullPath,
                bucketKeyPath;
            if (bucket) {
                bucketKeyPath = this.joinPaths(bucket, bucketPath);
                path = fullPath.replace(bucketKeyPath, '');
            }
            return this.normalizePath(this.decomposePath(path).join('/'));
        },
        joinPaths: function () {
            var args = Array.prototype.slice.call(arguments);
            return args.reduce(function (array, path) {
                return array.concat(this.decomposePath(path));
            }.bind(this), []).join('/');
        }
    };
}(module));
