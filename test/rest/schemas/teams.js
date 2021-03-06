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

schemas.team = {
  type: 'object',
  required: ['data'],
  properties: {
    data: {
      type: 'object',
      required: [
        'team',
        'wallet',
        'room',
      ],
      properties: {
        team: {
          type: 'object',
          required: [
            'teamName',
            'shortName',
            'admins',
            'owner',
            'verified',
          ],
          properties: {
            teamName: { type: 'string' },
            shortName: { type: 'string' },
            admins: {
              type: 'array',
              items: { type: 'string' },
            },
            owner: { type: 'string' },
            verified: { type: 'boolean' },
          },
        },
        wallet: {
          type: 'object',
          required: [
            'amount',
            'owner',
            'accessLevel',
            'isProtected',
            'team',
          ],
          properties: {
            amount: { type: 'number' },
            owner: { type: 'string' },
            accessLevel: { type: 'number' },
            isProtected: { type: 'boolean' },
            team: { type: 'string' },
          },
        },
        room: {
          type: 'object',
          required: [
            'roomName',
            'accessLevel',
            'visibility',
            'owner',
            'anonymous',
          ],
          properties: {
            roomName: { type: 'string' },
            accessLevel: { type: 'number' },
            visibility: { type: 'number' },
            owner: { type: 'string' },
            anonymous: { type: 'boolean' },
          },
        },
      },
    },
  },
};

schemas.teams = {
  type: 'object',
  required: ['data'],
  properties: {
    data: {
      type: 'object',
      required: ['teams'],
      properties: {
        teams: {
          type: 'array',
          items: {
            type: 'object',
            required: [
              'teamName',
              'shortName',
            ],
            properties: {
              teamName: { type: 'string' },
              shortName: { type: 'string' },
            },
          },
        },
      },
    },
  },
};

module.exports = schemas;
