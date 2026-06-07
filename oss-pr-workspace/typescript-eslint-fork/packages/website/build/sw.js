(() => {
"use strict";
var __webpack_modules__ = ({
"../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/Deferred.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  Deferred: () => (Deferred)
});
/* import */ var _version_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_version.js");
/* import */ var _version_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_0);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

/**
 * The Deferred class composes Promises in a way that allows for them to be
 * resolved or rejected from outside the constructor. In most cases promises
 * should be used directly, but Deferreds can be necessary when the logic to
 * resolve a promise must be separate.
 *
 * @private
 */
class Deferred {
    /**
     * Creates a promise and exposes its resolve and reject functions as methods.
     */
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}



},
"../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/WorkboxError.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  WorkboxError: () => (WorkboxError)
});
/* import */ var _models_messages_messageGenerator_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/models/messages/messageGenerator.js");
/* import */ var _version_js__rspack_import_1 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_version.js");
/* import */ var _version_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_1);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


/**
 * Workbox errors should be thrown with this class.
 * This allows use to ensure the type easily in tests,
 * helps developers identify errors from workbox
 * easily and allows use to optimise error
 * messages correctly.
 *
 * @private
 */
class WorkboxError extends Error {
    /**
     *
     * @param {string} errorCode The error code that
     * identifies this particular error.
     * @param {Object=} details Any relevant arguments
     * that will help developers identify issues should
     * be added as a key on the context object.
     */
    constructor(errorCode, details) {
        const message = (0,_models_messages_messageGenerator_js__rspack_import_0.messageGenerator)(errorCode, details);
        super(message);
        this.name = errorCode;
        this.details = details;
    }
}



},
"../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/assert.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  assert: () => (finalAssertExports)
});
/* import */ var _private_WorkboxError_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/WorkboxError.js");
/* import */ var _version_js__rspack_import_1 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_version.js");
/* import */ var _version_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_1);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


/*
 * This method throws if the supplied value is not an array.
 * The destructed values are required to produce a meaningful error for users.
 * The destructed and restructured object is so it's clear what is
 * needed.
 */
const isArray = (value, details) => {
    if (!Array.isArray(value)) {
        throw new _private_WorkboxError_js__rspack_import_0.WorkboxError('not-an-array', details);
    }
};
const hasMethod = (object, expectedMethod, details) => {
    const type = typeof object[expectedMethod];
    if (type !== 'function') {
        details['expectedMethod'] = expectedMethod;
        throw new _private_WorkboxError_js__rspack_import_0.WorkboxError('missing-a-method', details);
    }
};
const isType = (object, expectedType, details) => {
    if (typeof object !== expectedType) {
        details['expectedType'] = expectedType;
        throw new _private_WorkboxError_js__rspack_import_0.WorkboxError('incorrect-type', details);
    }
};
const isInstance = (object, 
// Need the general type to do the check later.
// eslint-disable-next-line @typescript-eslint/ban-types
expectedClass, details) => {
    if (!(object instanceof expectedClass)) {
        details['expectedClassName'] = expectedClass.name;
        throw new _private_WorkboxError_js__rspack_import_0.WorkboxError('incorrect-class', details);
    }
};
const isOneOf = (value, validValues, details) => {
    if (!validValues.includes(value)) {
        details['validValueDescription'] = `Valid values are ${JSON.stringify(validValues)}.`;
        throw new _private_WorkboxError_js__rspack_import_0.WorkboxError('invalid-value', details);
    }
};
const isArrayOfClass = (value, 
// Need general type to do check later.
expectedClass, // eslint-disable-line
details) => {
    const error = new _private_WorkboxError_js__rspack_import_0.WorkboxError('not-array-of-class', details);
    if (!Array.isArray(value)) {
        throw error;
    }
    for (const item of value) {
        if (!(item instanceof expectedClass)) {
            throw error;
        }
    }
};
const finalAssertExports =  false
    ? 0
    : {
        hasMethod,
        isArray,
        isInstance,
        isOneOf,
        isType,
        isArrayOfClass,
    };



},
"../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/cacheMatchIgnoreParams.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  cacheMatchIgnoreParams: () => (cacheMatchIgnoreParams)
});
/* import */ var _version_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_version.js");
/* import */ var _version_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_0);
/*
  Copyright 2020 Google LLC
  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

function stripParams(fullURL, ignoreParams) {
    const strippedURL = new URL(fullURL);
    for (const param of ignoreParams) {
        strippedURL.searchParams.delete(param);
    }
    return strippedURL.href;
}
/**
 * Matches an item in the cache, ignoring specific URL params. This is similar
 * to the `ignoreSearch` option, but it allows you to ignore just specific
 * params (while continuing to match on the others).
 *
 * @private
 * @param {Cache} cache
 * @param {Request} request
 * @param {Object} matchOptions
 * @param {Array<string>} ignoreParams
 * @return {Promise<Response|undefined>}
 */
async function cacheMatchIgnoreParams(cache, request, ignoreParams, matchOptions) {
    const strippedRequestURL = stripParams(request.url, ignoreParams);
    // If the request doesn't include any ignored params, match as normal.
    if (request.url === strippedRequestURL) {
        return cache.match(request, matchOptions);
    }
    // Otherwise, match by comparing keys
    const keysOptions = Object.assign(Object.assign({}, matchOptions), { ignoreSearch: true });
    const cacheKeys = await cache.keys(request, keysOptions);
    for (const cacheKey of cacheKeys) {
        const strippedCacheKeyURL = stripParams(cacheKey.url, ignoreParams);
        if (strippedRequestURL === strippedCacheKeyURL) {
            return cache.match(cacheKey, matchOptions);
        }
    }
    return;
}



},
"../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/cacheNames.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  cacheNames: () => (cacheNames)
});
/* import */ var _version_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_version.js");
/* import */ var _version_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_0);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

const _cacheNameDetails = {
    googleAnalytics: 'googleAnalytics',
    precache: 'precache-v2',
    prefix: 'workbox',
    runtime: 'runtime',
    suffix: typeof registration !== 'undefined' ? registration.scope : '',
};
const _createCacheName = (cacheName) => {
    return [_cacheNameDetails.prefix, cacheName, _cacheNameDetails.suffix]
        .filter((value) => value && value.length > 0)
        .join('-');
};
const eachCacheNameDetail = (fn) => {
    for (const key of Object.keys(_cacheNameDetails)) {
        fn(key);
    }
};
const cacheNames = {
    updateDetails: (details) => {
        eachCacheNameDetail((key) => {
            if (typeof details[key] === 'string') {
                _cacheNameDetails[key] = details[key];
            }
        });
    },
    getGoogleAnalyticsName: (userCacheName) => {
        return userCacheName || _createCacheName(_cacheNameDetails.googleAnalytics);
    },
    getPrecacheName: (userCacheName) => {
        return userCacheName || _createCacheName(_cacheNameDetails.precache);
    },
    getPrefix: () => {
        return _cacheNameDetails.prefix;
    },
    getRuntimeName: (userCacheName) => {
        return userCacheName || _createCacheName(_cacheNameDetails.runtime);
    },
    getSuffix: () => {
        return _cacheNameDetails.suffix;
    },
};


},
"../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/canConstructResponseFromBodyStream.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  canConstructResponseFromBodyStream: () => (canConstructResponseFromBodyStream)
});
/* import */ var _version_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_version.js");
/* import */ var _version_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_0);
/*
  Copyright 2019 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

let supportStatus;
/**
 * A utility function that determines whether the current browser supports
 * constructing a new `Response` from a `response.body` stream.
 *
 * @return {boolean} `true`, if the current browser can successfully
 *     construct a `Response` from a `response.body` stream, `false` otherwise.
 *
 * @private
 */
function canConstructResponseFromBodyStream() {
    if (supportStatus === undefined) {
        const testResponse = new Response('');
        if ('body' in testResponse) {
            try {
                new Response(testResponse.body);
                supportStatus = true;
            }
            catch (error) {
                supportStatus = false;
            }
        }
        supportStatus = false;
    }
    return supportStatus;
}



},
"../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/executeQuotaErrorCallbacks.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  executeQuotaErrorCallbacks: () => (executeQuotaErrorCallbacks)
});
/* import */ var _private_logger_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/logger.js");
/* import */ var _models_quotaErrorCallbacks_js__rspack_import_1 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/models/quotaErrorCallbacks.js");
/* import */ var _version_js__rspack_import_2 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_version.js");
/* import */ var _version_js__rspack_import_2_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_2);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/



/**
 * Runs all of the callback functions, one at a time sequentially, in the order
 * in which they were registered.
 *
 * @memberof workbox-core
 * @private
 */
async function executeQuotaErrorCallbacks() {
    if (true) {
        _private_logger_js__rspack_import_0.logger.log(`About to run ${_models_quotaErrorCallbacks_js__rspack_import_1.quotaErrorCallbacks.size} ` +
            `callbacks to clean up caches.`);
    }
    for (const callback of _models_quotaErrorCallbacks_js__rspack_import_1.quotaErrorCallbacks) {
        await callback();
        if (true) {
            _private_logger_js__rspack_import_0.logger.log(callback, 'is complete.');
        }
    }
    if (true) {
        _private_logger_js__rspack_import_0.logger.log('Finished running callbacks.');
    }
}



},
"../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/getFriendlyURL.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  getFriendlyURL: () => (getFriendlyURL)
});
/* import */ var _version_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_version.js");
/* import */ var _version_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_0);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

const getFriendlyURL = (url) => {
    const urlObj = new URL(String(url), location.href);
    // See https://github.com/GoogleChrome/workbox/issues/2323
    // We want to include everything, except for the origin if it's same-origin.
    return urlObj.href.replace(new RegExp(`^${location.origin}`), '');
};



},
"../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/logger.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  logger: () => (logger)
});
/* import */ var _version_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_version.js");
/* import */ var _version_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_0);
/*
  Copyright 2019 Google LLC
  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

const logger = ( false
    ? 0
    : (() => {
        // Don't overwrite this value if it's already set.
        // See https://github.com/GoogleChrome/workbox/pull/2284#issuecomment-560470923
        if (!('__WB_DISABLE_DEV_LOGS' in globalThis)) {
            self.__WB_DISABLE_DEV_LOGS = false;
        }
        let inGroup = false;
        const methodToColorMap = {
            debug: `#7f8c8d`,
            log: `#2ecc71`,
            warn: `#f39c12`,
            error: `#c0392b`,
            groupCollapsed: `#3498db`,
            groupEnd: null, // No colored prefix on groupEnd
        };
        const print = function (method, args) {
            if (self.__WB_DISABLE_DEV_LOGS) {
                return;
            }
            if (method === 'groupCollapsed') {
                // Safari doesn't print all console.groupCollapsed() arguments:
                // https://bugs.webkit.org/show_bug.cgi?id=182754
                if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
                    console[method](...args);
                    return;
                }
            }
            const styles = [
                `background: ${methodToColorMap[method]}`,
                `border-radius: 0.5em`,
                `color: white`,
                `font-weight: bold`,
                `padding: 2px 0.5em`,
            ];
            // When in a group, the workbox prefix is not displayed.
            const logPrefix = inGroup ? [] : ['%cworkbox', styles.join(';')];
            console[method](...logPrefix, ...args);
            if (method === 'groupCollapsed') {
                inGroup = true;
            }
            if (method === 'groupEnd') {
                inGroup = false;
            }
        };
        // eslint-disable-next-line @typescript-eslint/ban-types
        const api = {};
        const loggerMethods = Object.keys(methodToColorMap);
        for (const key of loggerMethods) {
            const method = key;
            api[method] = (...args) => {
                print(method, args);
            };
        }
        return api;
    })());



},
"../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/timeout.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  timeout: () => (timeout)
});
/* import */ var _version_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_version.js");
/* import */ var _version_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_0);
/*
  Copyright 2019 Google LLC
  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

/**
 * Returns a promise that resolves and the passed number of milliseconds.
 * This utility is an async/await-friendly version of `setTimeout`.
 *
 * @param {number} ms
 * @return {Promise}
 * @private
 */
function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}


},
"../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/waitUntil.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  waitUntil: () => (waitUntil)
});
/* import */ var _version_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_version.js");
/* import */ var _version_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_0);
/*
  Copyright 2020 Google LLC
  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

/**
 * A utility method that makes it easier to use `event.waitUntil` with
 * async functions and return the result.
 *
 * @param {ExtendableEvent} event
 * @param {Function} asyncFn
 * @return {Function}
 * @private
 */
function waitUntil(event, asyncFn) {
    const returnPromise = asyncFn();
    event.waitUntil(returnPromise);
    return returnPromise;
}



},
"../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_version.js"() {

// @ts-ignore
try {
    self['workbox:core:7.2.0'] && _();
}
catch (e) { }


},
"../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/copyResponse.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  copyResponse: () => (copyResponse)
});
/* import */ var _private_canConstructResponseFromBodyStream_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/canConstructResponseFromBodyStream.js");
/* import */ var _private_WorkboxError_js__rspack_import_1 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/WorkboxError.js");
/* import */ var _version_js__rspack_import_2 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_version.js");
/* import */ var _version_js__rspack_import_2_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_2);
/*
  Copyright 2019 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/



/**
 * Allows developers to copy a response and modify its `headers`, `status`,
 * or `statusText` values (the values settable via a
 * [`ResponseInit`]{@link https://developer.mozilla.org/en-US/docs/Web/API/Response/Response#Syntax}
 * object in the constructor).
 * To modify these values, pass a function as the second argument. That
 * function will be invoked with a single object with the response properties
 * `{headers, status, statusText}`. The return value of this function will
 * be used as the `ResponseInit` for the new `Response`. To change the values
 * either modify the passed parameter(s) and return it, or return a totally
 * new object.
 *
 * This method is intentionally limited to same-origin responses, regardless of
 * whether CORS was used or not.
 *
 * @param {Response} response
 * @param {Function} modifier
 * @memberof workbox-core
 */
async function copyResponse(response, modifier) {
    let origin = null;
    // If response.url isn't set, assume it's cross-origin and keep origin null.
    if (response.url) {
        const responseURL = new URL(response.url);
        origin = responseURL.origin;
    }
    if (origin !== self.location.origin) {
        throw new _private_WorkboxError_js__rspack_import_1.WorkboxError('cross-origin-copy-response', { origin });
    }
    const clonedResponse = response.clone();
    // Create a fresh `ResponseInit` object by cloning the headers.
    const responseInit = {
        headers: new Headers(clonedResponse.headers),
        status: clonedResponse.status,
        statusText: clonedResponse.statusText,
    };
    // Apply any user modifications.
    const modifiedResponseInit = modifier ? modifier(responseInit) : responseInit;
    // Create the new response from the body stream and `ResponseInit`
    // modifications. Note: not all browsers support the Response.body stream,
    // so fall back to reading the entire body into memory as a blob.
    const body = (0,_private_canConstructResponseFromBodyStream_js__rspack_import_0.canConstructResponseFromBodyStream)()
        ? clonedResponse.body
        : await clonedResponse.blob();
    return new Response(body, modifiedResponseInit);
}



},
"../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/models/messages/messageGenerator.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  messageGenerator: () => (messageGenerator)
});
/* import */ var _messages_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/models/messages/messages.js");
/* import */ var _version_js__rspack_import_1 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_version.js");
/* import */ var _version_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_1);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


const fallback = (code, ...args) => {
    let msg = code;
    if (args.length > 0) {
        msg += ` :: ${JSON.stringify(args)}`;
    }
    return msg;
};
const generatorFunction = (code, details = {}) => {
    const message = _messages_js__rspack_import_0.messages[code];
    if (!message) {
        throw new Error(`Unable to find message for code '${code}'.`);
    }
    return message(details);
};
const messageGenerator =  false ? 0 : generatorFunction;


},
"../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/models/messages/messages.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  messages: () => (messages)
});
/* import */ var _version_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_version.js");
/* import */ var _version_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_0);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

const messages = {
    'invalid-value': ({ paramName, validValueDescription, value }) => {
        if (!paramName || !validValueDescription) {
            throw new Error(`Unexpected input to 'invalid-value' error.`);
        }
        return (`The '${paramName}' parameter was given a value with an ` +
            `unexpected value. ${validValueDescription} Received a value of ` +
            `${JSON.stringify(value)}.`);
    },
    'not-an-array': ({ moduleName, className, funcName, paramName }) => {
        if (!moduleName || !className || !funcName || !paramName) {
            throw new Error(`Unexpected input to 'not-an-array' error.`);
        }
        return (`The parameter '${paramName}' passed into ` +
            `'${moduleName}.${className}.${funcName}()' must be an array.`);
    },
    'incorrect-type': ({ expectedType, paramName, moduleName, className, funcName, }) => {
        if (!expectedType || !paramName || !moduleName || !funcName) {
            throw new Error(`Unexpected input to 'incorrect-type' error.`);
        }
        const classNameStr = className ? `${className}.` : '';
        return (`The parameter '${paramName}' passed into ` +
            `'${moduleName}.${classNameStr}` +
            `${funcName}()' must be of type ${expectedType}.`);
    },
    'incorrect-class': ({ expectedClassName, paramName, moduleName, className, funcName, isReturnValueProblem, }) => {
        if (!expectedClassName || !moduleName || !funcName) {
            throw new Error(`Unexpected input to 'incorrect-class' error.`);
        }
        const classNameStr = className ? `${className}.` : '';
        if (isReturnValueProblem) {
            return (`The return value from ` +
                `'${moduleName}.${classNameStr}${funcName}()' ` +
                `must be an instance of class ${expectedClassName}.`);
        }
        return (`The parameter '${paramName}' passed into ` +
            `'${moduleName}.${classNameStr}${funcName}()' ` +
            `must be an instance of class ${expectedClassName}.`);
    },
    'missing-a-method': ({ expectedMethod, paramName, moduleName, className, funcName, }) => {
        if (!expectedMethod ||
            !paramName ||
            !moduleName ||
            !className ||
            !funcName) {
            throw new Error(`Unexpected input to 'missing-a-method' error.`);
        }
        return (`${moduleName}.${className}.${funcName}() expected the ` +
            `'${paramName}' parameter to expose a '${expectedMethod}' method.`);
    },
    'add-to-cache-list-unexpected-type': ({ entry }) => {
        return (`An unexpected entry was passed to ` +
            `'workbox-precaching.PrecacheController.addToCacheList()' The entry ` +
            `'${JSON.stringify(entry)}' isn't supported. You must supply an array of ` +
            `strings with one or more characters, objects with a url property or ` +
            `Request objects.`);
    },
    'add-to-cache-list-conflicting-entries': ({ firstEntry, secondEntry }) => {
        if (!firstEntry || !secondEntry) {
            throw new Error(`Unexpected input to ` + `'add-to-cache-list-duplicate-entries' error.`);
        }
        return (`Two of the entries passed to ` +
            `'workbox-precaching.PrecacheController.addToCacheList()' had the URL ` +
            `${firstEntry} but different revision details. Workbox is ` +
            `unable to cache and version the asset correctly. Please remove one ` +
            `of the entries.`);
    },
    'plugin-error-request-will-fetch': ({ thrownErrorMessage }) => {
        if (!thrownErrorMessage) {
            throw new Error(`Unexpected input to ` + `'plugin-error-request-will-fetch', error.`);
        }
        return (`An error was thrown by a plugins 'requestWillFetch()' method. ` +
            `The thrown error message was: '${thrownErrorMessage}'.`);
    },
    'invalid-cache-name': ({ cacheNameId, value }) => {
        if (!cacheNameId) {
            throw new Error(`Expected a 'cacheNameId' for error 'invalid-cache-name'`);
        }
        return (`You must provide a name containing at least one character for ` +
            `setCacheDetails({${cacheNameId}: '...'}). Received a value of ` +
            `'${JSON.stringify(value)}'`);
    },
    'unregister-route-but-not-found-with-method': ({ method }) => {
        if (!method) {
            throw new Error(`Unexpected input to ` +
                `'unregister-route-but-not-found-with-method' error.`);
        }
        return (`The route you're trying to unregister was not  previously ` +
            `registered for the method type '${method}'.`);
    },
    'unregister-route-route-not-registered': () => {
        return (`The route you're trying to unregister was not previously ` +
            `registered.`);
    },
    'queue-replay-failed': ({ name }) => {
        return `Replaying the background sync queue '${name}' failed.`;
    },
    'duplicate-queue-name': ({ name }) => {
        return (`The Queue name '${name}' is already being used. ` +
            `All instances of backgroundSync.Queue must be given unique names.`);
    },
    'expired-test-without-max-age': ({ methodName, paramName }) => {
        return (`The '${methodName}()' method can only be used when the ` +
            `'${paramName}' is used in the constructor.`);
    },
    'unsupported-route-type': ({ moduleName, className, funcName, paramName }) => {
        return (`The supplied '${paramName}' parameter was an unsupported type. ` +
            `Please check the docs for ${moduleName}.${className}.${funcName} for ` +
            `valid input types.`);
    },
    'not-array-of-class': ({ value, expectedClass, moduleName, className, funcName, paramName, }) => {
        return (`The supplied '${paramName}' parameter must be an array of ` +
            `'${expectedClass}' objects. Received '${JSON.stringify(value)},'. ` +
            `Please check the call to ${moduleName}.${className}.${funcName}() ` +
            `to fix the issue.`);
    },
    'max-entries-or-age-required': ({ moduleName, className, funcName }) => {
        return (`You must define either config.maxEntries or config.maxAgeSeconds` +
            `in ${moduleName}.${className}.${funcName}`);
    },
    'statuses-or-headers-required': ({ moduleName, className, funcName }) => {
        return (`You must define either config.statuses or config.headers` +
            `in ${moduleName}.${className}.${funcName}`);
    },
    'invalid-string': ({ moduleName, funcName, paramName }) => {
        if (!paramName || !moduleName || !funcName) {
            throw new Error(`Unexpected input to 'invalid-string' error.`);
        }
        return (`When using strings, the '${paramName}' parameter must start with ` +
            `'http' (for cross-origin matches) or '/' (for same-origin matches). ` +
            `Please see the docs for ${moduleName}.${funcName}() for ` +
            `more info.`);
    },
    'channel-name-required': () => {
        return (`You must provide a channelName to construct a ` +
            `BroadcastCacheUpdate instance.`);
    },
    'invalid-responses-are-same-args': () => {
        return (`The arguments passed into responsesAreSame() appear to be ` +
            `invalid. Please ensure valid Responses are used.`);
    },
    'expire-custom-caches-only': () => {
        return (`You must provide a 'cacheName' property when using the ` +
            `expiration plugin with a runtime caching strategy.`);
    },
    'unit-must-be-bytes': ({ normalizedRangeHeader }) => {
        if (!normalizedRangeHeader) {
            throw new Error(`Unexpected input to 'unit-must-be-bytes' error.`);
        }
        return (`The 'unit' portion of the Range header must be set to 'bytes'. ` +
            `The Range header provided was "${normalizedRangeHeader}"`);
    },
    'single-range-only': ({ normalizedRangeHeader }) => {
        if (!normalizedRangeHeader) {
            throw new Error(`Unexpected input to 'single-range-only' error.`);
        }
        return (`Multiple ranges are not supported. Please use a  single start ` +
            `value, and optional end value. The Range header provided was ` +
            `"${normalizedRangeHeader}"`);
    },
    'invalid-range-values': ({ normalizedRangeHeader }) => {
        if (!normalizedRangeHeader) {
            throw new Error(`Unexpected input to 'invalid-range-values' error.`);
        }
        return (`The Range header is missing both start and end values. At least ` +
            `one of those values is needed. The Range header provided was ` +
            `"${normalizedRangeHeader}"`);
    },
    'no-range-header': () => {
        return `No Range header was found in the Request provided.`;
    },
    'range-not-satisfiable': ({ size, start, end }) => {
        return (`The start (${start}) and end (${end}) values in the Range are ` +
            `not satisfiable by the cached response, which is ${size} bytes.`);
    },
    'attempt-to-cache-non-get-request': ({ url, method }) => {
        return (`Unable to cache '${url}' because it is a '${method}' request and ` +
            `only 'GET' requests can be cached.`);
    },
    'cache-put-with-no-response': ({ url }) => {
        return (`There was an attempt to cache '${url}' but the response was not ` +
            `defined.`);
    },
    'no-response': ({ url, error }) => {
        let message = `The strategy could not generate a response for '${url}'.`;
        if (error) {
            message += ` The underlying error is ${error}.`;
        }
        return message;
    },
    'bad-precaching-response': ({ url, status }) => {
        return (`The precaching request for '${url}' failed` +
            (status ? ` with an HTTP status of ${status}.` : `.`));
    },
    'non-precached-url': ({ url }) => {
        return (`createHandlerBoundToURL('${url}') was called, but that URL is ` +
            `not precached. Please pass in a URL that is precached instead.`);
    },
    'add-to-cache-list-conflicting-integrities': ({ url }) => {
        return (`Two of the entries passed to ` +
            `'workbox-precaching.PrecacheController.addToCacheList()' had the URL ` +
            `${url} with different integrity values. Please remove one of them.`);
    },
    'missing-precache-entry': ({ cacheName, url }) => {
        return `Unable to find a precached response in ${cacheName} for ${url}.`;
    },
    'cross-origin-copy-response': ({ origin }) => {
        return (`workbox-core.copyResponse() can only be used with same-origin ` +
            `responses. It was passed a response with origin ${origin}.`);
    },
    'opaque-streams-source': ({ type }) => {
        const message = `One of the workbox-streams sources resulted in an ` +
            `'${type}' response.`;
        if (type === 'opaqueredirect') {
            return (`${message} Please do not use a navigation request that results ` +
                `in a redirect as a source.`);
        }
        return `${message} Please ensure your sources are CORS-enabled.`;
    },
};


},
"../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/models/quotaErrorCallbacks.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  quotaErrorCallbacks: () => (quotaErrorCallbacks)
});
/* import */ var _version_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_version.js");
/* import */ var _version_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_0);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

// Callbacks to be executed whenever there's a quota error.
// Can't change Function type right now.
// eslint-disable-next-line @typescript-eslint/ban-types
const quotaErrorCallbacks = new Set();



},
"../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/PrecacheController.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  PrecacheController: () => (PrecacheController)
});
/* import */ var workbox_core_private_assert_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/assert.js");
/* import */ var workbox_core_private_cacheNames_js__rspack_import_1 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/cacheNames.js");
/* import */ var workbox_core_private_logger_js__rspack_import_2 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/logger.js");
/* import */ var workbox_core_private_WorkboxError_js__rspack_import_3 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/WorkboxError.js");
/* import */ var workbox_core_private_waitUntil_js__rspack_import_4 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/waitUntil.js");
/* import */ var _utils_createCacheKey_js__rspack_import_5 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/utils/createCacheKey.js");
/* import */ var _utils_PrecacheInstallReportPlugin_js__rspack_import_6 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/utils/PrecacheInstallReportPlugin.js");
/* import */ var _utils_PrecacheCacheKeyPlugin_js__rspack_import_7 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/utils/PrecacheCacheKeyPlugin.js");
/* import */ var _utils_printCleanupDetails_js__rspack_import_8 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/utils/printCleanupDetails.js");
/* import */ var _utils_printInstallDetails_js__rspack_import_9 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/utils/printInstallDetails.js");
/* import */ var _PrecacheStrategy_js__rspack_import_10 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/PrecacheStrategy.js");
/* import */ var _version_js__rspack_import_11 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/_version.js");
/* import */ var _version_js__rspack_import_11_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_11);
/*
  Copyright 2019 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/












/**
 * Performs efficient precaching of assets.
 *
 * @memberof workbox-precaching
 */
