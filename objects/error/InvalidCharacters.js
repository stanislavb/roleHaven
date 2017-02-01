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

const General = require('./General');

class InvalidCharacters extends General {
  /**
   * InvalidCharacters constructor
   * @param {string} propertyName - Human-readable name of the property
   * @param {string} validCharacters - Valid characters
   */
  constructor({ propertyName = 'unknown', validCharacters }) {
    const text = [`Property ${propertyName} has invalid characters`];

    if (validCharacters) {
      text.push(`Valid characters: ${validCharacters}`);
    }

    super({
      type: 'Invalid characters',
      text,
    });
  }
}

module.exports = InvalidCharacters;