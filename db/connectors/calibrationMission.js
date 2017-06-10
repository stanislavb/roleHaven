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

const mongoose = require('mongoose');
const databaseConnector = require('../databaseConnector');
const errorCreator = require('../../objects/error/errorCreator');

const calibrationMissionSchema = new mongoose.Schema({
  owner: String,
  stationId: Number,
  code: Number,
  completed: { type: Boolean, default: false },
  timeCompleted: Date,
}, { collection: 'calibrationMissions' });

const CalibrationMission = mongoose.model('CalibrationMission', calibrationMissionSchema);

/**
 * Get active mission
 * @param {string} params.owner User name
 * @param {Function} params.callback Callback
 */
function getActiveMission({ owner, callback }) {
  const query = { $and: [{ owner }, { completed: false }] };
  const filter = { _id: 0 };

  CalibrationMission.findOne(query, filter).lean().exec((err, foundMission) => {
    if (err) {
      callback({ error: new errorCreator.Database({ errorObject: err, name: 'getActiveMission' }) });

      return;
    } else if (!foundMission) {
      callback({ error: new errorCreator.DoesNotExist({ name: `calibration mission ${owner}` }) });

      return;
    }

    callback({ data: { mission: foundMission } });
  });
}

/**
 * Get finished missions
 * @param {string} params.owner User name of the owner of the mission
 * @param {Function} params.callback Callback
 */
function getInactiveMissions({ owner, callback }) {
  const query = { $and: [{ owner }, { completed: true }] };
  const filter = { _id: 0 };
  const sort = { timeCompleted: 1 };

  CalibrationMission.find(query, filter).sort(sort).lean().exec((err, foundMissions) => {
    if (err) {
      callback({ error: new errorCreator.Database({ errorObject: err, name: 'getInactiveMissions' }) });

      return;
    }

    callback({ data: { missions: foundMissions } });
  });
}

/**
 * Create and save mission
 * @param {Object} params.mission New mission
 * @param {Function} params.callback Callback
 */
function createMission({ mission, callback }) {
  const newMission = new CalibrationMission(mission);
  const query = { owner: mission.owner };

  CalibrationMission.findOne(query).lean().exec((err, foundMission) => {
    if (err) {
      callback({ error: new errorCreator.Database({ errorObject: err, name: 'createMission' }) });

      return;
    } else if (foundMission) {
      callback({ error: new errorCreator.AlreadyExists({ name: `Calibration mission ${mission.owner}` }) });

      return;
    }

    databaseConnector.saveObject({
      callback,
      object: newMission,
      objectType: 'calibrationMission',
    });
  });
}

/**
 * Set mission completed
 * @param {number} params.code Mission code
 * @param {number} params.stationId Station ID
 * @param {Function} params.callback Callback
 */
function setMissionCompleted({ code, stationId, callback }) {
  const query = { $and: [{ code }, { stationId }, { completed: false }] };
  const update = { $set: { completed: true, timeCompleted: new Date() } };
  const options = { new: true };

  CalibrationMission.findOneAndUpdate(query, update, options).lean().exec((err, foundMission) => {
    if (err) {
      callback({ error: new errorCreator.Database({ errorObject: err, name: 'setMissionCompleted' }) });

      return;
    } else if (!foundMission) {
      callback({ error: new errorCreator.DoesNotExist({ name: `Mission ${code}` }) });

      return;
    }

    callback({ data: { mission: foundMission } });
  });
}

exports.getActiveMission = getActiveMission;
exports.createMission = createMission;
exports.setMissionCompleted = setMissionCompleted;
exports.getInactiveMissions = getInactiveMissions;