class PrecacheController {
    /**
     * Create a new PrecacheController.
     *
     * @param {Object} [options]
     * @param {string} [options.cacheName] The cache to use for precaching.
     * @param {string} [options.plugins] Plugins to use when precaching as well
     * as responding to fetch events for precached assets.
     * @param {boolean} [options.fallbackToNetwork=true] Whether to attempt to
     * get the response from the network if there's a precache miss.
     */
    constructor({ cacheName, plugins = [], fallbackToNetwork = true, } = {}) {
        this._urlsToCacheKeys = new Map();
        this._urlsToCacheModes = new Map();
        this._cacheKeysToIntegrities = new Map();
        this._strategy = new _PrecacheStrategy_js__rspack_import_10.PrecacheStrategy({
            cacheName: workbox_core_private_cacheNames_js__rspack_import_1.cacheNames.getPrecacheName(cacheName),
            plugins: [
                ...plugins,
                new _utils_PrecacheCacheKeyPlugin_js__rspack_import_7.PrecacheCacheKeyPlugin({ precacheController: this }),
            ],
            fallbackToNetwork,
        });
        // Bind the install and activate methods to the instance.
        this.install = this.install.bind(this);
        this.activate = this.activate.bind(this);
    }
    /**
     * @type {workbox-precaching.PrecacheStrategy} The strategy created by this controller and
     * used to cache assets and respond to fetch events.
     */
    get strategy() {
        return this._strategy;
    }
    /**
     * Adds items to the precache list, removing any duplicates and
     * stores the files in the
     * {@link workbox-core.cacheNames|"precache cache"} when the service
     * worker installs.
     *
     * This method can be called multiple times.
     *
     * @param {Array<Object|string>} [entries=[]] Array of entries to precache.
     */
    precache(entries) {
        this.addToCacheList(entries);
        if (!this._installAndActiveListenersAdded) {
            self.addEventListener('install', this.install);
            self.addEventListener('activate', this.activate);
            this._installAndActiveListenersAdded = true;
        }
    }
    /**
     * This method will add items to the precache list, removing duplicates
     * and ensuring the information is valid.
     *
     * @param {Array<workbox-precaching.PrecacheController.PrecacheEntry|string>} entries
     *     Array of entries to precache.
     */
    addToCacheList(entries) {
        if (true) {
            workbox_core_private_assert_js__rspack_import_0.assert.isArray(entries, {
                moduleName: 'workbox-precaching',
                className: 'PrecacheController',
                funcName: 'addToCacheList',
                paramName: 'entries',
            });
        }
        const urlsToWarnAbout = [];
        for (const entry of entries) {
            // See https://github.com/GoogleChrome/workbox/issues/2259
            if (typeof entry === 'string') {
                urlsToWarnAbout.push(entry);
            }
            else if (entry && entry.revision === undefined) {
                urlsToWarnAbout.push(entry.url);
            }
            const { cacheKey, url } = (0,_utils_createCacheKey_js__rspack_import_5.createCacheKey)(entry);
            const cacheMode = typeof entry !== 'string' && entry.revision ? 'reload' : 'default';
            if (this._urlsToCacheKeys.has(url) &&
                this._urlsToCacheKeys.get(url) !== cacheKey) {
                throw new workbox_core_private_WorkboxError_js__rspack_import_3.WorkboxError('add-to-cache-list-conflicting-entries', {
                    firstEntry: this._urlsToCacheKeys.get(url),
                    secondEntry: cacheKey,
                });
            }
            if (typeof entry !== 'string' && entry.integrity) {
                if (this._cacheKeysToIntegrities.has(cacheKey) &&
                    this._cacheKeysToIntegrities.get(cacheKey) !== entry.integrity) {
                    throw new workbox_core_private_WorkboxError_js__rspack_import_3.WorkboxError('add-to-cache-list-conflicting-integrities', {
                        url,
                    });
                }
                this._cacheKeysToIntegrities.set(cacheKey, entry.integrity);
            }
            this._urlsToCacheKeys.set(url, cacheKey);
            this._urlsToCacheModes.set(url, cacheMode);
            if (urlsToWarnAbout.length > 0) {
                const warningMessage = `Workbox is precaching URLs without revision ` +
                    `info: ${urlsToWarnAbout.join(', ')}\nThis is generally NOT safe. ` +
                    `Learn more at https://bit.ly/wb-precache`;
                if (false) {}
                else {
                    workbox_core_private_logger_js__rspack_import_2.logger.warn(warningMessage);
                }
            }
        }
    }
    /**
     * Precaches new and updated assets. Call this method from the service worker
     * install event.
     *
     * Note: this method calls `event.waitUntil()` for you, so you do not need
     * to call it yourself in your event handlers.
     *
     * @param {ExtendableEvent} event
     * @return {Promise<workbox-precaching.InstallResult>}
     */
    install(event) {
        // waitUntil returns Promise<any>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return (0,workbox_core_private_waitUntil_js__rspack_import_4.waitUntil)(event, async () => {
            const installReportPlugin = new _utils_PrecacheInstallReportPlugin_js__rspack_import_6.PrecacheInstallReportPlugin();
            this.strategy.plugins.push(installReportPlugin);
            // Cache entries one at a time.
            // See https://github.com/GoogleChrome/workbox/issues/2528
            for (const [url, cacheKey] of this._urlsToCacheKeys) {
                const integrity = this._cacheKeysToIntegrities.get(cacheKey);
                const cacheMode = this._urlsToCacheModes.get(url);
                const request = new Request(url, {
                    integrity,
                    cache: cacheMode,
                    credentials: 'same-origin',
                });
                await Promise.all(this.strategy.handleAll({
                    params: { cacheKey },
                    request,
                    event,
                }));
            }
            const { updatedURLs, notUpdatedURLs } = installReportPlugin;
            if (true) {
                (0,_utils_printInstallDetails_js__rspack_import_9.printInstallDetails)(updatedURLs, notUpdatedURLs);
            }
            return { updatedURLs, notUpdatedURLs };
        });
    }
    /**
     * Deletes assets that are no longer present in the current precache manifest.
     * Call this method from the service worker activate event.
     *
     * Note: this method calls `event.waitUntil()` for you, so you do not need
     * to call it yourself in your event handlers.
     *
     * @param {ExtendableEvent} event
     * @return {Promise<workbox-precaching.CleanupResult>}
     */
    activate(event) {
        // waitUntil returns Promise<any>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return (0,workbox_core_private_waitUntil_js__rspack_import_4.waitUntil)(event, async () => {
            const cache = await self.caches.open(this.strategy.cacheName);
            const currentlyCachedRequests = await cache.keys();
            const expectedCacheKeys = new Set(this._urlsToCacheKeys.values());
            const deletedURLs = [];
            for (const request of currentlyCachedRequests) {
                if (!expectedCacheKeys.has(request.url)) {
                    await cache.delete(request);
                    deletedURLs.push(request.url);
                }
            }
            if (true) {
                (0,_utils_printCleanupDetails_js__rspack_import_8.printCleanupDetails)(deletedURLs);
            }
            return { deletedURLs };
        });
    }
    /**
     * Returns a mapping of a precached URL to the corresponding cache key, taking
     * into account the revision information for the URL.
     *
     * @return {Map<string, string>} A URL to cache key mapping.
     */
    getURLsToCacheKeys() {
        return this._urlsToCacheKeys;
    }
    /**
     * Returns a list of all the URLs that have been precached by the current
     * service worker.
     *
     * @return {Array<string>} The precached URLs.
     */
    getCachedURLs() {
        return [...this._urlsToCacheKeys.keys()];
    }
    /**
     * Returns the cache key used for storing a given URL. If that URL is
     * unversioned, like `/index.html', then the cache key will be the original
     * URL with a search parameter appended to it.
     *
     * @param {string} url A URL whose cache key you want to look up.
     * @return {string} The versioned URL that corresponds to a cache key
     * for the original URL, or undefined if that URL isn't precached.
     */
    getCacheKeyForURL(url) {
        const urlObject = new URL(url, location.href);
        return this._urlsToCacheKeys.get(urlObject.href);
    }
    /**
     * @param {string} url A cache key whose SRI you want to look up.
     * @return {string} The subresource integrity associated with the cache key,
     * or undefined if it's not set.
     */
    getIntegrityForCacheKey(cacheKey) {
        return this._cacheKeysToIntegrities.get(cacheKey);
    }
    /**
     * This acts as a drop-in replacement for
     * [`cache.match()`](https://developer.mozilla.org/en-US/docs/Web/API/Cache/match)
     * with the following differences:
     *
     * - It knows what the name of the precache is, and only checks in that cache.
     * - It allows you to pass in an "original" URL without versioning parameters,
     * and it will automatically look up the correct cache key for the currently
     * active revision of that URL.
     *
     * E.g., `matchPrecache('index.html')` will find the correct precached
     * response for the currently active service worker, even if the actual cache
     * key is `'/index.html?__WB_REVISION__=1234abcd'`.
     *
     * @param {string|Request} request The key (without revisioning parameters)
     * to look up in the precache.
     * @return {Promise<Response|undefined>}
     */
    async matchPrecache(request) {
        const url = request instanceof Request ? request.url : request;
        const cacheKey = this.getCacheKeyForURL(url);
        if (cacheKey) {
            const cache = await self.caches.open(this.strategy.cacheName);
            return cache.match(cacheKey);
        }
        return undefined;
    }
    /**
     * Returns a function that looks up `url` in the precache (taking into
     * account revision information), and returns the corresponding `Response`.
     *
     * @param {string} url The precached URL which will be used to lookup the
     * `Response`.
     * @return {workbox-routing~handlerCallback}
     */
    createHandlerBoundToURL(url) {
        const cacheKey = this.getCacheKeyForURL(url);
        if (!cacheKey) {
            throw new workbox_core_private_WorkboxError_js__rspack_import_3.WorkboxError('non-precached-url', { url });
        }
        return (options) => {
            options.request = new Request(url);
            options.params = Object.assign({ cacheKey }, options.params);
            return this.strategy.handle(options);
        };
    }
}



},
"../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/PrecacheFallbackPlugin.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  PrecacheFallbackPlugin: () => (PrecacheFallbackPlugin)
});
/* import */ var _utils_getOrCreatePrecacheController_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/utils/getOrCreatePrecacheController.js");
/* import */ var _version_js__rspack_import_1 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/_version.js");
/* import */ var _version_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_1);
/*
  Copyright 2020 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


/**
 * `PrecacheFallbackPlugin` allows you to specify an "offline fallback"
 * response to be used when a given strategy is unable to generate a response.
 *
 * It does this by intercepting the `handlerDidError` plugin callback
 * and returning a precached response, taking the expected revision parameter
 * into account automatically.
 *
 * Unless you explicitly pass in a `PrecacheController` instance to the
 * constructor, the default instance will be used. Generally speaking, most
 * developers will end up using the default.
 *
 * @memberof workbox-precaching
 */
class PrecacheFallbackPlugin {
    /**
     * Constructs a new PrecacheFallbackPlugin with the associated fallbackURL.
     *
     * @param {Object} config
     * @param {string} config.fallbackURL A precached URL to use as the fallback
     *     if the associated strategy can't generate a response.
     * @param {PrecacheController} [config.precacheController] An optional
     *     PrecacheController instance. If not provided, the default
     *     PrecacheController will be used.
     */
    constructor({ fallbackURL, precacheController, }) {
        /**
         * @return {Promise<Response>} The precache response for the fallback URL.
         *
         * @private
         */
        this.handlerDidError = () => this._precacheController.matchPrecache(this._fallbackURL);
        this._fallbackURL = fallbackURL;
        this._precacheController =
            precacheController || (0,_utils_getOrCreatePrecacheController_js__rspack_import_0.getOrCreatePrecacheController)();
    }
}



},
"../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/PrecacheRoute.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  PrecacheRoute: () => (PrecacheRoute)
});
/* import */ var workbox_core_private_logger_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/logger.js");
/* import */ var workbox_core_private_getFriendlyURL_js__rspack_import_1 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/getFriendlyURL.js");
/* import */ var workbox_routing_Route_js__rspack_import_2 = __webpack_require__("../../node_modules/.pnpm/workbox-routing@7.3.0/node_modules/workbox-routing/Route.js");
/* import */ var _utils_generateURLVariations_js__rspack_import_3 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/utils/generateURLVariations.js");
/* import */ var _version_js__rspack_import_4 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/_version.js");
/* import */ var _version_js__rspack_import_4_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_4);
/*
  Copyright 2020 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/





/**
 * A subclass of {@link workbox-routing.Route} that takes a
 * {@link workbox-precaching.PrecacheController}
 * instance and uses it to match incoming requests and handle fetching
 * responses from the precache.
 *
 * @memberof workbox-precaching
 * @extends workbox-routing.Route
 */
class PrecacheRoute extends workbox_routing_Route_js__rspack_import_2.Route {
    /**
     * @param {PrecacheController} precacheController A `PrecacheController`
     * instance used to both match requests and respond to fetch events.
     * @param {Object} [options] Options to control how requests are matched
     * against the list of precached URLs.
     * @param {string} [options.directoryIndex=index.html] The `directoryIndex` will
     * check cache entries for a URLs ending with '/' to see if there is a hit when
     * appending the `directoryIndex` value.
     * @param {Array<RegExp>} [options.ignoreURLParametersMatching=[/^utm_/, /^fbclid$/]] An
     * array of regex's to remove search params when looking for a cache match.
     * @param {boolean} [options.cleanURLs=true] The `cleanURLs` option will
     * check the cache for the URL with a `.html` added to the end of the end.
     * @param {workbox-precaching~urlManipulation} [options.urlManipulation]
     * This is a function that should take a URL and return an array of
     * alternative URLs that should be checked for precache matches.
     */
    constructor(precacheController, options) {
        const match = ({ request, }) => {
            const urlsToCacheKeys = precacheController.getURLsToCacheKeys();
            for (const possibleURL of (0,_utils_generateURLVariations_js__rspack_import_3.generateURLVariations)(request.url, options)) {
                const cacheKey = urlsToCacheKeys.get(possibleURL);
                if (cacheKey) {
                    const integrity = precacheController.getIntegrityForCacheKey(cacheKey);
                    return { cacheKey, integrity };
                }
            }
            if (true) {
                workbox_core_private_logger_js__rspack_import_0.logger.debug(`Precaching did not find a match for ` + (0,workbox_core_private_getFriendlyURL_js__rspack_import_1.getFriendlyURL)(request.url));
            }
            return;
        };
        super(match, precacheController.strategy);
    }
}



},
"../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/PrecacheStrategy.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  PrecacheStrategy: () => (PrecacheStrategy)
});
/* import */ var workbox_core_copyResponse_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/copyResponse.js");
/* import */ var workbox_core_private_cacheNames_js__rspack_import_1 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/cacheNames.js");
/* import */ var workbox_core_private_getFriendlyURL_js__rspack_import_2 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/getFriendlyURL.js");
/* import */ var workbox_core_private_logger_js__rspack_import_3 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/logger.js");
/* import */ var workbox_core_private_WorkboxError_js__rspack_import_4 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/WorkboxError.js");
/* import */ var workbox_strategies_Strategy_js__rspack_import_5 = __webpack_require__("../../node_modules/.pnpm/workbox-strategies@7.3.0/node_modules/workbox-strategies/Strategy.js");
/* import */ var _version_js__rspack_import_6 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/_version.js");
/* import */ var _version_js__rspack_import_6_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_6);
/*
  Copyright 2020 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/







/**
 * A {@link workbox-strategies.Strategy} implementation
 * specifically designed to work with
 * {@link workbox-precaching.PrecacheController}
 * to both cache and fetch precached assets.
 *
 * Note: an instance of this class is created automatically when creating a
 * `PrecacheController`; it's generally not necessary to create this yourself.
 *
 * @extends workbox-strategies.Strategy
 * @memberof workbox-precaching
 */
class PrecacheStrategy extends workbox_strategies_Strategy_js__rspack_import_5.Strategy {
    /**
     *
     * @param {Object} [options]
     * @param {string} [options.cacheName] Cache name to store and retrieve
     * requests. Defaults to the cache names provided by
     * {@link workbox-core.cacheNames}.
     * @param {Array<Object>} [options.plugins] {@link https://developers.google.com/web/tools/workbox/guides/using-plugins|Plugins}
     * to use in conjunction with this caching strategy.
     * @param {Object} [options.fetchOptions] Values passed along to the
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters|init}
     * of all fetch() requests made by this strategy.
     * @param {Object} [options.matchOptions] The
     * {@link https://w3c.github.io/ServiceWorker/#dictdef-cachequeryoptions|CacheQueryOptions}
     * for any `cache.match()` or `cache.put()` calls made by this strategy.
     * @param {boolean} [options.fallbackToNetwork=true] Whether to attempt to
     * get the response from the network if there's a precache miss.
     */
    constructor(options = {}) {
        options.cacheName = workbox_core_private_cacheNames_js__rspack_import_1.cacheNames.getPrecacheName(options.cacheName);
        super(options);
        this._fallbackToNetwork =
            options.fallbackToNetwork === false ? false : true;
        // Redirected responses cannot be used to satisfy a navigation request, so
        // any redirected response must be "copied" rather than cloned, so the new
        // response doesn't contain the `redirected` flag. See:
        // https://bugs.chromium.org/p/chromium/issues/detail?id=669363&desc=2#c1
        this.plugins.push(PrecacheStrategy.copyRedirectedCacheableResponsesPlugin);
    }
    /**
     * @private
     * @param {Request|string} request A request to run this strategy for.
     * @param {workbox-strategies.StrategyHandler} handler The event that
     *     triggered the request.
     * @return {Promise<Response>}
     */
    async _handle(request, handler) {
        const response = await handler.cacheMatch(request);
        if (response) {
            return response;
        }
        // If this is an `install` event for an entry that isn't already cached,
        // then populate the cache.
        if (handler.event && handler.event.type === 'install') {
            return await this._handleInstall(request, handler);
        }
        // Getting here means something went wrong. An entry that should have been
        // precached wasn't found in the cache.
        return await this._handleFetch(request, handler);
    }
    async _handleFetch(request, handler) {
        let response;
        const params = (handler.params || {});
        // Fall back to the network if we're configured to do so.
        if (this._fallbackToNetwork) {
            if (true) {
                workbox_core_private_logger_js__rspack_import_3.logger.warn(`The precached response for ` +
                    `${(0,workbox_core_private_getFriendlyURL_js__rspack_import_2.getFriendlyURL)(request.url)} in ${this.cacheName} was not ` +
                    `found. Falling back to the network.`);
            }
            const integrityInManifest = params.integrity;
            const integrityInRequest = request.integrity;
            const noIntegrityConflict = !integrityInRequest || integrityInRequest === integrityInManifest;
            // Do not add integrity if the original request is no-cors
            // See https://github.com/GoogleChrome/workbox/issues/3096
            response = await handler.fetch(new Request(request, {
                integrity: request.mode !== 'no-cors'
                    ? integrityInRequest || integrityInManifest
                    : undefined,
            }));
            // It's only "safe" to repair the cache if we're using SRI to guarantee
            // that the response matches the precache manifest's expectations,
            // and there's either a) no integrity property in the incoming request
            // or b) there is an integrity, and it matches the precache manifest.
            // See https://github.com/GoogleChrome/workbox/issues/2858
            // Also if the original request users no-cors we don't use integrity.
            // See https://github.com/GoogleChrome/workbox/issues/3096
            if (integrityInManifest &&
                noIntegrityConflict &&
                request.mode !== 'no-cors') {
                this._useDefaultCacheabilityPluginIfNeeded();
                const wasCached = await handler.cachePut(request, response.clone());
                if (true) {
                    if (wasCached) {
                        workbox_core_private_logger_js__rspack_import_3.logger.log(`A response for ${(0,workbox_core_private_getFriendlyURL_js__rspack_import_2.getFriendlyURL)(request.url)} ` +
                            `was used to "repair" the precache.`);
                    }
                }
            }
        }
        else {
            // This shouldn't normally happen, but there are edge cases:
            // https://github.com/GoogleChrome/workbox/issues/1441
            throw new workbox_core_private_WorkboxError_js__rspack_import_4.WorkboxError('missing-precache-entry', {
                cacheName: this.cacheName,
                url: request.url,
            });
        }
        if (true) {
            const cacheKey = params.cacheKey || (await handler.getCacheKey(request, 'read'));
            // Workbox is going to handle the route.
            // print the routing details to the console.
            workbox_core_private_logger_js__rspack_import_3.logger.groupCollapsed(`Precaching is responding to: ` + (0,workbox_core_private_getFriendlyURL_js__rspack_import_2.getFriendlyURL)(request.url));
            workbox_core_private_logger_js__rspack_import_3.logger.log(`Serving the precached url: ${(0,workbox_core_private_getFriendlyURL_js__rspack_import_2.getFriendlyURL)(cacheKey instanceof Request ? cacheKey.url : cacheKey)}`);
            workbox_core_private_logger_js__rspack_import_3.logger.groupCollapsed(`View request details here.`);
            workbox_core_private_logger_js__rspack_import_3.logger.log(request);
            workbox_core_private_logger_js__rspack_import_3.logger.groupEnd();
            workbox_core_private_logger_js__rspack_import_3.logger.groupCollapsed(`View response details here.`);
            workbox_core_private_logger_js__rspack_import_3.logger.log(response);
            workbox_core_private_logger_js__rspack_import_3.logger.groupEnd();
            workbox_core_private_logger_js__rspack_import_3.logger.groupEnd();
        }
        return response;
    }
    async _handleInstall(request, handler) {
        this._useDefaultCacheabilityPluginIfNeeded();
        const response = await handler.fetch(request);
        // Make sure we defer cachePut() until after we know the response
        // should be cached; see https://github.com/GoogleChrome/workbox/issues/2737
        const wasCached = await handler.cachePut(request, response.clone());
        if (!wasCached) {
            // Throwing here will lead to the `install` handler failing, which
            // we want to do if *any* of the responses aren't safe to cache.
            throw new workbox_core_private_WorkboxError_js__rspack_import_4.WorkboxError('bad-precaching-response', {
                url: request.url,
                status: response.status,
            });
        }
        return response;
    }
    /**
     * This method is complex, as there a number of things to account for:
     *
     * The `plugins` array can be set at construction, and/or it might be added to
     * to at any time before the strategy is used.
     *
     * At the time the strategy is used (i.e. during an `install` event), there
     * needs to be at least one plugin that implements `cacheWillUpdate` in the
     * array, other than `copyRedirectedCacheableResponsesPlugin`.
     *
     * - If this method is called and there are no suitable `cacheWillUpdate`
     * plugins, we need to add `defaultPrecacheCacheabilityPlugin`.
     *
     * - If this method is called and there is exactly one `cacheWillUpdate`, then
     * we don't have to do anything (this might be a previously added
     * `defaultPrecacheCacheabilityPlugin`, or it might be a custom plugin).
     *
     * - If this method is called and there is more than one `cacheWillUpdate`,
     * then we need to check if one is `defaultPrecacheCacheabilityPlugin`. If so,
     * we need to remove it. (This situation is unlikely, but it could happen if
     * the strategy is used multiple times, the first without a `cacheWillUpdate`,
     * and then later on after manually adding a custom `cacheWillUpdate`.)
     *
     * See https://github.com/GoogleChrome/workbox/issues/2737 for more context.
     *
     * @private
     */
    _useDefaultCacheabilityPluginIfNeeded() {
        let defaultPluginIndex = null;
        let cacheWillUpdatePluginCount = 0;
        for (const [index, plugin] of this.plugins.entries()) {
            // Ignore the copy redirected plugin when determining what to do.
            if (plugin === PrecacheStrategy.copyRedirectedCacheableResponsesPlugin) {
                continue;
            }
            // Save the default plugin's index, in case it needs to be removed.
            if (plugin === PrecacheStrategy.defaultPrecacheCacheabilityPlugin) {
                defaultPluginIndex = index;
            }
            if (plugin.cacheWillUpdate) {
                cacheWillUpdatePluginCount++;
            }
        }
        if (cacheWillUpdatePluginCount === 0) {
            this.plugins.push(PrecacheStrategy.defaultPrecacheCacheabilityPlugin);
        }
        else if (cacheWillUpdatePluginCount > 1 && defaultPluginIndex !== null) {
            // Only remove the default plugin; multiple custom plugins are allowed.
            this.plugins.splice(defaultPluginIndex, 1);
        }
        // Nothing needs to be done if cacheWillUpdatePluginCount is 1
    }
}
PrecacheStrategy.defaultPrecacheCacheabilityPlugin = {
    async cacheWillUpdate({ response }) {
        if (!response || response.status >= 400) {
            return null;
        }
        return response;
    },
};
PrecacheStrategy.copyRedirectedCacheableResponsesPlugin = {
    async cacheWillUpdate({ response }) {
        return response.redirected ? await (0,workbox_core_copyResponse_js__rspack_import_0.copyResponse)(response) : response;
    },
};



},
"../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/_types.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
/* import */ var _version_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/_version.js");
/* import */ var _version_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_0);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

// * * * IMPORTANT! * * *
// ------------------------------------------------------------------------- //
// jdsoc type definitions cannot be declared above TypeScript definitions or
// they'll be stripped from the built `.js` files, and they'll only be in the
// `d.ts` files, which aren't read by the jsdoc generator. As a result we
// have to put declare them below.
/**
 * @typedef {Object} InstallResult
 * @property {Array<string>} updatedURLs List of URLs that were updated during
 * installation.
 * @property {Array<string>} notUpdatedURLs List of URLs that were already up to
 * date.
 *
 * @memberof workbox-precaching
 */
/**
 * @typedef {Object} CleanupResult
 * @property {Array<string>} deletedCacheRequests List of URLs that were deleted
 * while cleaning up the cache.
 *
 * @memberof workbox-precaching
 */
/**
 * @typedef {Object} PrecacheEntry
 * @property {string} url URL to precache.
 * @property {string} [revision] Revision information for the URL.
 * @property {string} [integrity] Integrity metadata that will be used when
 * making the network request for the URL.
 *
 * @memberof workbox-precaching
 */
/**
 * The "urlManipulation" callback can be used to determine if there are any
 * additional permutations of a URL that should be used to check against
 * the available precached files.
 *
 * For example, Workbox supports checking for '/index.html' when the URL
 * '/' is provided. This callback allows additional, custom checks.
 *
 * @callback ~urlManipulation
 * @param {Object} context
 * @param {URL} context.url The request's URL.
 * @return {Array<URL>} To add additional urls to test, return an Array of
 * URLs. Please note that these **should not be strings**, but URL objects.
 *
 * @memberof workbox-precaching
 */


},
"../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/_version.js"() {

// @ts-ignore
try {
    self['workbox:precaching:7.2.0'] && _();
}
catch (e) { }


},
"../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/addPlugins.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  addPlugins: () => (addPlugins)
});
/* import */ var _utils_getOrCreatePrecacheController_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/utils/getOrCreatePrecacheController.js");
/* import */ var _version_js__rspack_import_1 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/_version.js");
/* import */ var _version_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_1);
/*
  Copyright 2019 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


/**
 * Adds plugins to the precaching strategy.
 *
 * @param {Array<Object>} plugins
 *
 * @memberof workbox-precaching
 */
function addPlugins(plugins) {
    const precacheController = (0,_utils_getOrCreatePrecacheController_js__rspack_import_0.getOrCreatePrecacheController)();
    precacheController.strategy.plugins.push(...plugins);
}



},
"../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/addRoute.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  addRoute: () => (addRoute)
});
/* import */ var workbox_routing_registerRoute_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-routing@7.3.0/node_modules/workbox-routing/registerRoute.js");
/* import */ var _utils_getOrCreatePrecacheController_js__rspack_import_1 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/utils/getOrCreatePrecacheController.js");
/* import */ var _PrecacheRoute_js__rspack_import_2 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/PrecacheRoute.js");
/* import */ var _version_js__rspack_import_3 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/_version.js");
/* import */ var _version_js__rspack_import_3_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_3);
/*
  Copyright 2019 Google LLC
  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/




/**
 * Add a `fetch` listener to the service worker that will
 * respond to
 * [network requests]{@link https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers#Custom_responses_to_requests}
 * with precached assets.
 *
 * Requests for assets that aren't precached, the `FetchEvent` will not be
 * responded to, allowing the event to fall through to other `fetch` event
 * listeners.
 *
 * @param {Object} [options] See the {@link workbox-precaching.PrecacheRoute}
 * options.
 *
 * @memberof workbox-precaching
 */
