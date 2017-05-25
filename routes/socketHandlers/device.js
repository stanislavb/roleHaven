/*
 Copyright 2015 Aleksandar Jankovic

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

const dbDevice = require('../../db/connectors/device');
const manager = require('../../socketHelpers/manager');
const dbConfig = require('../../config/defaults/config').databasePopulation;
const objectValidator = require('../../utils/objectValidator');
const appConfig = require('../../config/defaults/config').app;
const errorCreator = require('../../objects/error/errorCreator');

/**
 * @param {Object} socket Socket.IO socket
 */
function handle(socket) {
  socket.on('listDevices', ({ token }, callback = () => {}) => {
    manager.userIsAllowed({
      token,
      commandName: dbConfig.commands.listDevices.commandName,
      callback: ({ error }) => {
        if (error) {
          callback({ error });

          return;
        }

        dbDevice.getAllDevices((devErr, devices) => {
          if (devErr) {
            callback({ error: new errorCreator.Database({}) });

            return;
          }

          callback({
            data: {
              devices,
            },
          });
        });
      },
    });
  });

  socket.on('updateDeviceLastAlive', ({ device }, callback = () => {}) => {
    if (!objectValidator.isValidData({ device }, { device: { deviceId: true } })) {
      callback({ error: new errorCreator.InvalidData({ expected: '{ device: { deviceId } }' }) });

      return;
    }

    dbDevice.updateDeviceLastAlive(device.deviceId, new Date(), (err, updatedDevice) => {
      if (err) {
        callback({ error: new errorCreator.Database({}) });

        return;
      }

      callback({
        data: {
          device: updatedDevice,
        },
      });
    });
  });

  socket.on('updateDevice', ({ device, field, value, token }, callback = () => {}) => {
    if (!objectValidator.isValidData({ device }, { device: { deviceId: true }, field: true, value: true })) {
      callback({ error: new errorCreator.InvalidData({ expected: '{ field, value, device: { deviceId } }' }) });

      return;
    }

    manager.userIsAllowed({
      token,
      commandName: dbConfig.commands.updateDevice.commandName,
      callback: ({ error }) => {
        if (error) {
          callback({ error });

          return;
        }

        const deviceId = device.deviceId;
        const updateCallback = (err, updatedDevice) => {
          if (err) {
            callback({ error: new errorCreator.Database({}) });

            return;
          } else if (!updatedDevice) {
            callback({ error: new errorCreator.DoesNotExist({ name: 'device' }) });

            return;
          }

          callback({ data: { device: updatedDevice } });
        };

        switch (field) {
          case 'alias': {
            dbDevice.updateDeviceAlias(deviceId, value, updateCallback);

            break;
          }
          default: {
            callback({ error: new errorCreator.Incorrect({ name: 'field' }) });

            break;
          }
        }
      },
    });
  });

  // TODO Unused
  socket.on('verifyDevice', ({ device, token }, callback = () => {}) => {
    // TODO Check if either device.alias or device.deviceId is set
    if (!objectValidator.isValidData({ device }, { device: { deviceId: true } })) {
      callback({ error: new errorCreator.InvalidData({ expected: '{ device: { deviceId } }' }) });

      return;
    }

    manager.userIsAllowed({
      token,
      commandName: dbConfig.commands.updateDevice.commandName,
      callback: ({ error }) => {
        if (error) {
          callback({ error });

          return;
        }

        dbDevice.getDevice(device.deviceId, (err, foundDevice) => {
          if (err) {
            callback({ error: new errorCreator.Database({}) });

            return;
          } else if (!foundDevice) {
            callback({ error: new errorCreator.DoesNotExist({ name: `device ${device.deviceId}` }) });

            return;
          }

          callback({ data: { device: foundDevice } });
        });
      },
    });
  });

  // TODO Unused
  // TODO Should leave previous device room
  socket.on('updateDeviceSocketId', ({ user, device }, callback = () => {}) => {
    if (!objectValidator.isValidData({ user, device }, { user: { userName: true }, device: { deviceId: true } })) {
      callback({ error: new errorCreator.InvalidData({ expected: '{ user: { userName }, device: { deviceId } }' }) });

      return;
    }

    const deviceId = device.deviceId;

    socket.join(deviceId + appConfig.deviceAppend);

    dbDevice.updateDeviceSocketId(deviceId, socket.id, user.userName, () => {});
  });
}

exports.handle = handle;
