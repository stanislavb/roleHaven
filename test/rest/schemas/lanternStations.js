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


const schemas = {};

const lanternStationBase = {
  type: 'object',
  required: ['isActive', 'stationName', 'signalValue'],
  properties: {
    isActive: { type: 'boolean' },
    stationName: { type: 'string' },
    signalValue: { type: 'number' },
  },
};

schemas.lanternStation = {
  type: 'object',
  required: ['data'],
  properties: {
    data: {
      type: 'object',
      required: ['station'],
      properties: {
        station: lanternStationBase,
      },
    },
  },
};

schemas.lanternStations = {
  type: 'object',
  required: ['data'],
  properties: {
    data: {
      type: 'object',
      required: [
        'inactiveStations',
        'activeStations',
      ],
      properties: {
        inactiveStations: {
          type: 'array',
          items: lanternStationBase,
        },
        activeStations: {
          type: 'array',
          items: lanternStationBase,
        },
      },
    },
  },
};

module.exports = schemas;