function addRoute(options) {
    const precacheController = (0,_utils_getOrCreatePrecacheController_js__rspack_import_1.getOrCreatePrecacheController)();
    const precacheRoute = new _PrecacheRoute_js__rspack_import_2.PrecacheRoute(precacheController, options);
    (0,workbox_routing_registerRoute_js__rspack_import_0.registerRoute)(precacheRoute);
}



},
"../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/cleanupOutdatedCaches.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  cleanupOutdatedCaches: () => (cleanupOutdatedCaches)
});
/* import */ var workbox_core_private_cacheNames_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/cacheNames.js");
/* import */ var workbox_core_private_logger_js__rspack_import_1 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/logger.js");
/* import */ var _utils_deleteOutdatedCaches_js__rspack_import_2 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/utils/deleteOutdatedCaches.js");
/* import */ var _version_js__rspack_import_3 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/_version.js");
/* import */ var _version_js__rspack_import_3_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_3);
/*
  Copyright 2019 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/




/**
 * Adds an `activate` event listener which will clean up incompatible
 * precaches that were created by older versions of Workbox.
 *
 * @memberof workbox-precaching
 */
function cleanupOutdatedCaches() {
    // See https://github.com/Microsoft/TypeScript/issues/28357#issuecomment-436484705
    self.addEventListener('activate', ((event) => {
        const cacheName = workbox_core_private_cacheNames_js__rspack_import_0.cacheNames.getPrecacheName();
        event.waitUntil((0,_utils_deleteOutdatedCaches_js__rspack_import_2.deleteOutdatedCaches)(cacheName).then((cachesDeleted) => {
            if (true) {
                if (cachesDeleted.length > 0) {
                    workbox_core_private_logger_js__rspack_import_1.logger.log(`The following out-of-date precaches were cleaned up ` +
                        `automatically:`, cachesDeleted);
                }
            }
        }));
    }));
}



},
"../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/createHandlerBoundToURL.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  createHandlerBoundToURL: () => (createHandlerBoundToURL)
});
/* import */ var _utils_getOrCreatePrecacheController_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/utils/getOrCreatePrecacheController.js");
/* import */ var _version_js__rspack_import_1 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/_version.js");
/* import */ var _version_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_1);
/*
  Copyright 2019 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


/**
 * Helper function that calls
 * {@link PrecacheController#createHandlerBoundToURL} on the default
 * {@link PrecacheController} instance.
 *
 * If you are creating your own {@link PrecacheController}, then call the
 * {@link PrecacheController#createHandlerBoundToURL} on that instance,
 * instead of using this function.
 *
 * @param {string} url The precached URL which will be used to lookup the
 * `Response`.
 * @param {boolean} [fallbackToNetwork=true] Whether to attempt to get the
 * response from the network if there's a precache miss.
 * @return {workbox-routing~handlerCallback}
 *
 * @memberof workbox-precaching
 */
function createHandlerBoundToURL(url) {
    const precacheController = (0,_utils_getOrCreatePrecacheController_js__rspack_import_0.getOrCreatePrecacheController)();
    return precacheController.createHandlerBoundToURL(url);
}



},
"../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/getCacheKeyForURL.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  getCacheKeyForURL: () => (getCacheKeyForURL)
});
/* import */ var _utils_getOrCreatePrecacheController_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/utils/getOrCreatePrecacheController.js");
/* import */ var _version_js__rspack_import_1 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/_version.js");
/* import */ var _version_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_1);
/*
  Copyright 2019 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


/**
 * Takes in a URL, and returns the corresponding URL that could be used to
 * lookup the entry in the precache.
 *
 * If a relative URL is provided, the location of the service worker file will
 * be used as the base.
 *
 * For precached entries without revision information, the cache key will be the
 * same as the original URL.
 *
 * For precached entries with revision information, the cache key will be the
 * original URL with the addition of a query parameter used for keeping track of
 * the revision info.
 *
 * @param {string} url The URL whose cache key to look up.
 * @return {string} The cache key that corresponds to that URL.
 *
 * @memberof workbox-precaching
 */
function getCacheKeyForURL(url) {
    const precacheController = (0,_utils_getOrCreatePrecacheController_js__rspack_import_0.getOrCreatePrecacheController)();
    return precacheController.getCacheKeyForURL(url);
}



},
"../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/index.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  PrecacheController: () => (/* reexport safe */ _PrecacheController_js__rspack_import_8.PrecacheController),
  PrecacheFallbackPlugin: () => (/* reexport safe */ _PrecacheFallbackPlugin_js__rspack_import_11.PrecacheFallbackPlugin),
  PrecacheRoute: () => (/* reexport safe */ _PrecacheRoute_js__rspack_import_9.PrecacheRoute),
  PrecacheStrategy: () => (/* reexport safe */ _PrecacheStrategy_js__rspack_import_10.PrecacheStrategy),
  addPlugins: () => (/* reexport safe */ _addPlugins_js__rspack_import_0.addPlugins),
  addRoute: () => (/* reexport safe */ _addRoute_js__rspack_import_1.addRoute),
  cleanupOutdatedCaches: () => (/* reexport safe */ _cleanupOutdatedCaches_js__rspack_import_2.cleanupOutdatedCaches),
  createHandlerBoundToURL: () => (/* reexport safe */ _createHandlerBoundToURL_js__rspack_import_3.createHandlerBoundToURL),
  getCacheKeyForURL: () => (/* reexport safe */ _getCacheKeyForURL_js__rspack_import_4.getCacheKeyForURL),
  matchPrecache: () => (/* reexport safe */ _matchPrecache_js__rspack_import_5.matchPrecache),
  precache: () => (/* reexport safe */ _precache_js__rspack_import_6.precache),
  precacheAndRoute: () => (/* reexport safe */ _precacheAndRoute_js__rspack_import_7.precacheAndRoute)
});
/* import */ var _addPlugins_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/addPlugins.js");
/* import */ var _addRoute_js__rspack_import_1 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/addRoute.js");
/* import */ var _cleanupOutdatedCaches_js__rspack_import_2 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/cleanupOutdatedCaches.js");
/* import */ var _createHandlerBoundToURL_js__rspack_import_3 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/createHandlerBoundToURL.js");
/* import */ var _getCacheKeyForURL_js__rspack_import_4 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/getCacheKeyForURL.js");
/* import */ var _matchPrecache_js__rspack_import_5 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/matchPrecache.js");
/* import */ var _precache_js__rspack_import_6 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/precache.js");
/* import */ var _precacheAndRoute_js__rspack_import_7 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/precacheAndRoute.js");
/* import */ var _PrecacheController_js__rspack_import_8 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/PrecacheController.js");
/* import */ var _PrecacheRoute_js__rspack_import_9 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/PrecacheRoute.js");
/* import */ var _PrecacheStrategy_js__rspack_import_10 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/PrecacheStrategy.js");
/* import */ var _PrecacheFallbackPlugin_js__rspack_import_11 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/PrecacheFallbackPlugin.js");
/* import */ var _version_js__rspack_import_12 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/_version.js");
/* import */ var _version_js__rspack_import_12_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_12);
/* import */ var _types_js__rspack_import_13 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/_types.js");
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/













/**
 * Most consumers of this module will want to use the
 * {@link workbox-precaching.precacheAndRoute}
 * method to add assets to the cache and respond to network requests with these
 * cached assets.
 *
 * If you require more control over caching and routing, you can use the
 * {@link workbox-precaching.PrecacheController}
 * interface.
 *
 * @module workbox-precaching
 */




},
"../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/matchPrecache.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  matchPrecache: () => (matchPrecache)
});
/* import */ var _utils_getOrCreatePrecacheController_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/utils/getOrCreatePrecacheController.js");
/* import */ var _version_js__rspack_import_1 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/_version.js");
/* import */ var _version_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_1);
/*
  Copyright 2019 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


/**
 * Helper function that calls
 * {@link PrecacheController#matchPrecache} on the default
 * {@link PrecacheController} instance.
 *
 * If you are creating your own {@link PrecacheController}, then call
 * {@link PrecacheController#matchPrecache} on that instance,
 * instead of using this function.
 *
 * @param {string|Request} request The key (without revisioning parameters)
 * to look up in the precache.
 * @return {Promise<Response|undefined>}
 *
 * @memberof workbox-precaching
 */
function matchPrecache(request) {
    const precacheController = (0,_utils_getOrCreatePrecacheController_js__rspack_import_0.getOrCreatePrecacheController)();
    return precacheController.matchPrecache(request);
}



},
"../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/precache.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  precache: () => (precache)
});
/* import */ var _utils_getOrCreatePrecacheController_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/utils/getOrCreatePrecacheController.js");
/* import */ var _version_js__rspack_import_1 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/_version.js");
/* import */ var _version_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_1);
/*
  Copyright 2019 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


/**
 * Adds items to the precache list, removing any duplicates and
 * stores the files in the
 * {@link workbox-core.cacheNames|"precache cache"} when the service
 * worker installs.
 *
 * This method can be called multiple times.
 *
 * Please note: This method **will not** serve any of the cached files for you.
 * It only precaches files. To respond to a network request you call
 * {@link workbox-precaching.addRoute}.
 *
 * If you have a single array of files to precache, you can just call
 * {@link workbox-precaching.precacheAndRoute}.
 *
 * @param {Array<Object|string>} [entries=[]] Array of entries to precache.
 *
 * @memberof workbox-precaching
 */
function precache(entries) {
    const precacheController = (0,_utils_getOrCreatePrecacheController_js__rspack_import_0.getOrCreatePrecacheController)();
    precacheController.precache(entries);
}



},
"../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/precacheAndRoute.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  precacheAndRoute: () => (precacheAndRoute)
});
/* import */ var _addRoute_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/addRoute.js");
/* import */ var _precache_js__rspack_import_1 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/precache.js");
/* import */ var _version_js__rspack_import_2 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/_version.js");
/* import */ var _version_js__rspack_import_2_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_2);
/*
  Copyright 2019 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/



/**
 * This method will add entries to the precache list and add a route to
 * respond to fetch events.
 *
 * This is a convenience method that will call
 * {@link workbox-precaching.precache} and
 * {@link workbox-precaching.addRoute} in a single call.
 *
 * @param {Array<Object|string>} entries Array of entries to precache.
 * @param {Object} [options] See the
 * {@link workbox-precaching.PrecacheRoute} options.
 *
 * @memberof workbox-precaching
 */
function precacheAndRoute(entries, options) {
    (0,_precache_js__rspack_import_1.precache)(entries);
    (0,_addRoute_js__rspack_import_0.addRoute)(options);
}



},
"../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/utils/PrecacheCacheKeyPlugin.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  PrecacheCacheKeyPlugin: () => (PrecacheCacheKeyPlugin)
});
/* import */ var _version_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/_version.js");
/* import */ var _version_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_0);
/*
  Copyright 2020 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

/**
 * A plugin, designed to be used with PrecacheController, to translate URLs into
 * the corresponding cache key, based on the current revision info.
 *
 * @private
 */
class PrecacheCacheKeyPlugin {
    constructor({ precacheController }) {
        this.cacheKeyWillBeUsed = async ({ request, params, }) => {
            // Params is type any, can't change right now.
            /* eslint-disable */
            const cacheKey = (params === null || params === void 0 ? void 0 : params.cacheKey) ||
                this._precacheController.getCacheKeyForURL(request.url);
            /* eslint-enable */
            return cacheKey
                ? new Request(cacheKey, { headers: request.headers })
                : request;
        };
        this._precacheController = precacheController;
    }
}



},
"../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/utils/PrecacheInstallReportPlugin.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  PrecacheInstallReportPlugin: () => (PrecacheInstallReportPlugin)
});
/* import */ var _version_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/_version.js");
/* import */ var _version_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_0);
/*
  Copyright 2020 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

/**
 * A plugin, designed to be used with PrecacheController, to determine the
 * of assets that were updated (or not updated) during the install event.
 *
 * @private
 */
class PrecacheInstallReportPlugin {
    constructor() {
        this.updatedURLs = [];
        this.notUpdatedURLs = [];
        this.handlerWillStart = async ({ request, state, }) => {
            // TODO: `state` should never be undefined...
            if (state) {
                state.originalRequest = request;
            }
        };
        this.cachedResponseWillBeUsed = async ({ event, state, cachedResponse, }) => {
            if (event.type === 'install') {
                if (state &&
                    state.originalRequest &&
                    state.originalRequest instanceof Request) {
                    // TODO: `state` should never be undefined...
                    const url = state.originalRequest.url;
                    if (cachedResponse) {
                        this.notUpdatedURLs.push(url);
                    }
                    else {
                        this.updatedURLs.push(url);
                    }
                }
            }
            return cachedResponse;
        };
    }
}



},
"../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/utils/createCacheKey.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  createCacheKey: () => (createCacheKey)
});
/* import */ var workbox_core_private_WorkboxError_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/WorkboxError.js");
/* import */ var _version_js__rspack_import_1 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/_version.js");
/* import */ var _version_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_1);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


// Name of the search parameter used to store revision info.
const REVISION_SEARCH_PARAM = '__WB_REVISION__';
/**
 * Converts a manifest entry into a versioned URL suitable for precaching.
 *
 * @param {Object|string} entry
 * @return {string} A URL with versioning info.
 *
 * @private
 * @memberof workbox-precaching
 */
function createCacheKey(entry) {
    if (!entry) {
        throw new workbox_core_private_WorkboxError_js__rspack_import_0.WorkboxError('add-to-cache-list-unexpected-type', { entry });
    }
    // If a precache manifest entry is a string, it's assumed to be a versioned
    // URL, like '/app.abcd1234.js'. Return as-is.
    if (typeof entry === 'string') {
        const urlObject = new URL(entry, location.href);
        return {
            cacheKey: urlObject.href,
            url: urlObject.href,
        };
    }
    const { revision, url } = entry;
    if (!url) {
        throw new workbox_core_private_WorkboxError_js__rspack_import_0.WorkboxError('add-to-cache-list-unexpected-type', { entry });
    }
    // If there's just a URL and no revision, then it's also assumed to be a
    // versioned URL.
    if (!revision) {
        const urlObject = new URL(url, location.href);
        return {
            cacheKey: urlObject.href,
            url: urlObject.href,
        };
    }
    // Otherwise, construct a properly versioned URL using the custom Workbox
    // search parameter along with the revision info.
    const cacheKeyURL = new URL(url, location.href);
    const originalURL = new URL(url, location.href);
    cacheKeyURL.searchParams.set(REVISION_SEARCH_PARAM, revision);
    return {
        cacheKey: cacheKeyURL.href,
        url: originalURL.href,
    };
}


},
"../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/utils/deleteOutdatedCaches.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  deleteOutdatedCaches: () => (deleteOutdatedCaches)
});
/* import */ var _version_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/_version.js");
/* import */ var _version_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_0);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

const SUBSTRING_TO_FIND = '-precache-';
/**
 * Cleans up incompatible precaches that were created by older versions of
 * Workbox, by a service worker registered under the current scope.
 *
 * This is meant to be called as part of the `activate` event.
 *
 * This should be safe to use as long as you don't include `substringToFind`
 * (defaulting to `-precache-`) in your non-precache cache names.
 *
 * @param {string} currentPrecacheName The cache name currently in use for
 * precaching. This cache won't be deleted.
 * @param {string} [substringToFind='-precache-'] Cache names which include this
 * substring will be deleted (excluding `currentPrecacheName`).
 * @return {Array<string>} A list of all the cache names that were deleted.
 *
 * @private
 * @memberof workbox-precaching
 */
const deleteOutdatedCaches = async (currentPrecacheName, substringToFind = SUBSTRING_TO_FIND) => {
    const cacheNames = await self.caches.keys();
    const cacheNamesToDelete = cacheNames.filter((cacheName) => {
        return (cacheName.includes(substringToFind) &&
            cacheName.includes(self.registration.scope) &&
            cacheName !== currentPrecacheName);
    });
    await Promise.all(cacheNamesToDelete.map((cacheName) => self.caches.delete(cacheName)));
    return cacheNamesToDelete;
};



},
"../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/utils/generateURLVariations.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  generateURLVariations: () => (generateURLVariations)
});
/* import */ var _removeIgnoredSearchParams_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/utils/removeIgnoredSearchParams.js");
/* import */ var _version_js__rspack_import_1 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/_version.js");
/* import */ var _version_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_1);
/*
  Copyright 2019 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


/**
 * Generator function that yields possible variations on the original URL to
 * check, one at a time.
 *
 * @param {string} url
 * @param {Object} options
 *
 * @private
 * @memberof workbox-precaching
 */
function* generateURLVariations(url, { ignoreURLParametersMatching = [/^utm_/, /^fbclid$/], directoryIndex = 'index.html', cleanURLs = true, urlManipulation, } = {}) {
    const urlObject = new URL(url, location.href);
    urlObject.hash = '';
    yield urlObject.href;
    const urlWithoutIgnoredParams = (0,_removeIgnoredSearchParams_js__rspack_import_0.removeIgnoredSearchParams)(urlObject, ignoreURLParametersMatching);
    yield urlWithoutIgnoredParams.href;
    if (directoryIndex && urlWithoutIgnoredParams.pathname.endsWith('/')) {
        const directoryURL = new URL(urlWithoutIgnoredParams.href);
        directoryURL.pathname += directoryIndex;
        yield directoryURL.href;
    }
    if (cleanURLs) {
        const cleanURL = new URL(urlWithoutIgnoredParams.href);
        cleanURL.pathname += '.html';
        yield cleanURL.href;
    }
    if (urlManipulation) {
        const additionalURLs = urlManipulation({ url: urlObject });
        for (const urlToAttempt of additionalURLs) {
            yield urlToAttempt.href;
        }
    }
}


},
"../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/utils/getOrCreatePrecacheController.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  getOrCreatePrecacheController: () => (getOrCreatePrecacheController)
});
/* import */ var _PrecacheController_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/PrecacheController.js");
/* import */ var _version_js__rspack_import_1 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/_version.js");
/* import */ var _version_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_1);
/*
  Copyright 2019 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


let precacheController;
/**
 * @return {PrecacheController}
 * @private
 */
const getOrCreatePrecacheController = () => {
    if (!precacheController) {
        precacheController = new _PrecacheController_js__rspack_import_0.PrecacheController();
    }
    return precacheController;
};


},
"../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/utils/printCleanupDetails.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  printCleanupDetails: () => (printCleanupDetails)
});
/* import */ var workbox_core_private_logger_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/logger.js");
/* import */ var _version_js__rspack_import_1 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/_version.js");
/* import */ var _version_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_1);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


/**
 * @param {string} groupTitle
 * @param {Array<string>} deletedURLs
 *
 * @private
 */
const logGroup = (groupTitle, deletedURLs) => {
    workbox_core_private_logger_js__rspack_import_0.logger.groupCollapsed(groupTitle);
    for (const url of deletedURLs) {
        workbox_core_private_logger_js__rspack_import_0.logger.log(url);
    }
    workbox_core_private_logger_js__rspack_import_0.logger.groupEnd();
};
/**
 * @param {Array<string>} deletedURLs
 *
 * @private
 * @memberof workbox-precaching
 */
function printCleanupDetails(deletedURLs) {
    const deletionCount = deletedURLs.length;
    if (deletionCount > 0) {
        workbox_core_private_logger_js__rspack_import_0.logger.groupCollapsed(`During precaching cleanup, ` +
            `${deletionCount} cached ` +
            `request${deletionCount === 1 ? ' was' : 's were'} deleted.`);
        logGroup('Deleted Cache Requests', deletedURLs);
        workbox_core_private_logger_js__rspack_import_0.logger.groupEnd();
    }
}


},
"../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/utils/printInstallDetails.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  printInstallDetails: () => (printInstallDetails)
});
/* import */ var workbox_core_private_logger_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/logger.js");
/* import */ var _version_js__rspack_import_1 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/_version.js");
/* import */ var _version_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_1);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


/**
 * @param {string} groupTitle
 * @param {Array<string>} urls
 *
 * @private
 */
function _nestedGroup(groupTitle, urls) {
    if (urls.length === 0) {
        return;
    }
    workbox_core_private_logger_js__rspack_import_0.logger.groupCollapsed(groupTitle);
    for (const url of urls) {
        workbox_core_private_logger_js__rspack_import_0.logger.log(url);
    }
    workbox_core_private_logger_js__rspack_import_0.logger.groupEnd();
}
/**
 * @param {Array<string>} urlsToPrecache
 * @param {Array<string>} urlsAlreadyPrecached
 *
 * @private
 * @memberof workbox-precaching
 */
function printInstallDetails(urlsToPrecache, urlsAlreadyPrecached) {
    const precachedCount = urlsToPrecache.length;
    const alreadyPrecachedCount = urlsAlreadyPrecached.length;
    if (precachedCount || alreadyPrecachedCount) {
        let message = `Precaching ${precachedCount} file${precachedCount === 1 ? '' : 's'}.`;
        if (alreadyPrecachedCount > 0) {
            message +=
                ` ${alreadyPrecachedCount} ` +
                    `file${alreadyPrecachedCount === 1 ? ' is' : 's are'} already cached.`;
        }
        workbox_core_private_logger_js__rspack_import_0.logger.groupCollapsed(message);
        _nestedGroup(`View newly precached URLs.`, urlsToPrecache);
        _nestedGroup(`View previously precached URLs.`, urlsAlreadyPrecached);
        workbox_core_private_logger_js__rspack_import_0.logger.groupEnd();
    }
}


},
"../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/utils/removeIgnoredSearchParams.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  removeIgnoredSearchParams: () => (removeIgnoredSearchParams)
});
/* import */ var _version_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/_version.js");
/* import */ var _version_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_0);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

/**
 * Removes any URL search parameters that should be ignored.
 *
 * @param {URL} urlObject The original URL.
 * @param {Array<RegExp>} ignoreURLParametersMatching RegExps to test against
 * each search parameter name. Matches mean that the search parameter should be
 * ignored.
 * @return {URL} The URL with any ignored search parameters removed.
 *
 * @private
 * @memberof workbox-precaching
 */
function removeIgnoredSearchParams(urlObject, ignoreURLParametersMatching = []) {
    // Convert the iterable into an array at the start of the loop to make sure
    // deletion doesn't mess up iteration.
    for (const paramName of [...urlObject.searchParams.keys()]) {
        if (ignoreURLParametersMatching.some((regExp) => regExp.test(paramName))) {
            urlObject.searchParams.delete(paramName);
        }
    }
    return urlObject;
}


},
"../../node_modules/.pnpm/workbox-routing@7.3.0/node_modules/workbox-routing/RegExpRoute.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  RegExpRoute: () => (RegExpRoute)
});
/* import */ var workbox_core_private_assert_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/assert.js");
/* import */ var workbox_core_private_logger_js__rspack_import_1 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/logger.js");
/* import */ var _Route_js__rspack_import_2 = __webpack_require__("../../node_modules/.pnpm/workbox-routing@7.3.0/node_modules/workbox-routing/Route.js");
/* import */ var _version_js__rspack_import_3 = __webpack_require__("../../node_modules/.pnpm/workbox-routing@7.3.0/node_modules/workbox-routing/_version.js");
/* import */ var _version_js__rspack_import_3_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_3);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/




/**
 * RegExpRoute makes it easy to create a regular expression based
 * {@link workbox-routing.Route}.
 *
 * For same-origin requests the RegExp only needs to match part of the URL. For
 * requests against third-party servers, you must define a RegExp that matches
 * the start of the URL.
 *
 * @memberof workbox-routing
 * @extends workbox-routing.Route
 */
class RegExpRoute extends _Route_js__rspack_import_2.Route {
    /**
     * If the regular expression contains
     * [capture groups]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp#grouping-back-references},
     * the captured values will be passed to the
     * {@link workbox-routing~handlerCallback} `params`
     * argument.
     *
     * @param {RegExp} regExp The regular expression to match against URLs.
     * @param {workbox-routing~handlerCallback} handler A callback
     * function that returns a Promise resulting in a Response.
     * @param {string} [method='GET'] The HTTP method to match the Route
     * against.
     */
    constructor(regExp, handler, method) {
        if (true) {
            workbox_core_private_assert_js__rspack_import_0.assert.isInstance(regExp, RegExp, {
                moduleName: 'workbox-routing',
                className: 'RegExpRoute',
                funcName: 'constructor',
                paramName: 'pattern',
            });
        }
        const match = ({ url }) => {
            const result = regExp.exec(url.href);
            // Return immediately if there's no match.
            if (!result) {
                return;
            }
            // Require that the match start at the first character in the URL string
            // if it's a cross-origin request.
            // See https://github.com/GoogleChrome/workbox/issues/281 for the context
            // behind this behavior.
            if (url.origin !== location.origin && result.index !== 0) {
                if (true) {
                    workbox_core_private_logger_js__rspack_import_1.logger.debug(`The regular expression '${regExp.toString()}' only partially matched ` +
                        `against the cross-origin URL '${url.toString()}'. RegExpRoute's will only ` +
                        `handle cross-origin requests if they match the entire URL.`);
                }
                return;
            }
            // If the route matches, but there aren't any capture groups defined, then
            // this will return [], which is truthy and therefore sufficient to
            // indicate a match.
            // If there are capture groups, then it will return their values.
            return result.slice(1);
        };
        super(match, handler, method);
    }
}



},
"../../node_modules/.pnpm/workbox-routing@7.3.0/node_modules/workbox-routing/Route.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  Route: () => (Route)
});
/* import */ var workbox_core_private_assert_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/assert.js");
/* import */ var _utils_constants_js__rspack_import_1 = __webpack_require__("../../node_modules/.pnpm/workbox-routing@7.3.0/node_modules/workbox-routing/utils/constants.js");
/* import */ var _utils_normalizeHandler_js__rspack_import_2 = __webpack_require__("../../node_modules/.pnpm/workbox-routing@7.3.0/node_modules/workbox-routing/utils/normalizeHandler.js");
/* import */ var _version_js__rspack_import_3 = __webpack_require__("../../node_modules/.pnpm/workbox-routing@7.3.0/node_modules/workbox-routing/_version.js");
/* import */ var _version_js__rspack_import_3_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_3);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/




/**
 * A `Route` consists of a pair of callback functions, "match" and "handler".
 * The "match" callback determine if a route should be used to "handle" a
 * request by returning a non-falsy value if it can. The "handler" callback
 * is called when there is a match and should return a Promise that resolves
 * to a `Response`.
 *
 * @memberof workbox-routing
 */
class Route {
    /**
     * Constructor for Route class.
     *
     * @param {workbox-routing~matchCallback} match
     * A callback function that determines whether the route matches a given
     * `fetch` event by returning a non-falsy value.
     * @param {workbox-routing~handlerCallback} handler A callback
     * function that returns a Promise resolving to a Response.
     * @param {string} [method='GET'] The HTTP method to match the Route
     * against.
     */
    constructor(match, handler, method = _utils_constants_js__rspack_import_1.defaultMethod) {
        if (true) {
            workbox_core_private_assert_js__rspack_import_0.assert.isType(match, 'function', {
                moduleName: 'workbox-routing',
                className: 'Route',
                funcName: 'constructor',
                paramName: 'match',
            });
            if (method) {
                workbox_core_private_assert_js__rspack_import_0.assert.isOneOf(method, _utils_constants_js__rspack_import_1.validMethods, { paramName: 'method' });
            }
        }
        // These values are referenced directly by Router so cannot be
        // altered by minificaton.
        this.handler = (0,_utils_normalizeHandler_js__rspack_import_2.normalizeHandler)(handler);
        this.match = match;
        this.method = method;
    }
    /**
     *
     * @param {workbox-routing-handlerCallback} handler A callback
     * function that returns a Promise resolving to a Response
     */
    setCatchHandler(handler) {
        this.catchHandler = (0,_utils_normalizeHandler_js__rspack_import_2.normalizeHandler)(handler);
    }
}



},
"../../node_modules/.pnpm/workbox-routing@7.3.0/node_modules/workbox-routing/Router.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  Router: () => (Router)
});
/* import */ var workbox_core_private_assert_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/assert.js");
/* import */ var workbox_core_private_getFriendlyURL_js__rspack_import_1 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/getFriendlyURL.js");
/* import */ var _utils_constants_js__rspack_import_2 = __webpack_require__("../../node_modules/.pnpm/workbox-routing@7.3.0/node_modules/workbox-routing/utils/constants.js");
/* import */ var workbox_core_private_logger_js__rspack_import_3 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/logger.js");
/* import */ var _utils_normalizeHandler_js__rspack_import_4 = __webpack_require__("../../node_modules/.pnpm/workbox-routing@7.3.0/node_modules/workbox-routing/utils/normalizeHandler.js");
/* import */ var workbox_core_private_WorkboxError_js__rspack_import_5 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/WorkboxError.js");
/* import */ var _version_js__rspack_import_6 = __webpack_require__("../../node_modules/.pnpm/workbox-routing@7.3.0/node_modules/workbox-routing/_version.js");
/* import */ var _version_js__rspack_import_6_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_6);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/







