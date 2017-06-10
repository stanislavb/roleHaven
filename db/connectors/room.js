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

const mongoose = require('mongoose');
const databaseConnector = require('../databaseConnector');
const chatHistoryConnector = require('./chatHistory');
const dbUser = require('./user');
const errorCreator = require('../../objects/error/errorCreator');
const dbConfig = require('../../config/defaults/config').databasePopulation;

const roomSchema = new mongoose.Schema({
  roomName: { type: String, unique: true },
  password: { type: String, default: '' },
  accessLevel: { type: Number, default: 1 },
  visibility: { type: Number, default: 1 },
  writeLevel: Number,
  commands: [{
    commandName: String,
    accessLevel: Number,
    requireAdmin: Boolean,
  }],
  admins: [String],
  bannedUsers: [String],
  owner: String,
  team: String,
  anonymous: { type: Boolean, default: false },
}, { collection: 'rooms' });

const Room = mongoose.model('Room', roomSchema);

/**
 * Authorize the user to the room, by checking if the password is correct and the user has high enough access level
 * @param {Object} params.user User to authorize
 * @param {string} params.roomName Name of the room
 * @param {string} [params.password] Password of the room
 * @param {Function} params.callback Callback
 */
function authUserToRoom({ user, roomName, callback, password = '' }) {
  const query = {
    $and: [
      { roomName },
      { password },
      { accessLevel: { $lte: user.accessLevel } },
    ],
  };
  const filter = { password: 0 };

  Room.findOne(query, filter).lean().exec((err, room) => {
    if (err) {
      callback({ error: new errorCreator.Database({ errorObject: err, name: 'authUserToRoom' }) });

      return;
    } else if (!room) {
      callback({ error: new errorCreator.NotAllowed({ name: `Room ${roomName}` }) });

      return;
    }

    callback({ data: { room } });
  });
}

/**
 * Create and save room
 * @param {Object} params.room New room
 * @param {Function} params.callback Callback
 */
function createRoom({ room, callback }) {
  const newRoom = new Room(room);
  const query = { roomName: room.roomName };

  Room.findOne(query).lean().exec((err, foundRoom) => {
    if (err) {
      callback({ error: new errorCreator.Database({ errorObject: err, name: 'createRoom' }) });

      return;
    } else if (foundRoom !== null) {
      callback({ error: new errorCreator.AlreadyExists({ name: `room ${room.roomName}` }) });

      return;
    }

    chatHistoryConnector.createHistory({
      roomName: room.roomName,
      anonymous: room.anonymous,
      callback: ({ error }) => {
        if (error) {
          callback({ error });

          return;
        }

        databaseConnector.saveObject({ object: newRoom, objectType: 'room', callback });
      },
    });
  });
}

/**
 * Get room
 * @param {string} params.roomName - Name of the room
 * @param {Object} params.user User retrieving the room
 * @param {Function} params.callback Callback
 */
function getRoom({ roomName, user, callback }) {
  const query = { roomName, accessLevel: { $lte: user.accessLevel } };

  Room.findOne(query).lean().exec((err, room) => {
    if (err) {
      callback({ error: new errorCreator.Database({ errorObject: err, name: 'getRoom' }) });

      return;
    } else if (!room) {
      callback({ error: new errorCreator.DoesNotExist({ name: `room ${roomName}` }) });

      return;
    }

    if (room.password && room.password !== '') {
      room.password = true;
    }

    callback({ data: { room } });
  });
}

/**
 * Get rooms owned by user
 * @param {Object} params.user Owner
 * @param {Function} params.callback Callback
 */
function getOwnedRooms({ user, callback }) {
  const query = { owner: user.userName };
  const sort = { roomName: 1 };
  const filter = { password: 0 };

  Room.find(query, filter).sort(sort).lean().exec((err, rooms = []) => {
    if (err) {
      callback({ error: new errorCreator.Database({ errorObject: err, name: 'getOwnedRooms' }) });

      return;
    }

    callback({ data: { rooms } });
  });
}

/**
 * Get all rooms, based on user's access level
 * @param {Object} params.user User retrieving the rooms
 * @param {Function} params.callback Callback
 */
function getAllRooms({ user, callback }) {
  const query = { visibility: { $lte: user.accessLevel } };
  const sort = { roomName: 1 };

  Room.find(query).sort(sort).lean().exec((err, rooms = []) => {
    if (err) {
      callback({ error: new errorCreator.Database({ errorObject: err, name: 'getAllRooms' }) });

      return;
    }

    callback({ data: { rooms } });
  });
}

/**
 * Ban user from room
 * @param {string} params.userName Name of the user
 * @param {string} params.roomName Name of the room
 * @param {Function} params.callback Callback
 */
