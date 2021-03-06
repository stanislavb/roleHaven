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

const lanternTeamBase = {
  type: 'object',
  required: ['teamId', 'teamName', 'shortName', 'isActive', 'points'],
  properties: {
    teamId: { type: 'number' },
    teamName: { type: 'string' },
    shortName: { type: 'string' },
    isActive: { type: 'boolean' },
    points: { type: 'number' },
  },
};

schemas.lanternTeam = {
  type: 'object',
  required: ['data'],
  properties: {
    data: {
      type: 'object',
      required: ['team'],
      properties: {
        team: lanternTeamBase,
      },
    },
  },
};

schemas.lanternTeams = {
  type: 'object',
  required: ['data'],
  properties: {
    data: {
      type: 'object',
      required: ['teams'],
      properties: {
        teams: {
          type: 'array',
          items: lanternTeamBase,
        },
      },
    },
  },
};

module.exports = schemas;