/**
 * The Router can be used to process a `FetchEvent` using one or more
 * {@link workbox-routing.Route}, responding with a `Response` if
 * a matching route exists.
 *
 * If no route matches a given a request, the Router will use a "default"
 * handler if one is defined.
 *
 * Should the matching Route throw an error, the Router will use a "catch"
 * handler if one is defined to gracefully deal with issues and respond with a
 * Request.
 *
 * If a request matches multiple routes, the **earliest** registered route will
 * be used to respond to the request.
 *
 * @memberof workbox-routing
 */
class Router {
    /**
     * Initializes a new Router.
     */
    constructor() {
        this._routes = new Map();
        this._defaultHandlerMap = new Map();
    }
    /**
     * @return {Map<string, Array<workbox-routing.Route>>} routes A `Map` of HTTP
     * method name ('GET', etc.) to an array of all the corresponding `Route`
     * instances that are registered.
     */
    get routes() {
        return this._routes;
    }
    /**
     * Adds a fetch event listener to respond to events when a route matches
     * the event's request.
     */
    addFetchListener() {
        // See https://github.com/Microsoft/TypeScript/issues/28357#issuecomment-436484705
        self.addEventListener('fetch', ((event) => {
            const { request } = event;
            const responsePromise = this.handleRequest({ request, event });
            if (responsePromise) {
                event.respondWith(responsePromise);
            }
        }));
    }
    /**
     * Adds a message event listener for URLs to cache from the window.
     * This is useful to cache resources loaded on the page prior to when the
     * service worker started controlling it.
     *
     * The format of the message data sent from the window should be as follows.
     * Where the `urlsToCache` array may consist of URL strings or an array of
     * URL string + `requestInit` object (the same as you'd pass to `fetch()`).
     *
     * ```
     * {
     *   type: 'CACHE_URLS',
     *   payload: {
     *     urlsToCache: [
     *       './script1.js',
     *       './script2.js',
     *       ['./script3.js', {mode: 'no-cors'}],
     *     ],
     *   },
     * }
     * ```
     */
    addCacheListener() {
        // See https://github.com/Microsoft/TypeScript/issues/28357#issuecomment-436484705
        self.addEventListener('message', ((event) => {
            // event.data is type 'any'
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (event.data && event.data.type === 'CACHE_URLS') {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const { payload } = event.data;
                if (true) {
                    workbox_core_private_logger_js__rspack_import_3.logger.debug(`Caching URLs from the window`, payload.urlsToCache);
                }
                const requestPromises = Promise.all(payload.urlsToCache.map((entry) => {
                    if (typeof entry === 'string') {
                        entry = [entry];
                    }
                    const request = new Request(...entry);
                    return this.handleRequest({ request, event });
                    // TODO(philipwalton): TypeScript errors without this typecast for
                    // some reason (probably a bug). The real type here should work but
                    // doesn't: `Array<Promise<Response> | undefined>`.
                })); // TypeScript
                event.waitUntil(requestPromises);
                // If a MessageChannel was used, reply to the message on success.
                if (event.ports && event.ports[0]) {
                    void requestPromises.then(() => event.ports[0].postMessage(true));
                }
            }
        }));
    }
    /**
     * Apply the routing rules to a FetchEvent object to get a Response from an
     * appropriate Route's handler.
     *
     * @param {Object} options
     * @param {Request} options.request The request to handle.
     * @param {ExtendableEvent} options.event The event that triggered the
     *     request.
     * @return {Promise<Response>|undefined} A promise is returned if a
     *     registered route can handle the request. If there is no matching
     *     route and there's no `defaultHandler`, `undefined` is returned.
     */
    handleRequest({ request, event, }) {
        if (true) {
            workbox_core_private_assert_js__rspack_import_0.assert.isInstance(request, Request, {
                moduleName: 'workbox-routing',
                className: 'Router',
                funcName: 'handleRequest',
                paramName: 'options.request',
            });
        }
        const url = new URL(request.url, location.href);
        if (!url.protocol.startsWith('http')) {
            if (true) {
                workbox_core_private_logger_js__rspack_import_3.logger.debug(`Workbox Router only supports URLs that start with 'http'.`);
            }
            return;
        }
        const sameOrigin = url.origin === location.origin;
        const { params, route } = this.findMatchingRoute({
            event,
            request,
            sameOrigin,
            url,
        });
        let handler = route && route.handler;
        const debugMessages = [];
        if (true) {
            if (handler) {
                debugMessages.push([`Found a route to handle this request:`, route]);
                if (params) {
                    debugMessages.push([
                        `Passing the following params to the route's handler:`,
                        params,
                    ]);
                }
            }
        }
        // If we don't have a handler because there was no matching route, then
        // fall back to defaultHandler if that's defined.
        const method = request.method;
        if (!handler && this._defaultHandlerMap.has(method)) {
            if (true) {
                debugMessages.push(`Failed to find a matching route. Falling ` +
                    `back to the default handler for ${method}.`);
            }
            handler = this._defaultHandlerMap.get(method);
        }
        if (!handler) {
            if (true) {
                // No handler so Workbox will do nothing. If logs is set of debug
                // i.e. verbose, we should print out this information.
                workbox_core_private_logger_js__rspack_import_3.logger.debug(`No route found for: ${(0,workbox_core_private_getFriendlyURL_js__rspack_import_1.getFriendlyURL)(url)}`);
            }
            return;
        }
        if (true) {
            // We have a handler, meaning Workbox is going to handle the route.
            // print the routing details to the console.
            workbox_core_private_logger_js__rspack_import_3.logger.groupCollapsed(`Router is responding to: ${(0,workbox_core_private_getFriendlyURL_js__rspack_import_1.getFriendlyURL)(url)}`);
            debugMessages.forEach((msg) => {
                if (Array.isArray(msg)) {
                    workbox_core_private_logger_js__rspack_import_3.logger.log(...msg);
                }
                else {
                    workbox_core_private_logger_js__rspack_import_3.logger.log(msg);
                }
            });
            workbox_core_private_logger_js__rspack_import_3.logger.groupEnd();
        }
        // Wrap in try and catch in case the handle method throws a synchronous
        // error. It should still callback to the catch handler.
        let responsePromise;
        try {
            responsePromise = handler.handle({ url, request, event, params });
        }
        catch (err) {
            responsePromise = Promise.reject(err);
        }
        // Get route's catch handler, if it exists
        const catchHandler = route && route.catchHandler;
        if (responsePromise instanceof Promise &&
            (this._catchHandler || catchHandler)) {
            responsePromise = responsePromise.catch(async (err) => {
                // If there's a route catch handler, process that first
                if (catchHandler) {
                    if (true) {
                        // Still include URL here as it will be async from the console group
                        // and may not make sense without the URL
                        workbox_core_private_logger_js__rspack_import_3.logger.groupCollapsed(`Error thrown when responding to: ` +
                            ` ${(0,workbox_core_private_getFriendlyURL_js__rspack_import_1.getFriendlyURL)(url)}. Falling back to route's Catch Handler.`);
                        workbox_core_private_logger_js__rspack_import_3.logger.error(`Error thrown by:`, route);
                        workbox_core_private_logger_js__rspack_import_3.logger.error(err);
                        workbox_core_private_logger_js__rspack_import_3.logger.groupEnd();
                    }
                    try {
                        return await catchHandler.handle({ url, request, event, params });
                    }
                    catch (catchErr) {
                        if (catchErr instanceof Error) {
                            err = catchErr;
                        }
                    }
                }
                if (this._catchHandler) {
                    if (true) {
                        // Still include URL here as it will be async from the console group
                        // and may not make sense without the URL
                        workbox_core_private_logger_js__rspack_import_3.logger.groupCollapsed(`Error thrown when responding to: ` +
                            ` ${(0,workbox_core_private_getFriendlyURL_js__rspack_import_1.getFriendlyURL)(url)}. Falling back to global Catch Handler.`);
                        workbox_core_private_logger_js__rspack_import_3.logger.error(`Error thrown by:`, route);
                        workbox_core_private_logger_js__rspack_import_3.logger.error(err);
                        workbox_core_private_logger_js__rspack_import_3.logger.groupEnd();
                    }
                    return this._catchHandler.handle({ url, request, event });
                }
                throw err;
            });
        }
        return responsePromise;
    }
    /**
     * Checks a request and URL (and optionally an event) against the list of
     * registered routes, and if there's a match, returns the corresponding
     * route along with any params generated by the match.
     *
     * @param {Object} options
     * @param {URL} options.url
     * @param {boolean} options.sameOrigin The result of comparing `url.origin`
     *     against the current origin.
     * @param {Request} options.request The request to match.
     * @param {Event} options.event The corresponding event.
     * @return {Object} An object with `route` and `params` properties.
     *     They are populated if a matching route was found or `undefined`
     *     otherwise.
     */
    findMatchingRoute({ url, sameOrigin, request, event, }) {
        const routes = this._routes.get(request.method) || [];
        for (const route of routes) {
            let params;
            // route.match returns type any, not possible to change right now.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const matchResult = route.match({ url, sameOrigin, request, event });
            if (matchResult) {
                if (true) {
                    // Warn developers that using an async matchCallback is almost always
                    // not the right thing to do.
                    if (matchResult instanceof Promise) {
                        workbox_core_private_logger_js__rspack_import_3.logger.warn(`While routing ${(0,workbox_core_private_getFriendlyURL_js__rspack_import_1.getFriendlyURL)(url)}, an async ` +
                            `matchCallback function was used. Please convert the ` +
                            `following route to use a synchronous matchCallback function:`, route);
                    }
                }
                // See https://github.com/GoogleChrome/workbox/issues/2079
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                params = matchResult;
                if (Array.isArray(params) && params.length === 0) {
                    // Instead of passing an empty array in as params, use undefined.
                    params = undefined;
                }
                else if (matchResult.constructor === Object && // eslint-disable-line
                    Object.keys(matchResult).length === 0) {
                    // Instead of passing an empty object in as params, use undefined.
                    params = undefined;
                }
                else if (typeof matchResult === 'boolean') {
                    // For the boolean value true (rather than just something truth-y),
                    // don't set params.
                    // See https://github.com/GoogleChrome/workbox/pull/2134#issuecomment-513924353
                    params = undefined;
                }
                // Return early if have a match.
                return { route, params };
            }
        }
        // If no match was found above, return and empty object.
        return {};
    }
    /**
     * Define a default `handler` that's called when no routes explicitly
     * match the incoming request.
     *
     * Each HTTP method ('GET', 'POST', etc.) gets its own default handler.
     *
     * Without a default handler, unmatched requests will go against the
     * network as if there were no service worker present.
     *
     * @param {workbox-routing~handlerCallback} handler A callback
     * function that returns a Promise resulting in a Response.
     * @param {string} [method='GET'] The HTTP method to associate with this
     * default handler. Each method has its own default.
     */
    setDefaultHandler(handler, method = _utils_constants_js__rspack_import_2.defaultMethod) {
        this._defaultHandlerMap.set(method, (0,_utils_normalizeHandler_js__rspack_import_4.normalizeHandler)(handler));
    }
    /**
     * If a Route throws an error while handling a request, this `handler`
     * will be called and given a chance to provide a response.
     *
     * @param {workbox-routing~handlerCallback} handler A callback
     * function that returns a Promise resulting in a Response.
     */
    setCatchHandler(handler) {
        this._catchHandler = (0,_utils_normalizeHandler_js__rspack_import_4.normalizeHandler)(handler);
    }
    /**
     * Registers a route with the router.
     *
     * @param {workbox-routing.Route} route The route to register.
     */
    registerRoute(route) {
        if (true) {
            workbox_core_private_assert_js__rspack_import_0.assert.isType(route, 'object', {
                moduleName: 'workbox-routing',
                className: 'Router',
                funcName: 'registerRoute',
                paramName: 'route',
            });
            workbox_core_private_assert_js__rspack_import_0.assert.hasMethod(route, 'match', {
                moduleName: 'workbox-routing',
                className: 'Router',
                funcName: 'registerRoute',
                paramName: 'route',
            });
            workbox_core_private_assert_js__rspack_import_0.assert.isType(route.handler, 'object', {
                moduleName: 'workbox-routing',
                className: 'Router',
                funcName: 'registerRoute',
                paramName: 'route',
            });
            workbox_core_private_assert_js__rspack_import_0.assert.hasMethod(route.handler, 'handle', {
                moduleName: 'workbox-routing',
                className: 'Router',
                funcName: 'registerRoute',
                paramName: 'route.handler',
            });
            workbox_core_private_assert_js__rspack_import_0.assert.isType(route.method, 'string', {
                moduleName: 'workbox-routing',
                className: 'Router',
                funcName: 'registerRoute',
                paramName: 'route.method',
            });
        }
        if (!this._routes.has(route.method)) {
            this._routes.set(route.method, []);
        }
        // Give precedence to all of the earlier routes by adding this additional
        // route to the end of the array.
        this._routes.get(route.method).push(route);
    }
    /**
     * Unregisters a route with the router.
     *
     * @param {workbox-routing.Route} route The route to unregister.
     */
    unregisterRoute(route) {
        if (!this._routes.has(route.method)) {
            throw new workbox_core_private_WorkboxError_js__rspack_import_5.WorkboxError('unregister-route-but-not-found-with-method', {
                method: route.method,
            });
        }
        const routeIndex = this._routes.get(route.method).indexOf(route);
        if (routeIndex > -1) {
            this._routes.get(route.method).splice(routeIndex, 1);
        }
        else {
            throw new workbox_core_private_WorkboxError_js__rspack_import_5.WorkboxError('unregister-route-route-not-registered');
        }
    }
}



},
"../../node_modules/.pnpm/workbox-routing@7.3.0/node_modules/workbox-routing/_version.js"() {

// @ts-ignore
try {
    self['workbox:routing:7.2.0'] && _();
}
catch (e) { }


},
"../../node_modules/.pnpm/workbox-routing@7.3.0/node_modules/workbox-routing/registerRoute.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  registerRoute: () => (registerRoute)
});
/* import */ var workbox_core_private_logger_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/logger.js");
/* import */ var workbox_core_private_WorkboxError_js__rspack_import_1 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/WorkboxError.js");
/* import */ var _Route_js__rspack_import_2 = __webpack_require__("../../node_modules/.pnpm/workbox-routing@7.3.0/node_modules/workbox-routing/Route.js");
/* import */ var _RegExpRoute_js__rspack_import_3 = __webpack_require__("../../node_modules/.pnpm/workbox-routing@7.3.0/node_modules/workbox-routing/RegExpRoute.js");
/* import */ var _utils_getOrCreateDefaultRouter_js__rspack_import_4 = __webpack_require__("../../node_modules/.pnpm/workbox-routing@7.3.0/node_modules/workbox-routing/utils/getOrCreateDefaultRouter.js");
/* import */ var _version_js__rspack_import_5 = __webpack_require__("../../node_modules/.pnpm/workbox-routing@7.3.0/node_modules/workbox-routing/_version.js");
/* import */ var _version_js__rspack_import_5_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_5);
/*
  Copyright 2019 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/






/**
 * Easily register a RegExp, string, or function with a caching
 * strategy to a singleton Router instance.
 *
 * This method will generate a Route for you if needed and
 * call {@link workbox-routing.Router#registerRoute}.
 *
 * @param {RegExp|string|workbox-routing.Route~matchCallback|workbox-routing.Route} capture
 * If the capture param is a `Route`, all other arguments will be ignored.
 * @param {workbox-routing~handlerCallback} [handler] A callback
 * function that returns a Promise resulting in a Response. This parameter
 * is required if `capture` is not a `Route` object.
 * @param {string} [method='GET'] The HTTP method to match the Route
 * against.
 * @return {workbox-routing.Route} The generated `Route`.
 *
 * @memberof workbox-routing
 */
function registerRoute(capture, handler, method) {
    let route;
    if (typeof capture === 'string') {
        const captureUrl = new URL(capture, location.href);
        if (true) {
            if (!(capture.startsWith('/') || capture.startsWith('http'))) {
                throw new workbox_core_private_WorkboxError_js__rspack_import_1.WorkboxError('invalid-string', {
                    moduleName: 'workbox-routing',
                    funcName: 'registerRoute',
                    paramName: 'capture',
                });
            }
            // We want to check if Express-style wildcards are in the pathname only.
            // TODO: Remove this log message in v4.
            const valueToCheck = capture.startsWith('http')
                ? captureUrl.pathname
                : capture;
            // See https://github.com/pillarjs/path-to-regexp#parameters
            const wildcards = '[*:?+]';
            if (new RegExp(`${wildcards}`).exec(valueToCheck)) {
                workbox_core_private_logger_js__rspack_import_0.logger.debug(`The '$capture' parameter contains an Express-style wildcard ` +
                    `character (${wildcards}). Strings are now always interpreted as ` +
                    `exact matches; use a RegExp for partial or wildcard matches.`);
            }
        }
        const matchCallback = ({ url }) => {
            if (true) {
                if (url.pathname === captureUrl.pathname &&
                    url.origin !== captureUrl.origin) {
                    workbox_core_private_logger_js__rspack_import_0.logger.debug(`${capture} only partially matches the cross-origin URL ` +
                        `${url.toString()}. This route will only handle cross-origin requests ` +
                        `if they match the entire URL.`);
                }
            }
            return url.href === captureUrl.href;
        };
        // If `capture` is a string then `handler` and `method` must be present.
        route = new _Route_js__rspack_import_2.Route(matchCallback, handler, method);
    }
    else if (capture instanceof RegExp) {
        // If `capture` is a `RegExp` then `handler` and `method` must be present.
        route = new _RegExpRoute_js__rspack_import_3.RegExpRoute(capture, handler, method);
    }
    else if (typeof capture === 'function') {
        // If `capture` is a function then `handler` and `method` must be present.
        route = new _Route_js__rspack_import_2.Route(capture, handler, method);
    }
    else if (capture instanceof _Route_js__rspack_import_2.Route) {
        route = capture;
    }
    else {
        throw new workbox_core_private_WorkboxError_js__rspack_import_1.WorkboxError('unsupported-route-type', {
            moduleName: 'workbox-routing',
            funcName: 'registerRoute',
            paramName: 'capture',
        });
    }
    const defaultRouter = (0,_utils_getOrCreateDefaultRouter_js__rspack_import_4.getOrCreateDefaultRouter)();
    defaultRouter.registerRoute(route);
    return route;
}



},
"../../node_modules/.pnpm/workbox-routing@7.3.0/node_modules/workbox-routing/utils/constants.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  defaultMethod: () => (defaultMethod),
  validMethods: () => (validMethods)
});
/* import */ var _version_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-routing@7.3.0/node_modules/workbox-routing/_version.js");
/* import */ var _version_js__rspack_import_0_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_0);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

/**
 * The default HTTP method, 'GET', used when there's no specific method
 * configured for a route.
 *
 * @type {string}
 *
 * @private
 */
const defaultMethod = 'GET';
/**
 * The list of valid HTTP methods associated with requests that could be routed.
 *
 * @type {Array<string>}
 *
 * @private
 */
const validMethods = [
    'DELETE',
    'GET',
    'HEAD',
    'PATCH',
    'POST',
    'PUT',
];


},
"../../node_modules/.pnpm/workbox-routing@7.3.0/node_modules/workbox-routing/utils/getOrCreateDefaultRouter.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  getOrCreateDefaultRouter: () => (getOrCreateDefaultRouter)
});
/* import */ var _Router_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-routing@7.3.0/node_modules/workbox-routing/Router.js");
/* import */ var _version_js__rspack_import_1 = __webpack_require__("../../node_modules/.pnpm/workbox-routing@7.3.0/node_modules/workbox-routing/_version.js");
/* import */ var _version_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_1);
/*
  Copyright 2019 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


let defaultRouter;
/**
 * Creates a new, singleton Router instance if one does not exist. If one
 * does already exist, that instance is returned.
 *
 * @private
 * @return {Router}
 */
const getOrCreateDefaultRouter = () => {
    if (!defaultRouter) {
        defaultRouter = new _Router_js__rspack_import_0.Router();
        // The helpers that use the default Router assume these listeners exist.
        defaultRouter.addFetchListener();
        defaultRouter.addCacheListener();
    }
    return defaultRouter;
};


},
"../../node_modules/.pnpm/workbox-routing@7.3.0/node_modules/workbox-routing/utils/normalizeHandler.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  normalizeHandler: () => (normalizeHandler)
});
/* import */ var workbox_core_private_assert_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/assert.js");
/* import */ var _version_js__rspack_import_1 = __webpack_require__("../../node_modules/.pnpm/workbox-routing@7.3.0/node_modules/workbox-routing/_version.js");
/* import */ var _version_js__rspack_import_1_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_1);
/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/


/**
 * @param {function()|Object} handler Either a function, or an object with a
 * 'handle' method.
 * @return {Object} An object with a handle method.
 *
 * @private
 */
const normalizeHandler = (handler) => {
    if (handler && typeof handler === 'object') {
        if (true) {
            workbox_core_private_assert_js__rspack_import_0.assert.hasMethod(handler, 'handle', {
                moduleName: 'workbox-routing',
                className: 'Route',
                funcName: 'constructor',
                paramName: 'handler',
            });
        }
        return handler;
    }
    else {
        if (true) {
            workbox_core_private_assert_js__rspack_import_0.assert.isType(handler, 'function', {
                moduleName: 'workbox-routing',
                className: 'Route',
                funcName: 'constructor',
                paramName: 'handler',
            });
        }
        return { handle: handler };
    }
};


},
"../../node_modules/.pnpm/workbox-strategies@7.3.0/node_modules/workbox-strategies/Strategy.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  Strategy: () => (Strategy)
});
/* import */ var workbox_core_private_cacheNames_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/cacheNames.js");
/* import */ var workbox_core_private_WorkboxError_js__rspack_import_1 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/WorkboxError.js");
/* import */ var workbox_core_private_logger_js__rspack_import_2 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/logger.js");
/* import */ var workbox_core_private_getFriendlyURL_js__rspack_import_3 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/getFriendlyURL.js");
/* import */ var _StrategyHandler_js__rspack_import_4 = __webpack_require__("../../node_modules/.pnpm/workbox-strategies@7.3.0/node_modules/workbox-strategies/StrategyHandler.js");
/* import */ var _version_js__rspack_import_5 = __webpack_require__("../../node_modules/.pnpm/workbox-strategies@7.3.0/node_modules/workbox-strategies/_version.js");
/* import */ var _version_js__rspack_import_5_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_5);
/*
  Copyright 2020 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/






/**
 * An abstract base class that all other strategy classes must extend from:
 *
 * @memberof workbox-strategies
 */
class Strategy {
    /**
     * Creates a new instance of the strategy and sets all documented option
     * properties as public instance properties.
     *
     * Note: if a custom strategy class extends the base Strategy class and does
     * not need more than these properties, it does not need to define its own
     * constructor.
     *
     * @param {Object} [options]
     * @param {string} [options.cacheName] Cache name to store and retrieve
     * requests. Defaults to the cache names provided by
     * {@link workbox-core.cacheNames}.
     * @param {Array<Object>} [options.plugins] [Plugins]{@link https://developers.google.com/web/tools/workbox/guides/using-plugins}
     * to use in conjunction with this caching strategy.
     * @param {Object} [options.fetchOptions] Values passed along to the
     * [`init`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters)
     * of [non-navigation](https://github.com/GoogleChrome/workbox/issues/1796)
     * `fetch()` requests made by this strategy.
     * @param {Object} [options.matchOptions] The
     * [`CacheQueryOptions`]{@link https://w3c.github.io/ServiceWorker/#dictdef-cachequeryoptions}
     * for any `cache.match()` or `cache.put()` calls made by this strategy.
     */
    constructor(options = {}) {
        /**
         * Cache name to store and retrieve
         * requests. Defaults to the cache names provided by
         * {@link workbox-core.cacheNames}.
         *
         * @type {string}
         */
        this.cacheName = workbox_core_private_cacheNames_js__rspack_import_0.cacheNames.getRuntimeName(options.cacheName);
        /**
         * The list
         * [Plugins]{@link https://developers.google.com/web/tools/workbox/guides/using-plugins}
         * used by this strategy.
         *
         * @type {Array<Object>}
         */
        this.plugins = options.plugins || [];
        /**
         * Values passed along to the
         * [`init`]{@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters}
         * of all fetch() requests made by this strategy.
         *
         * @type {Object}
         */
        this.fetchOptions = options.fetchOptions;
        /**
         * The
         * [`CacheQueryOptions`]{@link https://w3c.github.io/ServiceWorker/#dictdef-cachequeryoptions}
         * for any `cache.match()` or `cache.put()` calls made by this strategy.
         *
         * @type {Object}
         */
        this.matchOptions = options.matchOptions;
    }
    /**
     * Perform a request strategy and returns a `Promise` that will resolve with
     * a `Response`, invoking all relevant plugin callbacks.
     *
     * When a strategy instance is registered with a Workbox
     * {@link workbox-routing.Route}, this method is automatically
     * called when the route matches.
     *
     * Alternatively, this method can be used in a standalone `FetchEvent`
     * listener by passing it to `event.respondWith()`.
     *
     * @param {FetchEvent|Object} options A `FetchEvent` or an object with the
     *     properties listed below.
     * @param {Request|string} options.request A request to run this strategy for.
     * @param {ExtendableEvent} options.event The event associated with the
     *     request.
     * @param {URL} [options.url]
     * @param {*} [options.params]
     */
    handle(options) {
        const [responseDone] = this.handleAll(options);
        return responseDone;
    }
    /**
     * Similar to {@link workbox-strategies.Strategy~handle}, but
     * instead of just returning a `Promise` that resolves to a `Response` it
     * it will return an tuple of `[response, done]` promises, where the former
     * (`response`) is equivalent to what `handle()` returns, and the latter is a
     * Promise that will resolve once any promises that were added to
     * `event.waitUntil()` as part of performing the strategy have completed.
     *
     * You can await the `done` promise to ensure any extra work performed by
     * the strategy (usually caching responses) completes successfully.
     *
     * @param {FetchEvent|Object} options A `FetchEvent` or an object with the
     *     properties listed below.
     * @param {Request|string} options.request A request to run this strategy for.
     * @param {ExtendableEvent} options.event The event associated with the
     *     request.
     * @param {URL} [options.url]
     * @param {*} [options.params]
     * @return {Array<Promise>} A tuple of [response, done]
     *     promises that can be used to determine when the response resolves as
     *     well as when the handler has completed all its work.
     */
    handleAll(options) {
        // Allow for flexible options to be passed.
        if (options instanceof FetchEvent) {
            options = {
                event: options,
                request: options.request,
            };
        }
        const event = options.event;
        const request = typeof options.request === 'string'
            ? new Request(options.request)
            : options.request;
        const params = 'params' in options ? options.params : undefined;
        const handler = new _StrategyHandler_js__rspack_import_4.StrategyHandler(this, { event, request, params });
        const responseDone = this._getResponse(handler, request, event);
        const handlerDone = this._awaitComplete(responseDone, handler, request, event);
        // Return an array of promises, suitable for use with Promise.all().
        return [responseDone, handlerDone];
    }
    async _getResponse(handler, request, event) {
        await handler.runCallbacks('handlerWillStart', { event, request });
        let response = undefined;
        try {
            response = await this._handle(request, handler);
            // The "official" Strategy subclasses all throw this error automatically,
            // but in case a third-party Strategy doesn't, ensure that we have a
            // consistent failure when there's no response or an error response.
            if (!response || response.type === 'error') {
                throw new workbox_core_private_WorkboxError_js__rspack_import_1.WorkboxError('no-response', { url: request.url });
            }
        }
        catch (error) {
            if (error instanceof Error) {
                for (const callback of handler.iterateCallbacks('handlerDidError')) {
                    response = await callback({ error, event, request });
                    if (response) {
                        break;
                    }
                }
            }
            if (!response) {
                throw error;
            }
            else if (true) {
                workbox_core_private_logger_js__rspack_import_2.logger.log(`While responding to '${(0,workbox_core_private_getFriendlyURL_js__rspack_import_3.getFriendlyURL)(request.url)}', ` +
                    `an ${error instanceof Error ? error.toString() : ''} error occurred. Using a fallback response provided by ` +
                    `a handlerDidError plugin.`);
            }
        }
        for (const callback of handler.iterateCallbacks('handlerWillRespond')) {
            response = await callback({ event, request, response });
        }
        return response;
    }
    async _awaitComplete(responseDone, handler, request, event) {
        let response;
        let error;
        try {
            response = await responseDone;
        }
        catch (error) {
            // Ignore errors, as response errors should be caught via the `response`
            // promise above. The `done` promise will only throw for errors in
            // promises passed to `handler.waitUntil()`.
        }
        try {
            await handler.runCallbacks('handlerDidRespond', {
                event,
                request,
                response,
            });
            await handler.doneWaiting();
        }
        catch (waitUntilError) {
            if (waitUntilError instanceof Error) {
                error = waitUntilError;
            }
        }
        await handler.runCallbacks('handlerDidComplete', {
            event,
            request,
            response,
            error: error,
        });
        handler.destroy();
        if (error) {
            throw error;
        }
    }
}

