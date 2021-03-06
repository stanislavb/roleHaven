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

const dbConfig = require('../config/defaults/config').databasePopulation;
const authenticator = require('../helpers/authenticator');
const dbLanternHack = require('../db/connectors/lanternhack');
const lanternStationManager = require('./lanternStations');
const textTools = require('../utils/textTools');
const messenger = require('../helpers/messenger');

/**
 * Get lantern round
 * @param {string} params.token jwt
 * @param {Function} params.callback Callback
 */
function getLanternRound({ token, callback }) {
  authenticator.isUserAllowed({
    token,
    commandName: dbConfig.apiCommands.GetLanternRound.name,
    callback: ({ error }) => {
      if (error) {
        callback({ error });

        return;
      }

      dbLanternHack.getLanternRound({
        callback: ({ error: roundError, data }) => {
          if (roundError) {
            callback({ error: roundError });

            return;
          }

          callback({ data });
        },
      });
    },
  });
}

/**
 * Start lantern round
 * @param {number} params.roundId ID of the round to start
 * @param {string} params.token jwt
 * @param {Function} params.callback Callback
 */
function startLanternRound({ io, endTime, token, callback }) {
  authenticator.isUserAllowed({
    token,
    commandName: dbConfig.apiCommands.StartLanternRound.name,
    callback: ({ error }) => {
      if (error) {
        callback({ error });

        return;
      }

      dbLanternHack.startLanternRound({
        endTime,
        callback: ({ error: startLanternError, data: startLanternData }) => {
          if (startLanternError) {
            callback({ error: startLanternError });

            return;
          }


          const dataToSend = {
            timeLeft: textTools.getDifference({ laterDate: startLanternData.endTime, firstDate: new Date() }),
            round: startLanternData,
          };

          io.emit('lanternRound', { data: dataToSend });

          messenger.sendBroadcastMsg({
            io,
            token,
            message: {
              text: [
                'LANTERN ACTIVITY DETECTED',
                'LANTERN ONLINE',
              ],
              intro: ['ATTENTION! SIGNAL DETECTED', '----------'],
              extro: ['----------', 'END OF MESSAGE'],
            },
            callback: () => {},
          });

          callback({ data: dataToSend });
        },
      });
    },
  });
}

/**
 * End lantern round
 * @param {Object} params.io socket io
 * @param {string} params.token jwt
 * @param {Function} params.callback Callback
 */
function endLanternRound({ startTime, io, token, callback }) {
  authenticator.isUserAllowed({
    token,
    commandName: dbConfig.apiCommands.EndLanternRound.name,
    callback: ({ error }) => {
      if (error) {
        callback({ error });

        return;
      }

      dbLanternHack.endLanternRound({
        startTime,
        callback: ({ error: roundError, data }) => {
          if (roundError) {
            callback({ error: roundError });

            return;
          }

          const dataToSend = {
            timeLeft: textTools.getDifference({ laterDate: data.startTime, firstDate: new Date() }),
            round: data,
          };

          io.emit('lanternRound', { data: dataToSend });

          callback({ data });

          lanternStationManager.resetStations({ callback: () => {} });
          messenger.sendBroadcastMsg({
            io,
            token,
            message: {
              text: [
                'DISCONNECTING',
                'LANTERN OFFLINE',
              ],
              intro: ['ATTENTION! SIGNAL LOST', '----------'],
              extro: ['----------', 'END OF MESSAGE'],
            },
            callback: () => {},
          });
        },
      });
    },
  });
}

/**
 * Update lantern round times
 * @param {Object} params.io socket io
 * @param {string} params.token jwt
 * @param {Date} params.startTime Start time of round
 * @param {Date} params.endTime End time of round
 * @param {boolean} params.isActive Is round active?
 * @param {Function} params.callback Callback
 */
function updateLanternRound({ io, token, startTime, endTime, isActive, callback }) {
  authenticator.isUserAllowed({
    token,
    commandName: dbConfig.apiCommands.StartLanternRound.name,
    callback: ({ error }) => {
      if (error) {
        callback({ error });

        return;
      }

      dbLanternHack.getLanternRound({
        callback: ({ error: currentError, data: currentData }) => {
          if (currentError) {
            callback({ error: currentError });

            return;
          }


          dbLanternHack.updateLanternRound({
            startTime,
            endTime,
            isActive,
            callback: ({ error: roundError, data }) => {
              if (roundError) {
                callback({ error: roundError });

                return;
              }

              const next = data.isActive ? data.endTime : data.startTime;

              const dataToSend = {
                timeLeft: textTools.getDifference({ laterDate: next, firstDate: new Date() }),
                round: data,
              };

              io.emit('lanternRound', { data: dataToSend });

              callback({ data });

              if (!isActive) {
                lanternStationManager.resetStations({ callback: () => {} });
              }

              if (isActive !== currentData.isActive) {
                if (isActive) {
                  messenger.sendBroadcastMsg({
                    io,
                    token,
                    message: {
                      text: [
                        'LANTERN ACTIVITY DETECTED',
                        'LANTERN ONLINE',
                      ],
                      intro: ['ATTENTION! SIGNAL DETECTED', '----------'],
                      extro: ['----------', 'END OF MESSAGE'],
                    },
                    callback: () => {},
                  });
                } else {
                  messenger.sendBroadcastMsg({
                    io,
                    token,
                    message: {
                      text: [
                        'DISCONNECTING',
                        'LANTERN OFFLINE',
                      ],
                      intro: ['ATTENTION! SIGNAL LOST', '----------'],
                      extro: ['----------', 'END OF MESSAGE'],
                    },
                    callback: () => {},
                  });
                }
              }
            },
          });
        },
      });
    },
  });
}

exports.startLanternRound = startLanternRound;
exports.endLanternRound = endLanternRound;
exports.getLanternRound = getLanternRound;
exports.updateLanternRound = updateLanternRound;
