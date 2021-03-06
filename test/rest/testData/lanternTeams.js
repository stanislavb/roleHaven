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

const tools = require('../helper/tools');
const appConfig = require('../../../config/defaults/config').app;

const data = {};

data.lanternTeamToDelete = {
  teamId: 5,
  teamName: tools.createRandString({ length: appConfig.teamNameMaxLength }),
  shortName: tools.createRandString({ length: appConfig.shortTeamMaxLength }),
};
data.lanternTeamToCreate = {
  teamId: 2,
  teamName: tools.createRandString({ length: appConfig.teamNameMaxLength }),
  shortName: tools.createRandString({ length: appConfig.shortTeamMaxLength }),
};
data.lanternTeamToCreateAndModify = {
  teamId: 1,
  teamName: tools.createRandString({ length: appConfig.teamNameMaxLength }),
  shortName: tools.createRandString({ length: appConfig.shortTeamMaxLength }),
  points: 22,
  isActive: false,
};
data.lanternTeamWithNewPoints = {
  points: 75,
};
data.lanternTeamWithIsActive = {
  isActive: true,
};
data.lanternTeamWithResetPoints = {
  points: 30,
  resetPoints: true,
};
data.lanternTeamThatDoesNotExist = {
  teamId: 0,
  teamName: 'a',
  shortName: 'b',
};

module.exports = data;