/**
 * Classes extending the `Strategy` based class should implement this method,
 * and leverage the {@link workbox-strategies.StrategyHandler}
 * arg to perform all fetching and cache logic, which will ensure all relevant
 * cache, cache options, fetch options and plugins are used (per the current
 * strategy instance).
 *
 * @name _handle
 * @instance
 * @abstract
 * @function
 * @param {Request} request
 * @param {workbox-strategies.StrategyHandler} handler
 * @return {Promise<Response>}
 *
 * @memberof workbox-strategies.Strategy
 */


},
"../../node_modules/.pnpm/workbox-strategies@7.3.0/node_modules/workbox-strategies/StrategyHandler.js"(__unused_rspack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  StrategyHandler: () => (StrategyHandler)
});
/* import */ var workbox_core_private_assert_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/assert.js");
/* import */ var workbox_core_private_cacheMatchIgnoreParams_js__rspack_import_1 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/cacheMatchIgnoreParams.js");
/* import */ var workbox_core_private_Deferred_js__rspack_import_2 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/Deferred.js");
/* import */ var workbox_core_private_executeQuotaErrorCallbacks_js__rspack_import_3 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/executeQuotaErrorCallbacks.js");
/* import */ var workbox_core_private_getFriendlyURL_js__rspack_import_4 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/getFriendlyURL.js");
/* import */ var workbox_core_private_logger_js__rspack_import_5 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/logger.js");
/* import */ var workbox_core_private_timeout_js__rspack_import_6 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/timeout.js");
/* import */ var workbox_core_private_WorkboxError_js__rspack_import_7 = __webpack_require__("../../node_modules/.pnpm/workbox-core@7.3.0/node_modules/workbox-core/_private/WorkboxError.js");
/* import */ var _version_js__rspack_import_8 = __webpack_require__("../../node_modules/.pnpm/workbox-strategies@7.3.0/node_modules/workbox-strategies/_version.js");
/* import */ var _version_js__rspack_import_8_default = /*#__PURE__*/__webpack_require__.n(_version_js__rspack_import_8);
/*
  Copyright 2020 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/









function toRequest(input) {
    return typeof input === 'string' ? new Request(input) : input;
}
/**
 * A class created every time a Strategy instance instance calls
 * {@link workbox-strategies.Strategy~handle} or
 * {@link workbox-strategies.Strategy~handleAll} that wraps all fetch and
 * cache actions around plugin callbacks and keeps track of when the strategy
 * is "done" (i.e. all added `event.waitUntil()` promises have resolved).
 *
 * @memberof workbox-strategies
 */
class StrategyHandler {
    /**
     * Creates a new instance associated with the passed strategy and event
     * that's handling the request.
     *
     * The constructor also initializes the state that will be passed to each of
     * the plugins handling this request.
     *
     * @param {workbox-strategies.Strategy} strategy
     * @param {Object} options
     * @param {Request|string} options.request A request to run this strategy for.
     * @param {ExtendableEvent} options.event The event associated with the
     *     request.
     * @param {URL} [options.url]
     * @param {*} [options.params] The return value from the
     *     {@link workbox-routing~matchCallback} (if applicable).
     */
    constructor(strategy, options) {
        this._cacheKeys = {};
        /**
         * The request the strategy is performing (passed to the strategy's
         * `handle()` or `handleAll()` method).
         * @name request
         * @instance
         * @type {Request}
         * @memberof workbox-strategies.StrategyHandler
         */
        /**
         * The event associated with this request.
         * @name event
         * @instance
         * @type {ExtendableEvent}
         * @memberof workbox-strategies.StrategyHandler
         */
        /**
         * A `URL` instance of `request.url` (if passed to the strategy's
         * `handle()` or `handleAll()` method).
         * Note: the `url` param will be present if the strategy was invoked
         * from a workbox `Route` object.
         * @name url
         * @instance
         * @type {URL|undefined}
         * @memberof workbox-strategies.StrategyHandler
         */
        /**
         * A `param` value (if passed to the strategy's
         * `handle()` or `handleAll()` method).
         * Note: the `param` param will be present if the strategy was invoked
         * from a workbox `Route` object and the
         * {@link workbox-routing~matchCallback} returned
         * a truthy value (it will be that value).
         * @name params
         * @instance
         * @type {*|undefined}
         * @memberof workbox-strategies.StrategyHandler
         */
        if (true) {
            workbox_core_private_assert_js__rspack_import_0.assert.isInstance(options.event, ExtendableEvent, {
                moduleName: 'workbox-strategies',
                className: 'StrategyHandler',
                funcName: 'constructor',
                paramName: 'options.event',
            });
        }
        Object.assign(this, options);
        this.event = options.event;
        this._strategy = strategy;
        this._handlerDeferred = new workbox_core_private_Deferred_js__rspack_import_2.Deferred();
        this._extendLifetimePromises = [];
        // Copy the plugins list (since it's mutable on the strategy),
        // so any mutations don't affect this handler instance.
        this._plugins = [...strategy.plugins];
        this._pluginStateMap = new Map();
        for (const plugin of this._plugins) {
            this._pluginStateMap.set(plugin, {});
        }
        this.event.waitUntil(this._handlerDeferred.promise);
    }
    /**
     * Fetches a given request (and invokes any applicable plugin callback
     * methods) using the `fetchOptions` (for non-navigation requests) and
     * `plugins` defined on the `Strategy` object.
     *
     * The following plugin lifecycle methods are invoked when using this method:
     * - `requestWillFetch()`
     * - `fetchDidSucceed()`
     * - `fetchDidFail()`
     *
     * @param {Request|string} input The URL or request to fetch.
     * @return {Promise<Response>}
     */
    async fetch(input) {
        const { event } = this;
        let request = toRequest(input);
        if (request.mode === 'navigate' &&
            event instanceof FetchEvent &&
            event.preloadResponse) {
            const possiblePreloadResponse = (await event.preloadResponse);
            if (possiblePreloadResponse) {
                if (true) {
                    workbox_core_private_logger_js__rspack_import_5.logger.log(`Using a preloaded navigation response for ` +
                        `'${(0,workbox_core_private_getFriendlyURL_js__rspack_import_4.getFriendlyURL)(request.url)}'`);
                }
                return possiblePreloadResponse;
            }
        }
        // If there is a fetchDidFail plugin, we need to save a clone of the
        // original request before it's either modified by a requestWillFetch
        // plugin or before the original request's body is consumed via fetch().
        const originalRequest = this.hasCallback('fetchDidFail')
            ? request.clone()
            : null;
        try {
            for (const cb of this.iterateCallbacks('requestWillFetch')) {
                request = await cb({ request: request.clone(), event });
            }
        }
        catch (err) {
            if (err instanceof Error) {
                throw new workbox_core_private_WorkboxError_js__rspack_import_7.WorkboxError('plugin-error-request-will-fetch', {
                    thrownErrorMessage: err.message,
                });
            }
        }
        // The request can be altered by plugins with `requestWillFetch` making
        // the original request (most likely from a `fetch` event) different
        // from the Request we make. Pass both to `fetchDidFail` to aid debugging.
        const pluginFilteredRequest = request.clone();
        try {
            let fetchResponse;
            // See https://github.com/GoogleChrome/workbox/issues/1796
            fetchResponse = await fetch(request, request.mode === 'navigate' ? undefined : this._strategy.fetchOptions);
            if (true) {
                workbox_core_private_logger_js__rspack_import_5.logger.debug(`Network request for ` +
                    `'${(0,workbox_core_private_getFriendlyURL_js__rspack_import_4.getFriendlyURL)(request.url)}' returned a response with ` +
                    `status '${fetchResponse.status}'.`);
            }
            for (const callback of this.iterateCallbacks('fetchDidSucceed')) {
                fetchResponse = await callback({
                    event,
                    request: pluginFilteredRequest,
                    response: fetchResponse,
                });
            }
            return fetchResponse;
        }
        catch (error) {
            if (true) {
                workbox_core_private_logger_js__rspack_import_5.logger.log(`Network request for ` +
                    `'${(0,workbox_core_private_getFriendlyURL_js__rspack_import_4.getFriendlyURL)(request.url)}' threw an error.`, error);
            }
            // `originalRequest` will only exist if a `fetchDidFail` callback
            // is being used (see above).
            if (originalRequest) {
                await this.runCallbacks('fetchDidFail', {
                    error: error,
                    event,
                    originalRequest: originalRequest.clone(),
                    request: pluginFilteredRequest.clone(),
                });
            }
            throw error;
        }
    }
    /**
     * Calls `this.fetch()` and (in the background) runs `this.cachePut()` on
     * the response generated by `this.fetch()`.
     *
     * The call to `this.cachePut()` automatically invokes `this.waitUntil()`,
     * so you do not have to manually call `waitUntil()` on the event.
     *
     * @param {Request|string} input The request or URL to fetch and cache.
     * @return {Promise<Response>}
     */
    async fetchAndCachePut(input) {
        const response = await this.fetch(input);
        const responseClone = response.clone();
        void this.waitUntil(this.cachePut(input, responseClone));
        return response;
    }
    /**
     * Matches a request from the cache (and invokes any applicable plugin
     * callback methods) using the `cacheName`, `matchOptions`, and `plugins`
     * defined on the strategy object.
     *
     * The following plugin lifecycle methods are invoked when using this method:
     * - cacheKeyWillBeUsed()
     * - cachedResponseWillBeUsed()
     *
     * @param {Request|string} key The Request or URL to use as the cache key.
     * @return {Promise<Response|undefined>} A matching response, if found.
     */
    async cacheMatch(key) {
        const request = toRequest(key);
        let cachedResponse;
        const { cacheName, matchOptions } = this._strategy;
        const effectiveRequest = await this.getCacheKey(request, 'read');
        const multiMatchOptions = Object.assign(Object.assign({}, matchOptions), { cacheName });
        cachedResponse = await caches.match(effectiveRequest, multiMatchOptions);
        if (true) {
            if (cachedResponse) {
                workbox_core_private_logger_js__rspack_import_5.logger.debug(`Found a cached response in '${cacheName}'.`);
            }
            else {
                workbox_core_private_logger_js__rspack_import_5.logger.debug(`No cached response found in '${cacheName}'.`);
            }
        }
        for (const callback of this.iterateCallbacks('cachedResponseWillBeUsed')) {
            cachedResponse =
                (await callback({
                    cacheName,
                    matchOptions,
                    cachedResponse,
                    request: effectiveRequest,
                    event: this.event,
                })) || undefined;
        }
        return cachedResponse;
    }
    /**
     * Puts a request/response pair in the cache (and invokes any applicable
     * plugin callback methods) using the `cacheName` and `plugins` defined on
     * the strategy object.
     *
     * The following plugin lifecycle methods are invoked when using this method:
     * - cacheKeyWillBeUsed()
     * - cacheWillUpdate()
     * - cacheDidUpdate()
     *
     * @param {Request|string} key The request or URL to use as the cache key.
     * @param {Response} response The response to cache.
     * @return {Promise<boolean>} `false` if a cacheWillUpdate caused the response
     * not be cached, and `true` otherwise.
     */
    async cachePut(key, response) {
        const request = toRequest(key);
        // Run in the next task to avoid blocking other cache reads.
        // https://github.com/w3c/ServiceWorker/issues/1397
        await (0,workbox_core_private_timeout_js__rspack_import_6.timeout)(0);
        const effectiveRequest = await this.getCacheKey(request, 'write');
        if (true) {
            if (effectiveRequest.method && effectiveRequest.method !== 'GET') {
                throw new workbox_core_private_WorkboxError_js__rspack_import_7.WorkboxError('attempt-to-cache-non-get-request', {
                    url: (0,workbox_core_private_getFriendlyURL_js__rspack_import_4.getFriendlyURL)(effectiveRequest.url),
                    method: effectiveRequest.method,
                });
            }
            // See https://github.com/GoogleChrome/workbox/issues/2818
            const vary = response.headers.get('Vary');
            if (vary) {
                workbox_core_private_logger_js__rspack_import_5.logger.debug(`The response for ${(0,workbox_core_private_getFriendlyURL_js__rspack_import_4.getFriendlyURL)(effectiveRequest.url)} ` +
                    `has a 'Vary: ${vary}' header. ` +
                    `Consider setting the {ignoreVary: true} option on your strategy ` +
                    `to ensure cache matching and deletion works as expected.`);
            }
        }
        if (!response) {
            if (true) {
                workbox_core_private_logger_js__rspack_import_5.logger.error(`Cannot cache non-existent response for ` +
                    `'${(0,workbox_core_private_getFriendlyURL_js__rspack_import_4.getFriendlyURL)(effectiveRequest.url)}'.`);
            }
            throw new workbox_core_private_WorkboxError_js__rspack_import_7.WorkboxError('cache-put-with-no-response', {
                url: (0,workbox_core_private_getFriendlyURL_js__rspack_import_4.getFriendlyURL)(effectiveRequest.url),
            });
        }
        const responseToCache = await this._ensureResponseSafeToCache(response);
        if (!responseToCache) {
            if (true) {
                workbox_core_private_logger_js__rspack_import_5.logger.debug(`Response '${(0,workbox_core_private_getFriendlyURL_js__rspack_import_4.getFriendlyURL)(effectiveRequest.url)}' ` +
                    `will not be cached.`, responseToCache);
            }
            return false;
        }
        const { cacheName, matchOptions } = this._strategy;
        const cache = await self.caches.open(cacheName);
        const hasCacheUpdateCallback = this.hasCallback('cacheDidUpdate');
        const oldResponse = hasCacheUpdateCallback
            ? await (0,workbox_core_private_cacheMatchIgnoreParams_js__rspack_import_1.cacheMatchIgnoreParams)(
            // TODO(philipwalton): the `__WB_REVISION__` param is a precaching
            // feature. Consider into ways to only add this behavior if using
            // precaching.
            cache, effectiveRequest.clone(), ['__WB_REVISION__'], matchOptions)
            : null;
        if (true) {
            workbox_core_private_logger_js__rspack_import_5.logger.debug(`Updating the '${cacheName}' cache with a new Response ` +
                `for ${(0,workbox_core_private_getFriendlyURL_js__rspack_import_4.getFriendlyURL)(effectiveRequest.url)}.`);
        }
        try {
            await cache.put(effectiveRequest, hasCacheUpdateCallback ? responseToCache.clone() : responseToCache);
        }
        catch (error) {
            if (error instanceof Error) {
                // See https://developer.mozilla.org/en-US/docs/Web/API/DOMException#exception-QuotaExceededError
                if (error.name === 'QuotaExceededError') {
                    await (0,workbox_core_private_executeQuotaErrorCallbacks_js__rspack_import_3.executeQuotaErrorCallbacks)();
                }
                throw error;
            }
        }
        for (const callback of this.iterateCallbacks('cacheDidUpdate')) {
            await callback({
                cacheName,
                oldResponse,
                newResponse: responseToCache.clone(),
                request: effectiveRequest,
                event: this.event,
            });
        }
        return true;
    }
    /**
     * Checks the list of plugins for the `cacheKeyWillBeUsed` callback, and
     * executes any of those callbacks found in sequence. The final `Request`
     * object returned by the last plugin is treated as the cache key for cache
     * reads and/or writes. If no `cacheKeyWillBeUsed` plugin callbacks have
     * been registered, the passed request is returned unmodified
     *
     * @param {Request} request
     * @param {string} mode
     * @return {Promise<Request>}
     */
    async getCacheKey(request, mode) {
        const key = `${request.url} | ${mode}`;
        if (!this._cacheKeys[key]) {
            let effectiveRequest = request;
            for (const callback of this.iterateCallbacks('cacheKeyWillBeUsed')) {
                effectiveRequest = toRequest(await callback({
                    mode,
                    request: effectiveRequest,
                    event: this.event,
                    // params has a type any can't change right now.
                    params: this.params, // eslint-disable-line
                }));
            }
            this._cacheKeys[key] = effectiveRequest;
        }
        return this._cacheKeys[key];
    }
    /**
     * Returns true if the strategy has at least one plugin with the given
     * callback.
     *
     * @param {string} name The name of the callback to check for.
     * @return {boolean}
     */
    hasCallback(name) {
        for (const plugin of this._strategy.plugins) {
            if (name in plugin) {
                return true;
            }
        }
        return false;
    }
    /**
     * Runs all plugin callbacks matching the given name, in order, passing the
     * given param object (merged ith the current plugin state) as the only
     * argument.
     *
     * Note: since this method runs all plugins, it's not suitable for cases
     * where the return value of a callback needs to be applied prior to calling
     * the next callback. See
     * {@link workbox-strategies.StrategyHandler#iterateCallbacks}
     * below for how to handle that case.
     *
     * @param {string} name The name of the callback to run within each plugin.
     * @param {Object} param The object to pass as the first (and only) param
     *     when executing each callback. This object will be merged with the
     *     current plugin state prior to callback execution.
     */
    async runCallbacks(name, param) {
        for (const callback of this.iterateCallbacks(name)) {
            // TODO(philipwalton): not sure why `any` is needed. It seems like
            // this should work with `as WorkboxPluginCallbackParam[C]`.
            await callback(param);
        }
    }
    /**
     * Accepts a callback and returns an iterable of matching plugin callbacks,
     * where each callback is wrapped with the current handler state (i.e. when
     * you call each callback, whatever object parameter you pass it will
     * be merged with the plugin's current state).
     *
     * @param {string} name The name fo the callback to run
     * @return {Array<Function>}
     */
    *iterateCallbacks(name) {
        for (const plugin of this._strategy.plugins) {
            if (typeof plugin[name] === 'function') {
                const state = this._pluginStateMap.get(plugin);
                const statefulCallback = (param) => {
                    const statefulParam = Object.assign(Object.assign({}, param), { state });
                    // TODO(philipwalton): not sure why `any` is needed. It seems like
                    // this should work with `as WorkboxPluginCallbackParam[C]`.
                    return plugin[name](statefulParam);
                };
                yield statefulCallback;
            }
        }
    }
    /**
     * Adds a promise to the
     * [extend lifetime promises]{@link https://w3c.github.io/ServiceWorker/#extendableevent-extend-lifetime-promises}
     * of the event event associated with the request being handled (usually a
     * `FetchEvent`).
     *
     * Note: you can await
     * {@link workbox-strategies.StrategyHandler~doneWaiting}
     * to know when all added promises have settled.
     *
     * @param {Promise} promise A promise to add to the extend lifetime promises
     *     of the event that triggered the request.
     */
    waitUntil(promise) {
        this._extendLifetimePromises.push(promise);
        return promise;
    }
    /**
     * Returns a promise that resolves once all promises passed to
     * {@link workbox-strategies.StrategyHandler~waitUntil}
     * have settled.
     *
     * Note: any work done after `doneWaiting()` settles should be manually
     * passed to an event's `waitUntil()` method (not this handler's
     * `waitUntil()` method), otherwise the service worker thread my be killed
     * prior to your work completing.
     */
    async doneWaiting() {
        let promise;
        while ((promise = this._extendLifetimePromises.shift())) {
            await promise;
        }
    }
    /**
     * Stops running the strategy and immediately resolves any pending
     * `waitUntil()` promises.
     */
    destroy() {
        this._handlerDeferred.resolve(null);
    }
    /**
     * This method will call cacheWillUpdate on the available plugins (or use
     * status === 200) to determine if the Response is safe and valid to cache.
     *
     * @param {Request} options.request
     * @param {Response} options.response
     * @return {Promise<Response|undefined>}
     *
     * @private
     */
    async _ensureResponseSafeToCache(response) {
        let responseToCache = response;
        let pluginsUsed = false;
        for (const callback of this.iterateCallbacks('cacheWillUpdate')) {
            responseToCache =
                (await callback({
                    request: this.request,
                    response: responseToCache,
                    event: this.event,
                })) || undefined;
            pluginsUsed = true;
            if (!responseToCache) {
                break;
            }
        }
        if (!pluginsUsed) {
            if (responseToCache && responseToCache.status !== 200) {
                responseToCache = undefined;
            }
            if (true) {
                if (responseToCache) {
                    if (responseToCache.status !== 200) {
                        if (responseToCache.status === 0) {
                            workbox_core_private_logger_js__rspack_import_5.logger.warn(`The response for '${this.request.url}' ` +
                                `is an opaque response. The caching strategy that you're ` +
                                `using will not cache opaque responses by default.`);
                        }
                        else {
                            workbox_core_private_logger_js__rspack_import_5.logger.debug(`The response for '${this.request.url}' ` +
                                `returned a status code of '${response.status}' and won't ` +
                                `be cached as a result.`);
                        }
                    }
                }
            }
        }
        return responseToCache;
    }
}



},
"../../node_modules/.pnpm/workbox-strategies@7.3.0/node_modules/workbox-strategies/_version.js"() {

// @ts-ignore
try {
    self['workbox:strategies:7.2.0'] && _();
}
catch (e) { }


},
"../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/index.mjs"(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  PrecacheController: () => (/* reexport safe */ _index_js__rspack_import_0.PrecacheController),
  PrecacheFallbackPlugin: () => (/* reexport safe */ _index_js__rspack_import_0.PrecacheFallbackPlugin),
  PrecacheRoute: () => (/* reexport safe */ _index_js__rspack_import_0.PrecacheRoute),
  PrecacheStrategy: () => (/* reexport safe */ _index_js__rspack_import_0.PrecacheStrategy),
  addPlugins: () => (/* reexport safe */ _index_js__rspack_import_0.addPlugins),
  addRoute: () => (/* reexport safe */ _index_js__rspack_import_0.addRoute),
  cleanupOutdatedCaches: () => (/* reexport safe */ _index_js__rspack_import_0.cleanupOutdatedCaches),
  createHandlerBoundToURL: () => (/* reexport safe */ _index_js__rspack_import_0.createHandlerBoundToURL),
  getCacheKeyForURL: () => (/* reexport safe */ _index_js__rspack_import_0.getCacheKeyForURL),
  matchPrecache: () => (/* reexport safe */ _index_js__rspack_import_0.matchPrecache),
  precache: () => (/* reexport safe */ _index_js__rspack_import_0.precache),
  precacheAndRoute: () => (/* reexport safe */ _index_js__rspack_import_0.precacheAndRoute)
});
/* import */ var _index_js__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/index.js");


},

});
// The module cache
var __webpack_module_cache__ = {};

// The require function
function __webpack_require__(moduleId) {

// Check if module is in cache
var cachedModule = __webpack_module_cache__[moduleId];
if (cachedModule !== undefined) {
return cachedModule.exports;
}
// Create a new module (and put it into the cache)
var module = (__webpack_module_cache__[moduleId] = {
exports: {}
});
// Execute the module function
__webpack_modules__[moduleId](module, module.exports, __webpack_require__);

// Return the exports of the module
return module.exports;

}

// webpack/runtime/compat_get_default_export
(() => {
// getDefaultExport function for compatibility with non-ESM modules
__webpack_require__.n = (module) => {
	var getter = module && module.__esModule ?
		() => (module['default']) :
		() => (module);
	__webpack_require__.d(getter, { a: getter });
	return getter;
};

})();
// webpack/runtime/define_property_getters
(() => {
__webpack_require__.d = (exports, definition) => {
	for(var key in definition) {
        if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
            Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
        }
    }
};
})();
// webpack/runtime/has_own_property
(() => {
__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
})();
// webpack/runtime/make_namespace_object
(() => {
// define __esModule on exports
__webpack_require__.r = (exports) => {
	if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
		Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
	}
	Object.defineProperty(exports, '__esModule', { value: true });
};
})();
// webpack/runtime/rspack_version
(() => {
__webpack_require__.rv = () => ("1.7.4")
})();
// webpack/runtime/rspack_unique_id
(() => {
__webpack_require__.ruid = "bundler=rspack@1.7.4";
})();
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
__webpack_require__.r(__webpack_exports__);
/* import */ var workbox_precaching__rspack_import_0 = __webpack_require__("../../node_modules/.pnpm/workbox-precaching@7.3.0/node_modules/workbox-precaching/index.mjs");
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/* eslint-disable no-restricted-globals */

function parseSwParams() {
    const params = JSON.parse(new URLSearchParams(self.location.search).get('params'));
    if (params.debug) {
        console.log('[Docusaurus-PWA][SW]: Service Worker params:', params);
    }
    return params;
}
// Doc advises against dynamic imports in SW
// https://developers.google.com/web/tools/workbox/guides/using-bundlers#code_splitting_and_dynamic_imports
// https://x.com/sebastienlorber/status/1280155204575518720
// but looks it's working fine as it's inlined by webpack, need to double check
async function runSWCustomCode(params) {
    if (false) {}
}
/**
 * Gets different possible variations for a request URL. Similar to
 * https://git.io/JvixK
 */
