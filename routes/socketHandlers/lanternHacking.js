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

'use strict';

const lanternHackManager = require('../../managers/lanternHacking');

/**
 * @param {Object} socket - Socket.IO socket
 */
function handle(socket) {
  socket.on('manipulateStation', ({ password, boostingSignal, token }, callback = () => {}) => {
    lanternHackManager.manipulateStation({
      password,
      boostingSignal,
      token,
      callback,
    });
  });

  socket.on('getLanternHack', ({ stationId, token }, callback = () => {}) => {
    lanternHackManager.getLanternHack({
      stationId,
      token,
      callback,
    });
  });

  socket.on('getLanternInfo', ({ token }, callback = () => {}) => {
    lanternHackManager.getLanternInfo({
      token,
      callback,
    });
  });
}

exports.handle = handle;
