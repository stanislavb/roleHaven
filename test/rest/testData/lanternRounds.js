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

const data = {};

data.lanternRoundToCreate = {
  startTime: '2017-10-10T12:42:06.262Z',
  endTime: '2017-10-28T23:42:06.262Z',
  roundId: 1,
};
data.lanternRoundToCreateAndModify = {
  roundId: 2,
  startTime: '2017-10-15T12:42:06.262Z',
  endTime: '2017-10-25T23:42:06.262Z',
};
data.lantertRoundWithNewStartTime = {
  startTime: '2017-10-15T12:42:06.262Z',
};

data.lanternRoundWithNewEndTime = {
  endTime: '2017-10-15T12:42:06.262Z',
};
data.lanternRoundThatDoesNotExist = {
  roundId: 3,
  startTime: '2017-10-15T12:42:06.262Z',
  endTime: '2017-10-25T23:42:06.262Z',
};
data.lanternRoundToGet = {
  roundId: 4,
  startTime: '2017-10-15T12:42:06.262Z',
  endTime: '2017-10-25T23:42:06.262Z',
};

module.exports = data;