function getPossibleURLs(url) {
    const urlObject = new URL(url, self.location.href);
    if (urlObject.origin !== self.location.origin) {
        return [];
    }
    // Ignore search params and hash
    urlObject.search = '';
    urlObject.hash = '';
    return [
        // /blog.html
        urlObject.href,
        // /blog/ => /blog/index.html
        // /blog => /blog/index.html
        `${urlObject.href}${urlObject.pathname.endsWith('/') ? '' : '/'}index.html`,
    ];
}
(async () => {
    const params = parseSwParams();
    // eslint-disable-next-line no-underscore-dangle
    const precacheManifest = [{"revision":"10471f6a09ecf47dd6da1ebf769b9b71","url":"404.html"},{"revision":"2164eeb136ea2909daa0946ca5426a11","url":"assets/css/styles.1f069552.css"},{"revision":"c9a5c641dc102227f8c4bf9601d565cf","url":"assets/js/01a85c17.73257c14.js"},{"revision":"29cd27226c9e9166e16f161171b04aee","url":"assets/js/02d7ff3c.462b47bd.js"},{"revision":"d70689a7eead1e249f706311d5954876","url":"assets/js/033558ef.197db276.js"},{"revision":"7e78d0c42ff91092c6dbcf11bbf5f81e","url":"assets/js/0341ea21.12bb5824.js"},{"revision":"b102bfa3f00b1160ccad8d80b29d38f9","url":"assets/js/03dcb828.24fffa6c.js"},{"revision":"c8dbb4fb6a277e95bacf326703609404","url":"assets/js/041abebd.3a0c66ef.js"},{"revision":"150ecf1c9d62e0093a805e373ac6cff8","url":"assets/js/043418cf.02d9b3b7.js"},{"revision":"41e30664e8e775d9506870b9e3ac5d7b","url":"assets/js/0466c4d9.1a55a69d.js"},{"revision":"4be9ce52d97e101351fe279bd53446f7","url":"assets/js/046a529c.18b0517f.js"},{"revision":"ea4f750a4441b1b988053195b42c7af9","url":"assets/js/05dd0033.ed85ad12.js"},{"revision":"7924a2e8dfdd62c3f7483699e4bc8658","url":"assets/js/05fc022f.f5c36f78.js"},{"revision":"29845768953dc7c4a9d841738016d0c1","url":"assets/js/06553e5f.1d5bdd45.js"},{"revision":"132606d92b827bb16e799f5c0b5bfd45","url":"assets/js/07027ca8.07fbd4a8.js"},{"revision":"12d5e82b78388b7bb2cea0f8dc61ceb3","url":"assets/js/075959c7.e46be85d.js"},{"revision":"293d884244f3b58ab118ed5447dd90db","url":"assets/js/07dcffa0.057dde5f.js"},{"revision":"9c41f8ef203b3ad36cfeb503e87748dd","url":"assets/js/0876d0f8.7f056324.js"},{"revision":"761807bef0e525605db81b4e129cc11a","url":"assets/js/08c00c20.4f411200.js"},{"revision":"d54338442942729b0085f5befd049133","url":"assets/js/0b9bd52d.59ffa727.js"},{"revision":"a93a00d340b7bc3fbc5f6f898199570b","url":"assets/js/0cb004eb.b64fcf7e.js"},{"revision":"e791b063a254140aa2cf202a1cf21c28","url":"assets/js/0d8cc21f.4b1b5d1d.js"},{"revision":"671b83d930a0eb35da6db9c11104b697","url":"assets/js/0dc788de.7ec82975.js"},{"revision":"d94a01b74dd24afd5676bcd3e5623334","url":"assets/js/0ebcc795.c10858b3.js"},{"revision":"a60438496e84436304d9afc9e070e432","url":"assets/js/10775d05.998a6b7d.js"},{"revision":"2a78b08785cdbe287195cd76a2984ebe","url":"assets/js/1126.d7535ab2.js"},{"revision":"d3acb1abd7c3c84a99d568c0c9439195","url":"assets/js/11758453.58e99c2f.js"},{"revision":"ef51fa41d53c473fad14be024efae9d2","url":"assets/js/1237.7344d886.js"},{"revision":"22cdba110ac4f5c84d17da488733e678","url":"assets/js/129d5367.49d2e890.js"},{"revision":"641819d52ff3517831f89108fe114209","url":"assets/js/12aa2c8c.1c23ed5f.js"},{"revision":"1faf461e200df1d6f19ebeea394a2386","url":"assets/js/13531353.4475116f.js"},{"revision":"eed7e875df6aa6845d17849d31dc5a83","url":"assets/js/158.39928d4e.js"},{"revision":"e636682e417e6e9d6e2aa5e2d870085d","url":"assets/js/1681308f.0f6d6f8f.js"},{"revision":"7f9db64d1988b90a2d20e1fc7c70cd4a","url":"assets/js/16c3aa7f.eb8a0b3c.js"},{"revision":"6af4d85d99d8676ae8d9fd0b529f8dc7","url":"assets/js/1703eefb.f58a1f3a.js"},{"revision":"65da7918d938b14a75932600b60f3c27","url":"assets/js/170afc8f.71e16971.js"},{"revision":"89b04ac2b810955dcc7f1de445e0b2c3","url":"assets/js/1749193b.538175e3.js"},{"revision":"9d8ae1d091dea6128245172b925215b9","url":"assets/js/17896441.ea1e2c80.js"},{"revision":"ef96c61e85a919d75780afcbb21b0b5d","url":"assets/js/1903511a.0c633f2f.js"},{"revision":"3ebd396a57cbfe7f9c315ba0304897db","url":"assets/js/1a12a673.6c0593a0.js"},{"revision":"941e999a4b4da10c17bcb53b85bbb432","url":"assets/js/1a4e3797.2d411fcb.js"},{"revision":"77ed2e247c6f1ef8028416b48a466ac6","url":"assets/js/1a79164e.9dc48c07.js"},{"revision":"c2a4cfe4bcf8eb78b2ea775da7e711d6","url":"assets/js/1b141026.e964c692.js"},{"revision":"2599caaf66fe1da854bb93bb7895c858","url":"assets/js/1be9b934.889b0abe.js"},{"revision":"0b57752c8bde47f50b94a0031f11712d","url":"assets/js/1c3d6ec7.51fae59a.js"},{"revision":"076509fef46eadf28dd97e53bb97e9c5","url":"assets/js/1c5cff36.8f9b19d6.js"},{"revision":"6133021de6a4021f926f8c518aea6b4f","url":"assets/js/1d71fb6c.1b1071a0.js"},{"revision":"6f92c728fb4c7820085ef9f2a529ba59","url":"assets/js/1df93b7f.0aff4c58.js"},{"revision":"c10e67a8a925b867fa6dedce64f4ee47","url":"assets/js/1e50e68f.1177593a.js"},{"revision":"83c54ea3445b7cae094af5fa6194439b","url":"assets/js/1f28a7ec.a52b83a7.js"},{"revision":"057d738df84015f79d1094f1ddced228","url":"assets/js/20b3c6d0.6bc97c0e.js"},{"revision":"d6c050ef1c75eb4db6f885c319b2a672","url":"assets/js/20f85cff.e865708f.js"},{"revision":"684bb8832a9a677f3008e88405abf605","url":"assets/js/2306.a15421ba.js"},{"revision":"1cf5e9e113203065d444fe85fe0db503","url":"assets/js/2523.29a72b14.js"},{"revision":"5c8319b9db2f83dcda85027297f213eb","url":"assets/js/27569c03.203cb430.js"},{"revision":"32eabc04e9a6ee1eb0feb1d37947d670","url":"assets/js/2831413c.3898f5a4.js"},{"revision":"b707747da7db421df294160fa74bbc73","url":"assets/js/2864f544.ea83387e.js"},{"revision":"610e79efaefbdf9a078f940064404174","url":"assets/js/28e8fb90.fd13769d.js"},{"revision":"625832c0e3ececa2000a1170c60d6acb","url":"assets/js/2a0c500b.6dd01892.js"},{"revision":"3705db10e177483df11131c20f796ec7","url":"assets/js/2bf937b4.3d7aaf41.js"},{"revision":"5fb1f7306401b1f018b89c27aa60e830","url":"assets/js/2cb9007f.a45f90b8.js"},{"revision":"f93570f2bd4d71032cc5b5daf6b37a5e","url":"assets/js/2db69acd.6abb2f29.js"},{"revision":"55e61695fd0cc473c19c8e7a55f946cc","url":"assets/js/2dd4cef3.b8aadd71.js"},{"revision":"846d30a9a6223faf0cee3144814d4f58","url":"assets/js/2df29dd6.ad532986.js"},{"revision":"539a1b9f8e3c6245e6e70a8452d6d821","url":"assets/js/2e97943b.6d1d73df.js"},{"revision":"87505743d9217020c5ece8de829d80c3","url":"assets/js/2f210215.759e9382.js"},{"revision":"fdda8035e819781e52ee58ae20302f11","url":"assets/js/30e81592.681d8f36.js"},{"revision":"2b5977f5f3e5bfd9bdaa9f6ac05d2d38","url":"assets/js/3207465f.23762e32.js"},{"revision":"3ea472e3cd761edf5084e8af29c46034","url":"assets/js/3217192f.78ccedd4.js"},{"revision":"f279f6878fffaeb76aa18e8e2173634d","url":"assets/js/337bb98d.a402d1eb.js"},{"revision":"9bc7c6b2b510bd9d6896c3bdab9daf46","url":"assets/js/338da531.87f6700c.js"},{"revision":"e610083fc8bf497a1c589b500b363d9b","url":"assets/js/3455c302.95367be1.js"},{"revision":"1e532a4f042fd52d01aa4e47c3520653","url":"assets/js/349ba911.f8be378f.js"},{"revision":"d93fa0c812d1286905fea1a72b803709","url":"assets/js/3513.11a4b218.js"},{"revision":"7e92d9057ea82fdf54c98efa6e4b9abf","url":"assets/js/35b78b3b.75e70cbb.js"},{"revision":"498e7cd911011e4b1919fbeeffbb7945","url":"assets/js/36720592.6ff01f65.js"},{"revision":"4df3290fc07a6a80d85eb817c73eee19","url":"assets/js/3684a828.f31be315.js"},{"revision":"111ed45e65b75134992ec44ebeffa837","url":"assets/js/36994c47.a8d503bd.js"},{"revision":"a77bdee24dc69cb90079cc7c08bff0e7","url":"assets/js/3721eef1.8eab28b1.js"},{"revision":"d49c5311f985ea20a3dc3c4675d2c4ef","url":"assets/js/37da7d7f.57e9f241.js"},{"revision":"3041647e0dbebc6cb14bf2e56e77a050","url":"assets/js/37f731ce.3123e771.js"},{"revision":"a3d60783aa8127f6153ccc2dd19c24fa","url":"assets/js/38cc0a44.9bb72b55.js"},{"revision":"900d305e4263027e937880371c0895bd","url":"assets/js/399c0679.fbda37bd.js"},{"revision":"c779587b6a9fb305d9077e85ad8cdf47","url":"assets/js/3a2db09e.431123fa.js"},{"revision":"7631dc51aa4e4f0fdc1cb9de92bcf831","url":"assets/js/3b753a9e.9cf37427.js"},{"revision":"c4789ae2f46ea1f166dea0874f497e30","url":"assets/js/3d84d671.5fb58017.js"},{"revision":"76f8a23c91445848589d20c847a5c30f","url":"assets/js/3dad9047.880d4eb8.js"},{"revision":"3d2f919cb0cf1a365855dba27c4c75dc","url":"assets/js/3e5df077.b6bdaa49.js"},{"revision":"148413174e580f1e05f8809e48eafdc4","url":"assets/js/3f0fad88.cfe0a4a3.js"},{"revision":"90240aa6171440ff6f79f291d9ff72c4","url":"assets/js/3fcf94c6.90bcf826.js"},{"revision":"657c81162e86ae7d8bf45ba0eaccf89c","url":"assets/js/3fe5c5bb.5aa053bd.js"},{"revision":"bc6052ed18b1e11f0098be8ff2c7001f","url":"assets/js/426ec72e.8e68e336.js"},{"revision":"4035ed94ed8a803803c2b38fea26ca24","url":"assets/js/43b0bb3a.86a9ddc7.js"},{"revision":"6134655aceb23d263fc525e700f74908","url":"assets/js/4419a2b6.94c23657.js"},{"revision":"a6bbbc3a8c2c04df161caa735bb1f11c","url":"assets/js/45bfaa30.a254a0af.js"},{"revision":"52d18adda7acc3f9ffeb92b1f7b0e409","url":"assets/js/45c93a33.1efbd3b1.js"},{"revision":"d97f4bc60cc5ca6d9de1d2da9fd707cb","url":"assets/js/461eb328.bab4c2c2.js"},{"revision":"aca3ba88f461b79549d611a3ba6b836a","url":"assets/js/46693ed1.d06daae5.js"},{"revision":"48262b76b11f10dbb91e27c0ed2e0273","url":"assets/js/472cba27.3976c91c.js"},{"revision":"84267c4138c5abcce9ddf707548b9d57","url":"assets/js/4741cb33.489871e1.js"},{"revision":"5f5dffce2168df0df9f19f05c0d5eca6","url":"assets/js/47572dc7.71a7b1f3.js"},{"revision":"832a674eae21727b2ebbb7124601a59b","url":"assets/js/48628d60.171b6f29.js"},{"revision":"dcb770366debe5051e9569e68520e2cc","url":"assets/js/4944d1af.f5ca3c44.js"},{"revision":"3c079304cce1703f54642b87d6234785","url":"assets/js/4c0b289f.448f3d7c.js"},{"revision":"52ba61f11ffb2b9809adfaa62e8a0f55","url":"assets/js/4cafb32f.3c6f476f.js"},{"revision":"f6db211bdcb8ed149dfda0dc37118f17","url":"assets/js/4ccc72b5.19f61828.js"},{"revision":"04581101b6604419c54a4ffd36e76593","url":"assets/js/4d299ce9.29e25e7a.js"},{"revision":"38ae20c3a50b12398e55c8bbefe115fb","url":"assets/js/4f24138e.c6fa4f05.js"},{"revision":"787f7095fd0ac5cb549a094944c3620f","url":"assets/js/4f353006.05cdf3c9.js"},{"revision":"6ad79c26c1c7d3d38a7deb5a39102df5","url":"assets/js/4f5b95fb.c0bb6e0d.js"},{"revision":"467198269a2df1460cb5af4b16aeec61","url":"assets/js/4f6c1b53.80ab7d8d.js"},{"revision":"589b07aa65781c551c0d72ca0f85abb9","url":"assets/js/501058eb.084e95b0.js"},{"revision":"2a861250e33e9962dda032c2153d36f4","url":"assets/js/5204.fa2a6f1e.js"},{"revision":"dfe94341354028063eb141702fc44f9a","url":"assets/js/53ef8c8c.f65a7af9.js"},{"revision":"2c22ecdce9d9cd220030b3e38619ad2d","url":"assets/js/55b2f05d.91a0e26c.js"},{"revision":"28662932a6dbf01a6b0d6fddc7d52724","url":"assets/js/56082b9d.b59b774f.js"},{"revision":"a4598ef7752ceca862d73e5939e503ed","url":"assets/js/56b5227e.f5ee086b.js"},{"revision":"bd879f5385bd0ce8d5f9edeba10f57be","url":"assets/js/58259761.552fcbc3.js"},{"revision":"711cddce29a1f5d17c40ed1c37515cae","url":"assets/js/59176472.adf43f20.js"},{"revision":"499cb95892636ed2e8b00b0e91408c64","url":"assets/js/59caa285.69e3bb5e.js"},{"revision":"11237e2bea133b60d9049826952ef01c","url":"assets/js/5bcffa70.46a948ec.js"},{"revision":"f8db500d2bd3314b092a20ef578a2710","url":"assets/js/5c09d473.9910a6e3.js"},{"revision":"275da28ccf34c3af7cbeeaace1fe80d2","url":"assets/js/5ccd99c1.989d2ea1.js"},{"revision":"edc3bb9fb626ef0bf66887d02ec647a7","url":"assets/js/5e5de49f.1d5fa9c9.js"},{"revision":"f950fa9fda54f0f6ff6ac159de7cc0f1","url":"assets/js/5e95c892.ce1aff64.js"},{"revision":"340dab07d27940634f1c8e945ff48ddc","url":"assets/js/5eba63e2.1a38f5b9.js"},{"revision":"24fbaea393735e65ca55e2c42e6d2dd7","url":"assets/js/5f04515a.8ace49e0.js"},{"revision":"e28eeac8bb8d4bab0fbe8651bcd2fe29","url":"assets/js/5fbaa4cb.a64f7514.js"},{"revision":"78b7ef0474b6aee556d4b83551687183","url":"assets/js/616659e4.03156fe8.js"},{"revision":"3f84382fafaf5b2a55e6ff192c65e00e","url":"assets/js/61a70014.6eeefb1b.js"},{"revision":"96432f70093ec4f4964a5352fb0146e8","url":"assets/js/621db11d.0c26456c.js"},{"revision":"507f33afdcf8b329948eb3e177f3a1d3","url":"assets/js/628067ee.a1c2202d.js"},{"revision":"3cacbdcd6738e9a62e8fadf3466bba2a","url":"assets/js/6509.e75b99d7.js"},{"revision":"d591d061c234df7eb28637240443b75b","url":"assets/js/65514a8b.2aba86e9.js"},{"revision":"9b8b0f4c6e5f571039b4a527f3018dc5","url":"assets/js/658997e5.b7df807f.js"},{"revision":"4590028bf1a358caf01cc941c5eb73c3","url":"assets/js/6681.32e69c67.js"},{"revision":"8ed5b18567a17ea30b33486ed0815789","url":"assets/js/668d038d.f22c2f58.js"},{"revision":"bea348698f295b95f6aec1fe3902edcf","url":"assets/js/6797.043ebaac.js"},{"revision":"094e8d6fef56c8ccc181883c1344ec56","url":"assets/js/6875c492.f872220d.js"},{"revision":"34003728e9c45f0b59477aa66e3b778b","url":"assets/js/688e1d34.c8eed6b0.js"},{"revision":"2c30483ca41db76387729fd21bd6498f","url":"assets/js/68b9bcd7.1f893336.js"},{"revision":"2bb1efc64be3dd2d6c2838f960268483","url":"assets/js/68d07108.67db87ee.js"},{"revision":"c328f3295ebc60602ab513bc37534964","url":"assets/js/6945046d.09b0a8f7.js"},{"revision":"b781aeda86340b176f73524f814d8298","url":"assets/js/69c6d958.974b2c58.js"},{"revision":"68fa71af153463937f53239c0057afe0","url":"assets/js/6be2c223.99286f2b.js"},{"revision":"55214f8318985fba7ede6dce6c916780","url":"assets/js/6c11e88a.45abea6a.js"},{"revision":"7884aca2ed06d667689e16b8a94ac91f","url":"assets/js/6c74094b.408a5d95.js"},{"revision":"bc796597c461384c447556a6d4b8eb98","url":"assets/js/6e8d9dba.f8e1b0e8.js"},{"revision":"1dfdda88899e0fffecb045d040660f3e","url":"assets/js/6f06f4ad.df7bd4ef.js"},{"revision":"ec8e3551a03a290e29fffc18c58f0ded","url":"assets/js/6fe31f20.a40354dd.js"},{"revision":"e184ae5aa14385a09bd063b2104baf6b","url":"assets/js/6fffeb92.52388156.js"},{"revision":"deb9ec8a3026ceee5ad0eaa10858faea","url":"assets/js/705f0e63.087a5c95.js"},{"revision":"0811d2098d09680d499dfebd10e4dcea","url":"assets/js/706e313b.2c39a9cb.js"},{"revision":"82d280eb40998a1a3cf048f779eefb84","url":"assets/js/708c5d98.9488e4a2.js"},{"revision":"29d5a037c9cd1254cf453e2d8fca7573","url":"assets/js/729dfcf2.d07e826b.js"},{"revision":"11b3c1ce87ee15a686af0380782abf4a","url":"assets/js/740a169f.8b09e97f.js"},{"revision":"a8c7b5887bc3e758c3b410181e40deb1","url":"assets/js/741c8532.583d224b.js"},{"revision":"763b440264ec2bdcecfd0a987aaccff6","url":"assets/js/74271d73.3ce3d119.js"},{"revision":"20e2ee97d9f821fa452ebcc804adf687","url":"assets/js/745a0d75.72395638.js"},{"revision":"33f40aa0e925cd3f8bcba7626ff00c1a","url":"assets/js/747533bf.7a2b9296.js"},{"revision":"b94671914846c1ec6fcd8cbe3da28242","url":"assets/js/74778198.77cbe713.js"},{"revision":"fad0cc831ea3b2ba11bac62d10ea2441","url":"assets/js/7610.219e49bc.js"},{"revision":"a2f5acef59751fac3ad07be401bd7624","url":"assets/js/761c49eb.6004384b.js"},{"revision":"0e4bc22bb19488e84be6a4507ae674b7","url":"assets/js/7664.bbfc94e6.js"},{"revision":"8292c65fad9281ef8de1edb063a18baa","url":"assets/js/7684.47135d85.js"},{"revision":"5a153b796fa1062b43944d6ac7461d8f","url":"assets/js/7729ec19.680a77c8.js"},{"revision":"617b60012796094ff881c8a9640010f5","url":"assets/js/77a4c7dc.dc711337.js"},{"revision":"e31a9cb3de846a595b842ef3e68adef6","url":"assets/js/788cfecc.b8e942f3.js"},{"revision":"c077dd8d0c0f2bc1c0850a750ebae855","url":"assets/js/78caa0ca.52bef9ad.js"},{"revision":"947b727cb8789f5869b9885d7926c7d4","url":"assets/js/794458d3.d7a0f1a8.js"},{"revision":"b8197f660dde87a55389291d5dae7167","url":"assets/js/79c6e179.41b0f5c2.js"},{"revision":"f1d4376fb788b517a1b19a5289c0d2ac","url":"assets/js/79f3f4c3.e02093bb.js"},{"revision":"3d806de8c15361f45fc9ae8a4aca53ee","url":"assets/js/7b0d4d2a.ab97f6ab.js"},{"revision":"3c4830cbcbd54bc9e2b2363678391dc2","url":"assets/js/7bd741ab.4cb377ab.js"},{"revision":"80378edc29a8e066893a9e4b1cb62a93","url":"assets/js/7cca66c8.f96360f3.js"},{"revision":"279178fa93832f3769ccd4f1d78eb760","url":"assets/js/7e5bf132.54ecdc0a.js"},{"revision":"ff7da786d4f063084a29bd50d695aff0","url":"assets/js/8073.df6d4bd6.js"},{"revision":"92834a217a8ef705f3ff5634041abd58","url":"assets/js/814f3328.e0dbfee4.js"},{"revision":"97c47458af092a59c6e874419ba69df4","url":"assets/js/8182fbba.89b3003f.js"},{"revision":"8742e71fe90f547bab53d786f674a876","url":"assets/js/81d7df49.71f268a3.js"},{"revision":"783a52329c5a8b75ec39b3c2216b0cfd","url":"assets/js/8321.556f3911.js"},{"revision":"3ec5e773fecfe21b2473a78513e31f8e","url":"assets/js/832fe255.aec366f0.js"},{"revision":"7250cdaac0390975350792f0be62fd64","url":"assets/js/835644da.b72ebd05.js"},{"revision":"edf66efab48264cfb7073ccf120386bb","url":"assets/js/83762e81.92a22188.js"},{"revision":"26bfde3fef1592e8b0f71ea3cfa1eaf5","url":"assets/js/84191490.6ae49a26.js"},{"revision":"cb66f1b0f8ee32893184c61686e7a61c","url":"assets/js/8699.a7b03235.js"},{"revision":"93f5920f0e9774523653b80d35e667b0","url":"assets/js/86df24e0.b2665453.js"},{"revision":"e3abdec9d3805c0dc9921293c1fdaed0","url":"assets/js/8719167c.4f2f7b02.js"},{"revision":"91aabd0b2f2800528404bc44d354439d","url":"assets/js/875c23d4.92e8fd6a.js"},{"revision":"7e5584e59cd99ade9f65973dce85f92b","url":"assets/js/87a28cb6.6a7e857d.js"},{"revision":"f8b7236da714271f38a8292c86421603","url":"assets/js/8863026f.116e2748.js"},{"revision":"447330629a165ac2b71ea8a837444eb0","url":"assets/js/8a8a8d12.9fae3dbb.js"},{"revision":"9aa2f4d94923513bdcc5bbf4ff7c8c27","url":"assets/js/8ae8df02.963bc273.js"},{"revision":"8898604e02c982a08606131fa8124d4a","url":"assets/js/8afe7a36.3a23d372.js"},{"revision":"f868e73d999ff83dfffc35b38ec48e80","url":"assets/js/8b473417.c7544684.js"},{"revision":"8f7e8ee5d36b49e585b28d8530672b25","url":"assets/js/8c237176.81551724.js"},{"revision":"b7a98645c7b246c51b7e4d617b4657f0","url":"assets/js/8d05d3b9.9b7af5c3.js"},{"revision":"cbab556a62af62c6f54689a950fa16c6","url":"assets/js/8d680937.9ea575ad.js"},{"revision":"94f18036af2d8d6710f6920ac35a8571","url":"assets/js/8e34c248.a224a165.js"},{"revision":"c0001783dfffa793a1bb04c1bed16b34","url":"assets/js/8ea09047.3806ef8c.js"},{"revision":"c83e0a67f1aaadb437a4e23bff82a730","url":"assets/js/8eb7d3b7.c94b89f5.js"},{"revision":"ceb29683e1386981aff464da5c9f1249","url":"assets/js/8eb7ea3d.921f9456.js"},{"revision":"045f7f0ee2d5a7f6e50bf39ffc65f3b3","url":"assets/js/8ecf5665.5ce76f3a.js"},{"revision":"fc9d14418142b138875fc54256ebde10","url":"assets/js/8fb68466.b6bea217.js"},{"revision":"c050e359b587080959c0cbfeaa40e160","url":"assets/js/90012922.9dc915f4.js"},{"revision":"c01ad19d5a53838df286aa7c8c9ea89f","url":"assets/js/9071.d983bd22.js"},{"revision":"244f936c343a1e6e2f674c6d61236d72","url":"assets/js/923572fc.dc426937.js"},{"revision":"5ab784efb3d9f909e12a1c3b53be4060","url":"assets/js/9249.867e6746.js"},{"revision":"6caa0eb3d911302ab40c63397ceb77d8","url":"assets/js/9635d8cd.0612acb2.js"},{"revision":"a58fa8ec89497a1140ce3bd0cb9ecd1b","url":"assets/js/967f84c6.03dd3a2c.js"},{"revision":"c82492568117ae6609d825d5e0d03ba9","url":"assets/js/9737.deb08b2c.js"},{"revision":"b61c2f5edff520c5d3981771f38dec76","url":"assets/js/9789907a.72993bae.js"},{"revision":"1d94bf9089b2f7f1a7aa760a0e41d660","url":"assets/js/981e23ba.e2190e8f.js"},{"revision":"4cea82ae50ee814a140db3f9ac07065e","url":"assets/js/9860.92866ef0.js"},{"revision":"f171248047570e18e19183cdb0f93a04","url":"assets/js/992e7591.80dd1428.js"},{"revision":"26b77ee762dbaf84a79c82942df388c3","url":"assets/js/999e89ae.2ea3c7d6.js"},{"revision":"9d5ae1b196e60b49d8b04bba44fdb4c5","url":"assets/js/9af15fca.e1156f9e.js"},{"revision":"b7a3a5e77bd8ece386fecf28a829e5d0","url":"assets/js/9c4fcbe3.09b15264.js"},{"revision":"b1bee183a2d3d55d4e5ebc85b51891cb","url":"assets/js/9c5f277f.5f7368b5.js"},{"revision":"ec32733d769cb33d9fbf2704d6722981","url":"assets/js/9c7f5174.438f9a85.js"},{"revision":"a088476861818d7061f042109c5e888e","url":"assets/js/9dc6e56d.f847a0a7.js"},{"revision":"e079561d0414078418a51bcbc549db1f","url":"assets/js/9e4087bc.808019d2.js"},{"revision":"4696f3b2a10bf983b8c28984e7627bab","url":"assets/js/a00c7636.af2c6374.js"},{"revision":"bec8f7e5d91973af073bd30d785324be","url":"assets/js/a0250632.60edd3ef.js"},{"revision":"e08414407e2f8ccd0d49e5550302f597","url":"assets/js/a1c09ed5.3e933078.js"},{"revision":"fbc6e42bc2ac52945d25c70e24fecdb1","url":"assets/js/a337d291.d87a6a4d.js"},{"revision":"83bc6805a2b2a4e0cfefffc8966c1152","url":"assets/js/a36997ca.963aecc5.js"},{"revision":"9263654719f89feb167d9e5ddfa1ce55","url":"assets/js/a478bba5.263abb38.js"},{"revision":"8a9a9838a691c1110beb3fe8aa94b2f3","url":"assets/js/a5d0d54a.49bf69f7.js"},{"revision":"c63320bbc6f81f9384933c67296b881d","url":"assets/js/a6aa9e1f.413bf781.js"},{"revision":"2c9b4db8f749cb99be6cff4de3392a20","url":"assets/js/a6c1eabf.a997a57a.js"},{"revision":"8c8028b1964a8d607f5b54e409e36954","url":"assets/js/a7456010.955429ca.js"},{"revision":"cd173e727738fda17eb7f9bea30c9bc8","url":"assets/js/a76999a3.1870a70f.js"},{"revision":"0798ce727870db529a1589eaab8f142b","url":"assets/js/a7b13d33.0e0f9665.js"},{"revision":"0a351bfb213aa19feb0745b5452ac4a1","url":"assets/js/a7bd4aaa.1780b965.js"},{"revision":"a242421a533c9be6f888030e386794dc","url":"assets/js/a83073ba.77c9b8a5.js"},{"revision":"35497e9f594142c31e207a479e0360a7","url":"assets/js/a8e4abbf.074f6e63.js"},{"revision":"58c1cd432afbe94baca1226442b85307","url":"assets/js/a94703ab.e3411a31.js"},{"revision":"66ec4231d06b71c67e1b0d4a11acb3fa","url":"assets/js/a9b066a5.bddaff79.js"},{"revision":"96bb745f8b27f06060f5a40c6e104327","url":"assets/js/ac88f401.94b5853f.js"},{"revision":"780e75199aef4c2f3679313436b6e38b","url":"assets/js/accc368c.0dff5b9f.js"},{"revision":"7d5e4fc6510d8e17654dd30bc163e70b","url":"assets/js/acecf23e.d61e7861.js"},{"revision":"00205f6cc56ab5c6a6169d9a616104f6","url":"assets/js/af690be2.b5898cac.js"},{"revision":"f5ced7a822625b764f78a9fa8ff20423","url":"assets/js/af8066c0.730241ed.js"},{"revision":"13d7c23ed5a0d1918e1969c9b1942613","url":"assets/js/b0b51527.e5ab97ee.js"},{"revision":"a0d2a80adbf195d25ccdd66efec2e17f","url":"assets/js/b0f34ff6.b8f54a29.js"},{"revision":"4b4733f3b1eee97345be360b3d8001df","url":"assets/js/b12d2d8a.c4840bc4.js"},{"revision":"5602fa9964c23017245b0716a1ffc49e","url":"assets/js/b20e7dd6.ef98b803.js"},{"revision":"3c83198e0e493ef8b31c5c6a28b4d24f","url":"assets/js/b2b5e2b8.0a774cbb.js"},{"revision":"5ff451a7f51f91a804c4e973837622df","url":"assets/js/b3341e65.f8d77a3e.js"},{"revision":"0050597333c4ae2e1d2692d84a4a3fe4","url":"assets/js/b3688bb5.b63e9e17.js"},{"revision":"3a37497dcc26efb40f2fa7e8ec083e77","url":"assets/js/b419cb6f.944afc7a.js"},{"revision":"c54c24d0fc45f81b076cdc56eea2b2cc","url":"assets/js/b4353ca1.a6ec926c.js"},{"revision":"dd042c8462526be8073b2a8a209a6ad7","url":"assets/js/b78f392b.44cf7e31.js"},{"revision":"7f766dde91d64f201e2cfdc2b9531cb8","url":"assets/js/b86ddee6.5b16f78f.js"},{"revision":"edc52ea5436e03538995e14452b6d914","url":"assets/js/b86ef79d.8c75cc85.js"},{"revision":"ddff4cd29758b603c6dd7368508b1834","url":"assets/js/b8de5fb0.215329a1.js"},{"revision":"789707a1647b9b41967f30b9654ef7a3","url":"assets/js/b9f0dfd0.62d03ebc.js"},{"revision":"449696d3caaef656e436633dbb5a6544","url":"assets/js/bb534d42.adce91f2.js"},{"revision":"29bd0bc293b7ad401524950ee5f9e873","url":"assets/js/bb6a9ae7.1435202a.js"},{"revision":"75a4016cae30796c37e71b06a95961b3","url":"assets/js/bdcae5c5.a64e25f4.js"},{"revision":"01010c061d6c3ec34dd851e5c85d2bcb","url":"assets/js/bf179d5e.508b9045.js"},{"revision":"563bf5a824323950202284a32548eac3","url":"assets/js/c0b9a768.b59adfe8.js"},{"revision":"f7218610cb916c8dbc7ff51bc2341b9c","url":"assets/js/c0c59237.d4405030.js"},{"revision":"95ccc6b5bb9210fc5bfc5c89d3c97995","url":"assets/js/c141421f.bb91e9a5.js"},{"revision":"b9a7b4abc3c5a0c1acabe534b02405a0","url":"assets/js/c15d9823.ec610949.js"},{"revision":"3c635af9e37fff189a606d24cfb37fcf","url":"assets/js/c16f7475.ad1d35d1.js"},{"revision":"1159afb50e2e15d7e7100831658e1961","url":"assets/js/c21ca49f.0ecb4cb8.js"},{"revision":"328e70a2ac8c12d05e78d3be141dbb95","url":"assets/js/c2f5a91c.0de38f78.js"},{"revision":"ebfdcd7b2ffaf8b80da08478a4eb8e65","url":"assets/js/c31d8245.e249e8b3.js"},{"revision":"2ccf6970b99d5b70f2d5671e2b7e570b","url":"assets/js/c3f9c7d1.9709be6a.js"},{"revision":"6a8c4648af4c7e6a370695fb2c54023f","url":"assets/js/c6b65a80.9f076e0f.js"},{"revision":"5aaa84543726771f9c8160cc61c3628f","url":"assets/js/c92cce4f.efbb9539.js"},{"revision":"8c87685989a9f6e8c4bb0fd1055cfed4","url":"assets/js/c997b33f.24ae0488.js"},{"revision":"4f538e8191b90d04b4627f08b273cc62","url":"assets/js/ca53c4fe.a27d4578.js"},{"revision":"da3f13baf2d740eac214ca76ba5e6cfa","url":"assets/js/cad2367e.ce1d5447.js"},{"revision":"357701ad871a53a8ad331a1065166765","url":"assets/js/cb5fe387.992f2cc1.js"},{"revision":"685050b4069f33cdc86f80ed2dc8165b","url":"assets/js/cc6a20fa.bd95f519.js"},{"revision":"b8730006604bbbbd62afab956409f724","url":"assets/js/ccc49370.d98c8e54.js"},{"revision":"c3b854ffa8363001ebad2b15b5cd40d5","url":"assets/js/cd90d89b.2f67ba9e.js"},{"revision":"ac50d5fa6a952fcf9efdceb7a257648d","url":"assets/js/ce3cc804.32b38ce6.js"},{"revision":"a3def90efa4e0b3df1aaaaf4c1969f5c","url":"assets/js/ce77d86e.c71f895e.js"},{"revision":"9af382ba71ea9a8359656fe741a1301b","url":"assets/js/cefe0883.e2b9ccfc.js"},{"revision":"2f40050ec2c9dafb7be7bd4e6df2feae","url":"assets/js/cf9d90c3.5c657ed0.js"},{"revision":"2c1272d8c3179db823eaec640267194f","url":"assets/js/d0337b59.10000d39.js"},{"revision":"7a80bc7a0694a977b2c506c59464377a","url":"assets/js/d05a454b.0a7fe678.js"},{"revision":"af17d88502d15b02830768765e9dd85d","url":"assets/js/d11812ed.8cb212c3.js"},{"revision":"371519081e5463ff18209ebf3ee4a5b7","url":"assets/js/d2063e06.612c9f67.js"},{"revision":"f96a4b49bc87bee0f1bc88b064f1fe76","url":"assets/js/d291704a.3b397a5d.js"},{"revision":"2d9185f82ea538d32e909ad6669c193f","url":"assets/js/d349856d.6299d653.js"},{"revision":"58d1bb9caebdb8ed62350b366e0f49f5","url":"assets/js/d4534b0b.2726c7ab.js"},{"revision":"c27c3795fae56e4d5f2577a1b1d1e130","url":"assets/js/d48e063d.c2c906c4.js"},{"revision":"f8da5c3389a050b1af13de4b16b0dc59","url":"assets/js/d4cb92f3.403fb1ea.js"},{"revision":"2b6b244b72ad167261eb1a5d2a9881d5","url":"assets/js/d6af4c9d.410e6651.js"},{"revision":"8976bcbb78a3b772b73f74afa160cced","url":"assets/js/d82339bc.725de626.js"},{"revision":"520fa7cf6987839a9c11d098a07ed9df","url":"assets/js/d874ae11.5601ba15.js"},{"revision":"3752bb3122a6c1ce0dff922a921112e6","url":"assets/js/d8c9e80b.e4ad7e30.js"},{"revision":"0a9c01fa5868e1e4b8a02a63aa4d60db","url":"assets/js/d99d6bd0.13239122.js"},{"revision":"81053a33a7643cd436e72e9c8b5e55fb","url":"assets/js/dae76d1e.e4335408.js"},{"revision":"def586cebca49c808b594480e2d7cfef","url":"assets/js/db84588d.5568b896.js"},{"revision":"fafc26afffc22a1559b0c33b18623ce8","url":"assets/js/dc9e3d96.19e40013.js"},{"revision":"b2aa79ea0e9ed52f061890349b380c28","url":"assets/js/dcadf437.389e4960.js"},{"revision":"df085f973f4bab049964653841a8d609","url":"assets/js/ddb9df4d.d8b72b1f.js"},{"revision":"a0a2cd1e1a91563562f84c159a2932b6","url":"assets/js/ddf03248.700c2f4c.js"},{"revision":"0bff0b7951f4dd1728b311b2c16f55c6","url":"assets/js/de9c8563.a22d9af5.js"},{"revision":"58c5642157dd302d1a8d5b3e6b696f52","url":"assets/js/de9dd018.64da0c23.js"},{"revision":"436a9971eb1b161683b1231dc2655de0","url":"assets/js/deafa4e5.784954f7.js"},{"revision":"1f09e71137d2ba51bfff8141537e3d04","url":"assets/js/dfa535eb.1e96f172.js"},{"revision":"f52d6ff127794079184fd038d79de473","url":"assets/js/e0579d55.b6805e3a.js"},{"revision":"1d0e423e3d6d658a57aebfc7c6d903fa","url":"assets/js/e24986b8.6a1d7d30.js"},{"revision":"1db3aaa3928de4b7eb6dca906e9a23a3","url":"assets/js/e5fd65d3.025a3fc6.js"},{"revision":"cd3306b3d8a68e06425b6d87f296c6e8","url":"assets/js/e862bac2.6e4b5411.js"},{"revision":"6428e485187660d5ef62877e7f7e456f","url":"assets/js/e8d99bc3.53b10f02.js"},{"revision":"63c8d06c7e2e264bc68cb91f5a11264f","url":"assets/js/e9baf1fa.7d23c1f5.js"},{"revision":"4f48657b241e55291ab45c316d8f4223","url":"assets/js/ea1b0c8a.49289240.js"},{"revision":"a497e36427859f091d1f1b3d3b51939b","url":"assets/js/ea51a2f2.c6ff6ea3.js"},{"revision":"2797c4e6448b986d273c0b5df8d58f34","url":"assets/js/ea88091d.78ce4f1d.js"},{"revision":"ad3ec053a132d4a2f90ba161f1539d1b","url":"assets/js/ea9fe14a.25e56182.js"},{"revision":"5ee15bfc750e409c4e655ec4d23b9736","url":"assets/js/eb061ae5.49769ba0.js"},{"revision":"c920727fb30ba39f69e7fd02c91daa01","url":"assets/js/eb353b50.29858783.js"},{"revision":"6ea18830fbd814376611048d76c00e3a","url":"assets/js/eb77ef72.9062ac9d.js"},{"revision":"50e2b493343bf69e1b82581e8b391876","url":"assets/js/ec868cf4.c0afdbc6.js"},{"revision":"2029e3065de034d6a08694945e1e15b3","url":"assets/js/ef75aa72.6dc78cb6.js"},{"revision":"f32a6af725c36159afd3cf996f2aae9d","url":"assets/js/ef8b811a.a9441d5b.js"},{"revision":"75dee6114b0dffd0dc5a593ad3bc59a2","url":"assets/js/efabdd73.c5595512.js"},{"revision":"3012f4855afdba495fd074fe4056322a","url":"assets/js/f62dd9b2.a7fcedf5.js"},{"revision":"2e8d47533d95ab69471b124fec1799fc","url":"assets/js/f6e27949.3c437806.js"},{"revision":"fe800658b4b9651849200a7d266cd0db","url":"assets/js/f725c10e.c847819a.js"},{"revision":"f2cc7bc782b67a7ef5ecf08127dfd383","url":"assets/js/f74d077d.30964352.js"},{"revision":"c84764069c25e13b4fe3eb15d5a01eb8","url":"assets/js/f81c1134.f1cca4df.js"},{"revision":"5c8be05c68e96980bb15c42a1837925e","url":"assets/js/f897c88e.122a1110.js"},{"revision":"31bc467ac0611f2d1af72ab2a0cf9690","url":"assets/js/f8bf1a4b.8fb321c7.js"},{"revision":"f2d778c020930705247c4c30476ccfef","url":"assets/js/f907c6c8.9dad6f11.js"},{"revision":"4eb625d5ab3e52326a10e3cb92018e32","url":"assets/js/faf9db9b.48a5f39f.js"},{"revision":"e2a270fb3498ec276825365a69c2783b","url":"assets/js/fbcdf3ff.4379e922.js"},{"revision":"2dd7f6ce045dd63de852bb7c761d82f6","url":"assets/js/fca48e83.e6e79d7a.js"},{"revision":"35e9c8b0b93673269c0a72ecfe44c2be","url":"assets/js/fcad7ab5.163aad5f.js"},{"revision":"9b119d44bdf1ca463c031b89e431f1fe","url":"assets/js/fcdc70db.6646765d.js"},{"revision":"7a6198249dd2cf7521353513b0327e17","url":"assets/js/fd55ca99.735872f9.js"},{"revision":"be72e1ea66a7e642f307785207a83c51","url":"assets/js/fd714e9a.a04766c0.js"},{"revision":"b7b78be05b934c15150099143ff4fcb9","url":"assets/js/fe18e260.9acd84c9.js"},{"revision":"0dc1f0591dbbeb162de3bf1511830ec4","url":"assets/js/fe5fc83b.a3d66af1.js"},{"revision":"38ff8a68ebb1079fa7fb4ac3808d565a","url":"assets/js/ff61bad8.20c3e157.js"},{"revision":"e689f327341219aa2bf1befc9305ffeb","url":"assets/js/main.98792125.js"},{"revision":"9f62a64f9c3dddc23fb0e4d6be6a82d6","url":"assets/js/runtime~main.c0edb250.js"},{"revision":"52201bc0e7e8eeb9b1a352bd13857031","url":"blog/announcing-typescript-eslint-v6-beta/index.html"},{"revision":"50d9f5a623596a5ef30c524a9e9d2f2e","url":"blog/announcing-typescript-eslint-v6/index.html"},{"revision":"d131d3a614ba5d8192d98626a654c957","url":"blog/announcing-typescript-eslint-v7/index.html"},{"revision":"7c43d66d870f55e557bd392058bd4819","url":"blog/announcing-typescript-eslint-v8-beta/index.html"},{"revision":"a32cd0d3448d80074800ff0bfdd87893","url":"blog/announcing-typescript-eslint-v8/index.html"},{"revision":"bce38af5755ab730aefdeb3a0f9a6b1e","url":"blog/archive/index.html"},{"revision":"250c0c6280e55637a04ea46087d530bd","url":"blog/asts-and-typescript-eslint/index.html"},{"revision":"46948b2ed531e06071cad292404fcb52","url":"blog/authors/index.html"},{"revision":"4ab42a4fd9c24e6fb644212779991032","url":"blog/automated-rule-docs-with-docusaurus-and-remark/index.html"},{"revision":"6aa948b4e1ae48d8cbb9abecee779e3b","url":"blog/avoiding-anys/index.html"},{"revision":"dcd946913e6ac4771362d48a3379efce","url":"blog/changes-to-consistent-type-imports-with-decorators/index.html"},{"revision":"456a47229ec23b6b61e1af60a9d90fa6","url":"blog/consistent-type-imports-and-exports-why-and-how/index.html"},{"revision":"e7b60cd161b806de93e03de41c3f9950","url":"blog/deprecating-formatting-rules/index.html"},{"revision":"5c68436750de6ba9d73f24cb3482019e","url":"blog/index.html"},{"revision":"a938a373621ef2cd7668768be35337d2","url":"blog/page/2/index.html"},{"revision":"2f71bc735ee1b8908670a435d9739c93","url":"blog/parser-options-project-true/index.html"},{"revision":"fef1d0ba1d474ee7718ca233de304772","url":"blog/project-service/index.html"},{"revision":"d7af69cc36a9c744c92adc721b18c888","url":"blog/revamping-the-ban-types-rule/index.html"},{"revision":"bb1c86fb5050cd1d261b910460743d11","url":"blog/tags/abstract-syntax-tree/index.html"},{"revision":"9dd882faad0bafa056f75bd48923b6a8","url":"blog/tags/any/index.html"},{"revision":"e6119af7e2dd38c01f07f42ced9707bc","url":"blog/tags/ast/index.html"},{"revision":"1e1bb2d6332f311ce73b14ace671ba5f","url":"blog/tags/ban-types/index.html"},{"revision":"eed44920e86bcdfa62ec73a4641fa64b","url":"blog/tags/breaking-changes/index.html"},{"revision":"d34c6e9f50b5b029e7d01ccbb72146e4","url":"blog/tags/consistent-type-imports/index.html"},{"revision":"8c8b09a17afcc09e4de25b2b0422767c","url":"blog/tags/documentation/index.html"},{"revision":"106e6b991b44435d785e6e7242e473ea","url":"blog/tags/docusaurus/index.html"},{"revision":"deedd552e154b3b222aaa3adc55b1985","url":"blog/tags/emit-decorator-metadata/index.html"},{"revision":"887e1bc1e5f94d16ab92cf218891e495","url":"blog/tags/experimental-decorators/index.html"},{"revision":"d5248b3c5db467cf3ae30bb8f5b20f49","url":"blog/tags/exports/index.html"},{"revision":"353b0cbe2a28911a41e641d17ab346f4","url":"blog/tags/flat-configs/index.html"},{"revision":"e1e57889be072a2b576f78c38b6f1b94","url":"blog/tags/formatter/index.html"},{"revision":"4dafc64cfd4e47257e69b29878e35773","url":"blog/tags/formatting/index.html"},{"revision":"08ba036ff30b4af87d25d76198ce29fa","url":"blog/tags/imports/index.html"},{"revision":"7459df4cb0287d365b06e7d2481fa3dd","url":"blog/tags/index.html"},{"revision":"f739f385cdba56bcbaca13dba540a1fd","url":"blog/tags/interfaces/index.html"},{"revision":"df33ea3fab4b444e66a9b6b420130cc5","url":"blog/tags/no-empty-object-type/index.html"},{"revision":"ff812531d208290da78f353ceff4b6d8","url":"blog/tags/no-explicit-any/index.html"},{"revision":"62437652e844883952dce0fcdf164d36","url":"blog/tags/no-implicit-any/index.html"},{"revision":"8e0b8fcc9905c0173c709768bea9a0d2","url":"blog/tags/no-restricted-types/index.html"},{"revision":"7019e874efa50f14f0c472a83ae2a56f","url":"blog/tags/no-unsafe-function-type/index.html"},{"revision":"af1cac7aec1187d09c1d0eb8da251917","url":"blog/tags/no-unsafe/index.html"},{"revision":"ef3df3f6854e7048864c27e3eeae7cee","url":"blog/tags/no-wrapper-object-types/index.html"},{"revision":"f0a74b2b76306b60aa63176e95d43ffb","url":"blog/tags/objects/index.html"},{"revision":"3b9e7b7a0525eeeb62ee4cb93dbbb751","url":"blog/tags/parser-options/index.html"},{"revision":"9e32f0febe0fc6549607e78bb5597ed4","url":"blog/tags/parser/index.html"},{"revision":"c60c4f616339800cfb2b40c9e1bac945","url":"blog/tags/parsing/index.html"},{"revision":"8e215e3b60adb8b48203028a77988678","url":"blog/tags/prettier/index.html"},{"revision":"247b3b51eabcbe70d63e04acd42c89b0","url":"blog/tags/project-service/index.html"},{"revision":"c0d318870418bc2f23d790b84697eb4f","url":"blog/tags/project/index.html"},{"revision":"8825bf2894288722c1c4129c4cc41a47","url":"blog/tags/remark/index.html"},{"revision":"e8962c228101f7e8340d415c85a95da6","url":"blog/tags/style/index.html"},{"revision":"4976e890ab84aa862e8f0d7af906e888","url":"blog/tags/stylistic/index.html"},{"revision":"87c10065627ff2c57cf9410b6a3c6ed9","url":"blog/tags/transpiling/index.html"},{"revision":"2f68d8a3f2b9f6d60349651dd7c9c838","url":"blog/tags/tsconfig/index.html"},{"revision":"19f373927cebd35b4cd5d53b4b682dc7","url":"blog/tags/type-information/index.html"},{"revision":"68598bf900c23434510d70213c78449b","url":"blog/tags/typed-linting/index.html"},{"revision":"322290258272d3ba34c575e68f496a95","url":"blog/tags/types/index.html"},{"revision":"3545f9d605c6403ddbd3737e4ab96616","url":"blog/tags/typescript-eslint/index.html"},{"revision":"f5591b96e62b671a24765296277c131d","url":"blog/tags/typescript/index.html"},{"revision":"7279062a0c9b047f626e480bd650fe90","url":"blog/tags/v-5/index.html"},{"revision":"4a0c0d6298b6240074aa5049cd69d5d0","url":"blog/tags/v-6/index.html"},{"revision":"38cbce3fc14e89f5e547636ff7bc8f0d","url":"blog/tags/v-7/index.html"},{"revision":"21818ac7aaff71d4c8f0743858a8c72d","url":"blog/tags/v-8/index.html"},{"revision":"f58a82247677e31ddba322db6bee6e50","url":"blog/typed-linting/index.html"},{"revision":"639d9bf2a40e1017b3cc3c0bfe3698d7","url":"contributing/ai-policy/index.html"},{"revision":"91a9a8676e787e0c5628bba5838e3b1c","url":"contributing/discussions/index.html"},{"revision":"d7bc1cd2b6c5a6fd94722d5cb61f1cc2","url":"contributing/index.html"},{"revision":"11c972578f8c39ed6487940c1218637d","url":"contributing/issues/index.html"},{"revision":"c0d3693cbb91ac363a323c4fc2d366e8","url":"contributing/local-development/index.html"},{"revision":"511e0091aea776c1e6b9aaa0d9db04dc","url":"contributing/local-development/local-linking/index.html"},{"revision":"b478bdf53f6226aea5ae701f4d162310","url":"contributing/pull-requests/index.html"},{"revision":"545a0efc8127d839e0d01aaf463894ec","url":"developers/custom-rules/index.html"},{"revision":"036dfaf86399310404704e3bfb61dea7","url":"developers/eslint-plugins/index.html"},{"revision":"2314280afab9df332a34c26322b5e08c","url":"developers/index.html"},{"revision":"563527af766e1f25ca59dde7718534c2","url":"docs/index.html"},{"revision":"ae72057198692f8e112e770284413fff","url":"getting-started/index.html"},{"revision":"db5ecb354da1aa2813f933982f940aea","url":"getting-started/legacy-eslint-setup/index.html"},{"revision":"2becae42a36e0588a859fc3ba847190b","url":"getting-started/typed-linting/index.html"},{"revision":"97a82c98f3c007b9bc78209e389bb2ba","url":"getting-started/typed-linting/monorepos/index.html"},{"revision":"194ac660e39f532982c78879af2dd9f2","url":"index.html"},{"revision":"6b0e487a7826d034983ae236955b7ac7","url":"linting/configs/index.html"},{"revision":"228f3d2e5106ba6a5d96f046836124bd","url":"linting/troubleshooting/formatting/index.html"},{"revision":"20b26ee19456308886384b5db2aa16b5","url":"linting/troubleshooting/index.html"},{"revision":"ca2a9d52037ad4b5f5429e7540efd293","url":"linting/troubleshooting/tslint/index.html"},{"revision":"97a82c98f3c007b9bc78209e389bb2ba","url":"linting/troubleshooting/typed-linting/Monorepos/index.html"},{"revision":"db9c8c9a27f6661c0d50482a2fcfd3d0","url":"linting/troubleshooting/typed-linting/Performance-troubleshooting/index.html"},{"revision":"50d9e8976af053893779f27ca822724e","url":"linting/typed-linting/index.html"},{"revision":"ff64dc82f173501a787eedfe44bad67b","url":"maintenance/branding/index.html"},{"revision":"a08e8e69c7de1355c985a179c3b4cf2d","url":"maintenance/contributor-tiers/index.html"},{"revision":"e7a443a4e10626b7ee6a73fab8ed31f7","url":"maintenance/governance/index.html"},{"revision":"0cfcff83dfc6f9085f0d2e91f8f3e93d","url":"maintenance/index.html"},{"revision":"5ca7518f1babb8b8569c0f87580565a4","url":"maintenance/issues/index.html"},{"revision":"940ca3fe116509c98b6d2a514be9ad9c","url":"maintenance/issues/rule-deprecations-and-deletions/index.html"},{"revision":"f043bb294eff466d451b21c29236014e","url":"maintenance/issues/rule-deprecations/index.html"},{"revision":"1b2b1531fa88bbe27b99737f33a135d7","url":"maintenance/pull-requests/dependency-version-upgrades/index.html"},{"revision":"34803a48d81c52aac2f1f05b24b0da9e","url":"maintenance/pull-requests/index.html"},{"revision":"5abda6e12d475c70c056050cc5d303ee","url":"maintenance/releases/index.html"},{"revision":"af9a7d1e098a4c905439e2237fe58969","url":"maintenance/team/index.html"},{"revision":"decbeccd55be1776a804c5ded9b242a4","url":"manifest.json"},{"revision":"1eaa73f183d435644e5b16a5bf689b65","url":"packages/ast-spec/generated/index.html"},{"revision":"1250779f1ddf974d92414d7cae691cb9","url":"packages/eslint-plugin-tslint/index.html"},{"revision":"2e7b875bbbf5dcf908d36ee64e4884fd","url":"packages/eslint-plugin/index.html"},{"revision":"8290f749ad7448d3b0122875e5135d7e","url":"packages/index.html"},{"revision":"b7ec00f6bf639cfd176f3dc1473ee232","url":"packages/parser/index.html"},{"revision":"c929fa279270c17acc2f677035683119","url":"packages/project-service/generated/index.html"},{"revision":"3f0e3eb551d4e32433ad25636cbff3e6","url":"packages/project-service/index.html"},{"revision":"8bbc84017b193f52e62e1ebaa0c95ceb","url":"packages/rule-schema-to-typescript-types/generated/index.html"},{"revision":"9378822d6a054b1ea049fb363279c78f","url":"packages/rule-schema-to-typescript-types/index.html"},{"revision":"039c22ad6bf1bd0676da3710b97aba6e","url":"packages/rule-tester/index.html"},{"revision":"115332e77c69f9ba0330184a91421067","url":"packages/scope-manager/index.html"},{"revision":"83d993dbd3c8901841ffc7b4623244f7","url":"packages/tsconfig-utils/generated/index.html"},{"revision":"890448ef39f43931dbc55a3d1a1ec433","url":"packages/tsconfig-utils/index.html"},{"revision":"3e858c291720e5439a3196e976d291fe","url":"packages/type-utils/generated/index.html"},{"revision":"186a6f9ba401b2f2da14f9fb77744e8f","url":"packages/type-utils/index.html"},{"revision":"d27835708ee32a40d9dbbbe9bf39f1dc","url":"packages/type-utils/type-or-value-specifier/index.html"},{"revision":"680ce869856796210be9a4bcf64f40de","url":"packages/typescript-eslint/index.html"},{"revision":"f76b1b31db07d9a9fd2c5f7ccc8d3e94","url":"packages/typescript-estree/ast-spec/index.html"},{"revision":"14833e605d345e56f949cc6e13f9e643","url":"packages/typescript-estree/index.html"},{"revision":"33fc58d77884e457556156ebf336248e","url":"packages/utils/index.html"},{"revision":"fe7e2acb93837f7f6b6c9b8f86c53e1e","url":"play/index.html"},{"revision":"0a776aa090f1c460c15f412bdbacc8ed","url":"rules/adjacent-overload-signatures/index.html"},{"revision":"21dc3bfaba30690e22f1bb4d8f671a0d","url":"rules/array-type/index.html"},{"revision":"4489fa6cfaddd49bc39bee00003dbd90","url":"rules/await-thenable/index.html"},{"revision":"47876c477e31aed561c8fd78734b0b51","url":"rules/ban-ts-comment/index.html"},{"revision":"050da0b1731f18272f5e5995e31dcb73","url":"rules/ban-tslint-comment/index.html"},{"revision":"08765b24fee6093b46b46870a8d91548","url":"rules/ban-types/index.html"},{"revision":"ecbab2903a3334b20c9d95606e4c1dfd","url":"rules/block-spacing/index.html"},{"revision":"2f4b3ff32ccf0828992d5308c13378c6","url":"rules/brace-style/index.html"},{"revision":"e1f3ea920ab05c38a46ba4c8e6d74f1a","url":"rules/camelcase/index.html"},{"revision":"15813916f618acd50df487c45c3fcd18","url":"rules/class-literal-property-style/index.html"},{"revision":"2f9eebf852899d85d8f1b3c956247074","url":"rules/class-methods-use-this/index.html"},{"revision":"c6f5ca5c1225c313de50a1ae8de161ad","url":"rules/comma-dangle/index.html"},{"revision":"eb7c42cc92f6b4a1eec13153b72ee468","url":"rules/comma-spacing/index.html"},{"revision":"44c54319ad860a6c620df32a5c492188","url":"rules/consistent-generic-constructors/index.html"},{"revision":"09b6d56d2a29b56a6597dc7642ffda36","url":"rules/consistent-indexed-object-style/index.html"},{"revision":"04e5f94babb07646ffbecee77b1d6931","url":"rules/consistent-return/index.html"},{"revision":"493fdc948e85c48c7a69fac5d2a9c6f6","url":"rules/consistent-type-assertions/index.html"},{"revision":"d24b637c6abaf21e5a2cb5618799755e","url":"rules/consistent-type-definitions/index.html"},{"revision":"145909b8ea0ad0a03eefb22f922e20f4","url":"rules/consistent-type-exports/index.html"},{"revision":"f8c036b6d72ef07c34820c70b89079d2","url":"rules/consistent-type-imports/index.html"},{"revision":"e80b0748b9cf42a5edae2a9107fde240","url":"rules/default-param-last/index.html"},{"revision":"6ef2da41a59b9ff1b4852bebc2741863","url":"rules/dot-notation/index.html"},{"revision":"ec7813df729fb62a98e198fe9f470bce","url":"rules/explicit-function-return-type/index.html"},{"revision":"18c7f368649bb9eefb62f3d95b034d33","url":"rules/explicit-member-accessibility/index.html"},{"revision":"51327eaec51db1e509ae909f718c0503","url":"rules/explicit-module-boundary-types/index.html"},{"revision":"c329419430fcab1657a52c064dee1f0f","url":"rules/func-call-spacing/index.html"},{"revision":"5cb6c887b4b48f8b768ba4f585bbe168","url":"rules/indent/index.html"},{"revision":"6b953f80b00fd07f75a828ce89437d66","url":"rules/index.html"},{"revision":"b7de60ac7f65b3a0be2c7f3eba34a698","url":"rules/init-declarations/index.html"},{"revision":"f594dffeea1f89f7e6d26cbcff07f26e","url":"rules/key-spacing/index.html"},{"revision":"752550c043488c4c8be1d1a76601ae45","url":"rules/keyword-spacing/index.html"},{"revision":"3dc1633fd9f579d6dde64f206f3b7d00","url":"rules/lines-around-comment/index.html"},{"revision":"17140e8b22170074734c3b182fec619f","url":"rules/lines-between-class-members/index.html"},{"revision":"5a0668a41ae6a49f46674c899138e9dd","url":"rules/max-params/index.html"},{"revision":"5107dee0ab7ff014c6573a1fe4c9bb9d","url":"rules/member-delimiter-style/index.html"},{"revision":"fd3d7013eec8af023033f1d838789b2f","url":"rules/member-ordering/index.html"},{"revision":"459e90feccb88d87ba6870e517c7ccca","url":"rules/method-signature-style/index.html"},{"revision":"8eb9e38300dab74d26443b70b029d89e","url":"rules/naming-convention/index.html"},{"revision":"a56132439734b67548422b7ee29c1711","url":"rules/no-array-constructor/index.html"},{"revision":"51357420442fe0054f547dec14ddbd9a","url":"rules/no-array-delete/index.html"},{"revision":"d07d6fa9959ca9886ecae6301b501a55","url":"rules/no-base-to-string/index.html"},{"revision":"247154f1d39afa1f47637535db754471","url":"rules/no-confusing-non-null-assertion/index.html"},{"revision":"90967f23e8049a8e8280324bb5ecbad4","url":"rules/no-confusing-void-expression/index.html"},{"revision":"62bda622002a9dc97beee320b7749aaa","url":"rules/no-deprecated/index.html"},{"revision":"cc85ac33dbcebba596e48797ac369c24","url":"rules/no-dupe-class-members/index.html"},{"revision":"5fbe76a2ea777a82fae2d7c147992436","url":"rules/no-duplicate-enum-values/index.html"},{"revision":"b18652df2e2f654c370ae655e2a8852a","url":"rules/no-duplicate-imports/index.html"},{"revision":"d98291c5f75f6ae3549a9ea20c7bd698","url":"rules/no-duplicate-type-constituents/index.html"},{"revision":"0ed17cf6eb183c24b36989426087cb6e","url":"rules/no-dynamic-delete/index.html"},{"revision":"57caa8b03a6aefc2af39811d6e2d044c","url":"rules/no-empty-function/index.html"},{"revision":"ee77cff677c707d32fd78e1e465d5647","url":"rules/no-empty-interface/index.html"},{"revision":"df63dc78213d7bc1e09a36cad4b4ae39","url":"rules/no-empty-object-type/index.html"},{"revision":"6d5674861eea3af2bda1ce35344055db","url":"rules/no-explicit-any/index.html"},{"revision":"a5af9aa5000bf5963f9fa5ae1c5d79e2","url":"rules/no-extra-non-null-assertion/index.html"},{"revision":"5d63769a4365f71b5aa3f8ca65c2d236","url":"rules/no-extra-parens/index.html"},{"revision":"bf579e2009896bd0d2cf4c897304b143","url":"rules/no-extra-semi/index.html"},{"revision":"b94becfb6a0534b71521ef44091c9b9e","url":"rules/no-extraneous-class/index.html"},{"revision":"3619e2fae9474c7e382d3a984725b72f","url":"rules/no-floating-promises/index.html"},{"revision":"6d1d35be7945de4f43f50b1e0fc163a7","url":"rules/no-for-in-array/index.html"},{"revision":"73f3ce27f245e36239b31b5021484bf7","url":"rules/no-implied-eval/index.html"},{"revision":"b2c41fcbd3f5511e061aa7eea371ade3","url":"rules/no-import-type-side-effects/index.html"},{"revision":"1dfca3d308d99d0d7f9fc36b6cde5d2e","url":"rules/no-inferrable-types/index.html"},{"revision":"9f9e179ad9c8c6f8b220b8dbec5d9499","url":"rules/no-invalid-this/index.html"},{"revision":"ab6de45b23a341759bc6140adab085e2","url":"rules/no-invalid-void-type/index.html"},{"revision":"51184cb84aec1eb20575a2dd937a9224","url":"rules/no-loop-func/index.html"},{"revision":"88632ef8a0ad27eec9d4e8f4a3049717","url":"rules/no-loss-of-precision/index.html"},{"revision":"2316c7917ccf4e82de75a7252444b87e","url":"rules/no-magic-numbers/index.html"},{"revision":"c911fdea9d0488a73b3f52f9ee5eadb5","url":"rules/no-meaningless-void-operator/index.html"},{"revision":"bdaabab0b6d312384f5378668dd6bf16","url":"rules/no-misused-new/index.html"},{"revision":"fed44525c1b682dc08a380e5bd4bb9a0","url":"rules/no-misused-promises/index.html"},{"revision":"3e15c4f8bf96cf9834e0ca0ccd35a829","url":"rules/no-misused-spread/index.html"},{"revision":"6707d343c93f9aed9212eb6965f1c4bc","url":"rules/no-mixed-enums/index.html"},{"revision":"5d57100fa198c5ca163cfc792a87421c","url":"rules/no-namespace/index.html"},{"revision":"1efc8d98ed78b7cff34793af4465f679","url":"rules/no-non-null-asserted-nullish-coalescing/index.html"},{"revision":"21c69e957d3b4688aac2ee2d6a5de949","url":"rules/no-non-null-asserted-optional-chain/index.html"},{"revision":"d8855f9d1eb7d2e2903e37dd3d7482f6","url":"rules/no-non-null-assertion/index.html"},{"revision":"6d9723abcbdc5c41fea9cc287d5df58f","url":"rules/no-parameter-properties/index.html"},{"revision":"7f9fc3c89b04ccf1f7c54788f9a4ebfd","url":"rules/no-redeclare/index.html"},{"revision":"5d51b031d30866ead3ade4b144c230fb","url":"rules/no-redundant-type-constituents/index.html"},{"revision":"ce0494361e82eb6dc3bc3040b936bbc3","url":"rules/no-require-imports/index.html"},{"revision":"044de9ba28c7ab2ad663c52f194a2631","url":"rules/no-restricted-imports/index.html"},{"revision":"208f1763beaba7ef2ade32bfe82b01bc","url":"rules/no-restricted-types/index.html"},{"revision":"2ff32665679593512c11493f227c9f5a","url":"rules/no-shadow/index.html"},{"revision":"793b11e18a134f1a1b5c6b59f4d01a66","url":"rules/no-this-alias/index.html"},{"revision":"c6d8fa4c424073e181d53782dc1eb3ca","url":"rules/no-type-alias/index.html"},{"revision":"224f99c35712a2c8beb1ec4e3d4d40c8","url":"rules/no-unnecessary-boolean-literal-compare/index.html"},{"revision":"839155985b1f39c2366a22937d7eff0d","url":"rules/no-unnecessary-condition/index.html"},{"revision":"f39c76afe1744bbf9284d743a8d3ed5c","url":"rules/no-unnecessary-parameter-property-assignment/index.html"},{"revision":"1f7078b7b1042fad5b250700c91b1842","url":"rules/no-unnecessary-qualifier/index.html"},{"revision":"62778a9a2f90db72a21c4b36cf16b483","url":"rules/no-unnecessary-template-expression/index.html"},{"revision":"2bd074ae19aa3c55d1423aae200c2333","url":"rules/no-unnecessary-type-arguments/index.html"},{"revision":"c98cb77025edc947c11757c0831a3d45","url":"rules/no-unnecessary-type-assertion/index.html"},{"revision":"d9cf957dbe5601144551b346c792aeda","url":"rules/no-unnecessary-type-constraint/index.html"},{"revision":"a9cb52e25ebd3ba20abb77315f93521f","url":"rules/no-unnecessary-type-conversion/index.html"},{"revision":"4b6f061b9391c3eab4e319acc976a3fd","url":"rules/no-unnecessary-type-parameters/index.html"},{"revision":"bfdbee2a5d61a9a595c5534016495f59","url":"rules/no-unsafe-argument/index.html"},{"revision":"056851f789f39e4c4b3fc3aaee064b17","url":"rules/no-unsafe-assignment/index.html"},{"revision":"d441cf996e042e8e4bda02a283fd504b","url":"rules/no-unsafe-call/index.html"},{"revision":"d40da0234ec465929ac119d9d27452a6","url":"rules/no-unsafe-declaration-merging/index.html"},{"revision":"477fa944cec070c4a7226c4416c89231","url":"rules/no-unsafe-enum-comparison/index.html"},{"revision":"eaa4408f17cb87c6b18d3f219f6a2a62","url":"rules/no-unsafe-function-type/index.html"},{"revision":"1167e9c83a78c00bb320fa3e3d689ecb","url":"rules/no-unsafe-member-access/index.html"},{"revision":"e9e8c69d83d2cba0ee7c9200112b3891","url":"rules/no-unsafe-return/index.html"},{"revision":"22dfe54091afdc1a21635390ca814218","url":"rules/no-unsafe-type-assertion/index.html"},{"revision":"524ebcd59982bf605f9a812aee3bd14b","url":"rules/no-unsafe-unary-minus/index.html"},{"revision":"4171f68300aa3eb1586b1ef19559ec57","url":"rules/no-unused-expressions/index.html"},{"revision":"ade737efac9756496ac95651e289a1e8","url":"rules/no-unused-private-class-members/index.html"},{"revision":"bb3e00c76d7b73bd0cc5b268c4e3eb67","url":"rules/no-unused-vars/index.html"},{"revision":"2b3ec1868dd621e6816862747002eb6a","url":"rules/no-use-before-define/index.html"},{"revision":"ccf16e2ed376b58118d2cfca4c3e657c","url":"rules/no-useless-constructor/index.html"},{"revision":"bbaed0352aafa683e071c17fefb1c1bc","url":"rules/no-useless-default-assignment/index.html"},{"revision":"10fb8be47b87612a1db6bf1360f8a783","url":"rules/no-useless-empty-export/index.html"},{"revision":"31c87fbf44bc8d5ad6bc69ac75cf928b","url":"rules/no-useless-template-literals/index.html"},{"revision":"6aab18e9f85ef4061d3f716b60586ec9","url":"rules/no-var-requires/index.html"},{"revision":"02817160ed720258afecba37b79712a2","url":"rules/no-wrapper-object-types/index.html"},{"revision":"649421e8893865db3a6cef6a95747854","url":"rules/non-nullable-type-assertion-style/index.html"},{"revision":"f9683d08cf5d787f2fc0c31eba8aef77","url":"rules/object-curly-spacing/index.html"},{"revision":"c83a63f4342cef9e800f8d3db49ffd4f","url":"rules/only-throw-error/index.html"},{"revision":"5e95d66e07029d7226910161584fb58b","url":"rules/padding-line-between-statements/index.html"},{"revision":"2d53ade84ced9c705dc37a73ea302188","url":"rules/parameter-properties/index.html"},{"revision":"4873b3b8078f8b031846a0e57ead741a","url":"rules/prefer-as-const/index.html"},{"revision":"8b9b2bc616b98f76987cbfba219dcf41","url":"rules/prefer-destructuring/index.html"},{"revision":"ed4a0aefad6f3541c3353da0c1e85112","url":"rules/prefer-enum-initializers/index.html"},{"revision":"e74ebfbe4c85e81ee314517594ea9d1e","url":"rules/prefer-find/index.html"},{"revision":"85675d94fbe71019c5581833f369bcf8","url":"rules/prefer-for-of/index.html"},{"revision":"f4be87e4a7acecbb6d42e0f7413387f4","url":"rules/prefer-function-type/index.html"},{"revision":"e1c9df6830567cdc2f56c4282086f1a1","url":"rules/prefer-includes/index.html"},{"revision":"b5df78f4073762d9e2849b2ba6075969","url":"rules/prefer-literal-enum-member/index.html"},{"revision":"98b32edff8e9c92d69401cef0e7a238d","url":"rules/prefer-namespace-keyword/index.html"},{"revision":"01f7e5f0bba39c3896d1b70505281d13","url":"rules/prefer-nullish-coalescing/index.html"},{"revision":"32e9a03da95237d687a64e3469a1d519","url":"rules/prefer-optional-chain/index.html"},{"revision":"927e72b0f6fcf5a5de792203f214a5cf","url":"rules/prefer-promise-reject-errors/index.html"},{"revision":"4631cfd55922ca6fc244f4c33d58620b","url":"rules/prefer-readonly-parameter-types/index.html"},{"revision":"5e46facab79819b83bea14c219681b15","url":"rules/prefer-readonly/index.html"},{"revision":"ec2eada15238d0332b66723182767ad2","url":"rules/prefer-reduce-type-parameter/index.html"},{"revision":"da8c1442d5e0139f1d87c21e61ecbbd1","url":"rules/prefer-regexp-exec/index.html"},{"revision":"a9e3eb6e4baa82665e16c54c8354a015","url":"rules/prefer-return-this-type/index.html"},{"revision":"32b5de1acd95bb1711021e8df54ec80c","url":"rules/prefer-string-starts-ends-with/index.html"},{"revision":"fe5d77638f13700e16b0c50a0352ac8c","url":"rules/prefer-ts-expect-error/index.html"},{"revision":"3b385db37665a9defdf573e52afa8e76","url":"rules/promise-function-async/index.html"},{"revision":"a460f4cb0e0ca50f1462469a5418d36d","url":"rules/quotes/index.html"},{"revision":"7c5443a099c3b90b63cf31915adc2739","url":"rules/related-getter-setter-pairs/index.html"},{"revision":"d9420d9ae4b71a49b1db7ee069626db1","url":"rules/require-array-sort-compare/index.html"},{"revision":"138284d51b9300dca6d3939778159d51","url":"rules/require-await/index.html"},{"revision":"67a62e7e0ee4ce46155c631f9be50390","url":"rules/restrict-plus-operands/index.html"},{"revision":"08ff21e668d6d793df4112d8af11b13c","url":"rules/restrict-template-expressions/index.html"},{"revision":"2759872bb869ea891cb16656ef32d619","url":"rules/return-await/index.html"},{"revision":"08cd78edd42210b0eca3a640990cbe35","url":"rules/semi/index.html"},{"revision":"f64b8fdcfc619c4c448a834430e9048f","url":"rules/sort-type-constituents/index.html"},{"revision":"30c2f7842bc708733c2740fac1138fe9","url":"rules/sort-type-union-intersection-members/index.html"},{"revision":"bf69287f14521fd04e2168ae61bf422d","url":"rules/space-before-blocks/index.html"},{"revision":"48daafd801c4ff6a9687f55355647d22","url":"rules/space-before-function-paren/index.html"},{"revision":"e75653c58218f61d3ff0c7e96c187ad8","url":"rules/space-infix-ops/index.html"},{"revision":"ef0a631d2e245c8ea3be84abccfec995","url":"rules/strict-boolean-expressions/index.html"},{"revision":"d2f85def00bbd4214519b573f7a3eccd","url":"rules/strict-void-return/index.html"},{"revision":"02fac08237521ae30d947bea41448ca1","url":"rules/switch-exhaustiveness-check/index.html"},{"revision":"fea8ef3055273d1972dd5640ae3fab9b","url":"rules/triple-slash-reference/index.html"},{"revision":"1f5bcc98a8a7b69ffc648688715ef2aa","url":"rules/type-annotation-spacing/index.html"},{"revision":"0a616960e7ef71b8c6b4e07a972e8037","url":"rules/typedef/index.html"},{"revision":"b75686bd4b8748be61ca66b0e5e7ceef","url":"rules/unbound-method/index.html"},{"revision":"02623ae6410f747a5c9eecd2abfbe337","url":"rules/unified-signatures/index.html"},{"revision":"a273933531323f3a2a0f601c5f523ba7","url":"rules/use-unknown-in-catch-callback-variable/index.html"},{"revision":"d2420200b83a894dbc54473e52dc7c69","url":"search/index.html"},{"revision":"77960387e9fd80b25cbdfe7abc59888e","url":"troubleshooting/faqs/eslint/index.html"},{"revision":"920614639f255b76333a25bfd6aa08be","url":"troubleshooting/faqs/frameworks/index.html"},{"revision":"48a9bb5b5e202ef6157519b0d1c785ea","url":"troubleshooting/faqs/general/index.html"},{"revision":"20b26ee19456308886384b5db2aa16b5","url":"troubleshooting/faqs/index.html"},{"revision":"be2074217e99e9618e839571f302dd7f","url":"troubleshooting/faqs/javascript/index.html"},{"revision":"848d66d8218e0deaa9fb11b9e2f8f16f","url":"troubleshooting/faqs/typescript/index.html"},{"revision":"228f3d2e5106ba6a5d96f046836124bd","url":"troubleshooting/formatting/index.html"},{"revision":"20b26ee19456308886384b5db2aa16b5","url":"troubleshooting/index.html"},{"revision":"db9c8c9a27f6661c0d50482a2fcfd3d0","url":"troubleshooting/performance-troubleshooting/index.html"},{"revision":"ca2a9d52037ad4b5f5429e7540efd293","url":"troubleshooting/tslint/index.html"},{"revision":"9ab51968546067e3397c714fe9eaec19","url":"troubleshooting/typed-linting/index.html"},{"revision":"e4da590a8fab2bfe64a94ffbd737b077","url":"troubleshooting/typed-linting/monorepos/index.html"},{"revision":"e764f7e88f19336bd0b4c15aaf89c0c7","url":"troubleshooting/typed-linting/performance/index.html"},{"revision":"42114aedc3d635a0824ad9c1b6d8dfd5","url":"users/configs/index.html"},{"revision":"a2eed06651591c5d8eae1093fd3b8875","url":"users/dependency-versions/index.html"},{"revision":"e21561e94c784e6af24383cd7b79e1e1","url":"users/index.html"},{"revision":"477f2f6994d49b8e37a0e3213fda5f1f","url":"users/releases/index.html"},{"revision":"e2fa1eada497b179229d159da3cda1f8","url":"users/versioning/index.html"},{"revision":"00a033c02714f7ab6748dac21e1f9123","url":"users/what-about-formatting/index.html"},{"revision":"0fee5cbc9552475022fb5f27345eceba","url":"users/what-about-tslint/index.html"},{"revision":"bd8389449d48af907f990156a4ff2d27","url":"assets/files/logo-5f3f0115a5bfbf931855329a4e0e7331.png"},{"revision":"ba319bb9f7273e499b160676633104a4","url":"assets/files/logo-62ab572de114d03f1ec685d989f92cd6.svg"},{"revision":"7ac1cab95a2a3ae186bcd184e0f0e043","url":"assets/images/ast-explorer-remark-3c6fd8bff356b5b2db817e33023ae87e.png"},{"revision":"c77f2dbcd469e44bf53cd31fed319483","url":"img/bluesky.svg"},{"revision":"4efecca0a8f4a3e20d1bafeb76e28057","url":"img/bug-report.svg"},{"revision":"3e303e981fce21bead66c9f7070e70b8","url":"img/discord.svg"},{"revision":"4e9f4c93cce4f0373ea4f259afbb23ff","url":"img/eslint.svg"},{"revision":"3000bd5cd346e20391d874b12d778867","url":"img/favicon.ico"},{"revision":"9809f0458f95cdd837173b4ab0672323","url":"img/favicon/android-chrome-192x192.png"},{"revision":"5e4d7bddd96247aaef3976e1f69e42b0","url":"img/favicon/android-chrome-512x512.png"},{"revision":"6cd23c43523adcf8c45838235b0255b1","url":"img/favicon/apple-touch-icon.png"},{"revision":"4b2a3e0bc9d1b182f2136edb61e9dc69","url":"img/favicon/favicon-16x16.png"},{"revision":"ff32b493f4f3268e4834c325813be716","url":"img/favicon/favicon-32x32.png"},{"revision":"81659d363de12f6cdd0fdf46bbe4f8e1","url":"img/favicon/mstile-150x150.png"},{"revision":"fd1732ba0697d537acaa8886d8b9a7eb","url":"img/favicon/mstile-310x310.png"},{"revision":"a10bbe756a8af64155166d6feee171a5","url":"img/favicon/safari-pinned-tab.svg"},{"revision":"db18f4b5a5abcc1fe0c94695eb9596a9","url":"img/github.svg"},{"revision":"a4785a8ac88f2b0762e4e353b583d804","url":"img/logo_maskable.png"},{"revision":"df41dfeca4a21b3f8db8c04a5c532eff","url":"img/logo-twitter-card.png"},{"revision":"bd8389449d48af907f990156a4ff2d27","url":"img/logo.png"},{"revision":"ba319bb9f7273e499b160676633104a4","url":"img/logo.svg"},{"revision":"fbf8a696169e594fadf98a05790123ad","url":"img/mastodon.svg"},{"revision":"ef2d71a7e95f9b432140bc6780b4b0bc","url":"img/open-collective.svg"},{"revision":"4805909241be806f815ce4b938c0b26f","url":"img/squiggle.svg"},{"revision":"8fff7f0534ff24457683164bacbf1885","url":"img/stack-overflow.svg"},{"revision":"b3a54ae3b5a331e18f0ecddadd96e9d8","url":"img/team/armano2.jpg"},{"revision":"6af5e48b1c6939301b7d1cb22b502a46","url":"img/team/auvred.jpg"},{"revision":"6905389b2338e7fca65c6f7855b40f9e","url":"img/team/bradzacher.jpg"},{"revision":"e17c6b413115d52d907b46e37379cf04","url":"img/team/jameshenry.jpg"},{"revision":"313936aeb85a5c5d0821da28559524b9","url":"img/team/josh-cena.jpg"},{"revision":"78f89e9ed8a80bf02378c5e192d761fb","url":"img/team/joshuakgoldberg.jpg"},{"revision":"47e2d2716283ca77525275b5c282fe40","url":"img/team/kirkwaiblinger.jpg"},{"revision":"4b7ef0fd6f6ca436f3546664ca620403","url":"img/team/ronami.jpg"},{"revision":"5b4a0d9777e8ac51151e4c8bd25255d1","url":"img/typescript.svg"},{"revision":"ace331df31a0042c52f2ddb6000f8fbe","url":"img/www.svg"}];
    const controller = new workbox_precaching__rspack_import_0.PrecacheController({
        // Safer to turn this true?
        fallbackToNetwork: true,
    });
    if (params.offlineMode) {
        controller.addToCacheList(precacheManifest);
        if (params.debug) {
            console.log('[Docusaurus-PWA][SW]: addToCacheList', { precacheManifest });
        }
    }
    await runSWCustomCode(params);
    self.addEventListener('install', (event) => {
        if (params.debug) {
            console.log('[Docusaurus-PWA][SW]: install event', { event });
        }
        event.waitUntil(controller.install(event));
    });
    self.addEventListener('activate', (event) => {
        if (params.debug) {
            console.log('[Docusaurus-PWA][SW]: activate event', { event });
        }
        event.waitUntil(controller.activate(event));
    });
    self.addEventListener('fetch', async (event) => {
        if (params.offlineMode) {
            const requestURL = event.request.url;
            const possibleURLs = getPossibleURLs(requestURL);
            for (const possibleURL of possibleURLs) {
                const cacheKey = controller.getCacheKeyForURL(possibleURL);
                if (cacheKey) {
                    const cachedResponse = caches.match(cacheKey);
                    if (params.debug) {
                        console.log('[Docusaurus-PWA][SW]: serving cached asset', {
                            requestURL,
                            possibleURL,
                            possibleURLs,
                            cacheKey,
                            cachedResponse,
                        });
                    }
                    event.respondWith(cachedResponse);
                    break;
                }
            }
        }
    });
    self.addEventListener('message', async (event) => {
        if (params.debug) {
            console.log('[Docusaurus-PWA][SW]: message event', { event });
        }
        const type = event.data?.type;
        if (type === 'SKIP_WAITING') {
            // lib def bug, see https://github.com/microsoft/TypeScript/issues/14877
            self.skipWaiting();
        }
    });
})();

})();

})()
;
//# sourceMappingURL=sw.js.map