/*
 Copyright 2017 Aleksandar Jankovic

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

const appConfig = require('../../config/defaults/config').app;

const ErrorTypes = {
  GENERAL: 'general error',
  DATABASE: 'database',
  DOESNOTEXIST: 'does not exist',
  EXTERNAL: 'external',
  ALREADYEXISTS: 'already exists',
  INCORRECT: 'incorrect',
  INVALIDCHARACTERS: 'invalid characters',
  INVALIDDATA: 'invalid data',
  NOTALLOWED: 'not allowed',
  NEEDSVERIFICATION: 'needs verification',
  BANNED: 'banned',
  INSUFFICIENT: 'insufficient',
  INTERNAL: 'general internal error',
  EXPIRED: 'expired',
};

/**
 * Prints error
 * @param {Object} errorObject error
 */
function printError(errorObject) {
  if (errorObject) {
    if (errorObject.name) { console.log(errorObject.name); }
    if (errorObject.message) { console.log(errorObject.message); }
    if (errorObject.stack) { console.log(errorObject.stack); }
  }
}

class GeneralError {
  /**
   * Create a general error
   * @param {string} [params.text] Human-readable text to send back with the error
   * @param {string} [params.type] Type of error
   * @param {Error} [params.errorObject] Error object
   * @param {boolean} verbose Should error messages be printed?
   */
  constructor({ text = ['Something went wrong'], type = ErrorTypes.GENERAL, errorObject, verbose = true }) {
    this.text = text;
    this.type = type;

    if (appConfig.mode !== 'test' && verbose) {
      console.log(`Error Type: ${type}. `, text.join(' '));
      printError(errorObject);
    }
  }
}

exports.ErrorTypes = ErrorTypes;
exports.create = GeneralError;