function banUserFromRoom({ userName, roomName, callback }) {
  const query = { roomName };
  const update = { $addToSet: { bannedUsers: userName } };

  Room.findOneAndUpdate(query, update).lean().exec((err, room) => {
    if (err) {
      callback({ error: new errorCreator.Database({ errorObject: err, name: 'banUserFromRoom' }) });

      return;
    } else if (!room) {
      callback({ error: new errorCreator.DoesNotExist({ name: `room ${roomName}` }) });

      return;
    }

    callback({ data: { room } });
  });
}

/**
 * Unban user from room
 * @param {string} params.userName Name of the user
 * @param {string} params.roomName Name of the room
 * @param {Function} params.callback Callback
 */
function unbanUserFromRoom({ userName, roomName, callback }) {
  const query = { roomName };
  const update = { $pull: { bannedUsers: userName } };

  Room.findOneAndUpdate(query, update).lean().exec((err, room) => {
    if (err) {
      callback({ error: new errorCreator.Database({ errorObject: err, name: 'unbanuserFromRoom' }) });

      return;
    } else if (!room) {
      callback({ error: new errorCreator.DoesNotExist({ name: `room ${roomName}` }) });

      return;
    }

    callback({ data: { room } });
  });
}

/**
 * Remove room
 * @param {string} params.roomName Name of the room
 * @param {Function} params.callback Callback
 */
function removeRoom({ roomName, callback }) {
  const query = { roomName };

  Room.findOneAndRemove(query).lean().exec((err) => {
    if (err) {
      callback({ error: new errorCreator.Database({ errorObject: err, name: 'removeRoom' }) });

      return;
    }

    chatHistoryConnector.removeHistory({
      roomName,
      callback: ({ error }) => {
        if (error) {
          callback({ error });

          return;
        }

        dbUser.removeRoomFromAllUsers({
          roomName,
          callback: ({ error: userError }) => {
            if (userError) {
              callback({ error: userError });

              return;
            }

            callback({ data: { success: true } });
          },
        });
      },
    });
  });
}

/**
 * Match partial room name
 * @param {string} params.partialName Partial room name
 * @param {Object} params.user User
 * @param {Function} params.callback Callback
 */
function matchPartialRoom({ partialName, user, callback }) {
  const filter = { _id: 0, roomName: 1 };
  const sort = { roomName: 1 };

  databaseConnector.matchPartial({
    filter,
    sort,
    partialName,
    user,
    callback,
    queryType: Room,
    type: 'roomName',
  });
}

/**
 * Add rooms to db
 * @param {Object} params.rooms Rooms to be added
 * @param {Function} params.callback Callback
 */
function populateDbRooms({ rooms }) {
  console.log('Creating default rooms, if needed');

  getAllRooms({
    user: {
      accessLevel: dbConfig.accessLevels.god,
      banned: false,
      verified: true,
    },
    callback: ({ error, data }) => {
      if (error) {
        return;
      }

      const { rooms: retrievedRooms } = data;
      const roomNames = retrievedRooms.map(room => room.roomName);

      Object.keys(rooms).map(roomKey => rooms[roomKey].roomName).forEach((roomName) => {
        if (roomNames.indexOf(roomName) > -1) {
          return;
        }

        const room = rooms[roomName];

        createRoom({
          room,
          callback: (createData) => {
            if (createData.error) {
              return;
            }

            console.log(`Created room ${roomName}`);
          },
        });
      });
    },
  });
}

/**
 * Set new room visibiity
 * @param {string} params.roomName Name of the room
 * @param {number} params.visibility New visibility
 * @param {Function} params.callback Callback
 */
function updateRoomVisibility({ roomName, visibility, callback }) {
  const query = { roomName };
  const update = { $set: { visibility } };

  Room.findOneAndUpdate(query, update).lean().exec((err, room) => {
    if (err) {
      callback({ error: new errorCreator.Database({ errorObject: err, name: 'updateRoomVisibility' }) });

      return;
    }

    callback({ data: { room } });
  });
}

/**
 * Set new room access level
 * @param {string} params.roomName Name of the room
 * @param {number} params.accessLevel New access level
 * @param {Function} params.callback Callback
 */
function updateRoomAccessLevel({ roomName, accessLevel, callback }) {
  const query = { roomName };
  const update = { $set: { accessLevel } };

  Room.findOneAndUpdate(query, update).lean().exec((err, room) => {
    if (err) {
      callback({ error: new errorCreator.Database({ errorObject: err, name: 'updateRoomAccessLevel' }) });

      return;
    }

    callback({ data: { room } });
  });
}

exports.authUserToRoom = authUserToRoom;
exports.createRoom = createRoom;
exports.getAllRooms = getAllRooms;
exports.getRoom = getRoom;
exports.banUserFromRoom = banUserFromRoom;
exports.unbanUserFromRoom = unbanUserFromRoom;
exports.getOwnedRooms = getOwnedRooms;
exports.removeRoom = removeRoom;
exports.matchPartialRoom = matchPartialRoom;
exports.populateDbRooms = populateDbRooms;
exports.updateRoomVisibility = updateRoomVisibility;
exports.updateRoomAccessLevel = updateRoomAccessLevel;
