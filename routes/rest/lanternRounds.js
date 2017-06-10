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

const express = require('express');
const appConfig = require('../../config/defaults/config').app;
const jwt = require('jsonwebtoken');
const objectValidator = require('../../utils/objectValidator');
const dbConfig = require('../../config/defaults/config').databasePopulation;
const dbLanternHack = require('../../db/connectors/lanternhack');
const errorCreator = require('../../objects/error/errorCreator');

const router = new express.Router();

/**
 * @returns {Object} Router
 */
function handle() {
  /**
   * @api {get} /lanternRounds Get all lantern rounds
   * @apiVersion 5.1.0
   * @apiName GetLanternRounds
   * @apiGroup LanternRounds
   *
   * @apiHeader {String} Authorization Your JSON Web Token
   *
   * @apiDescription Get all lantern rounds, excluding past ones
   *
   * @apiSuccess {Object} data
   * @apiSuccess {Object} data.rounds Lantern rounds found
   * @apiSuccessExample {json} Success-Response:
   *   {
   *    "data": {
   *      "rounds": [{
   *        "roundId": 3,
   *        "startTime": "2016-10-14T09:54:18.694Z",
   *        "endTime": "2016-10-14T11:54:18.694Z",
   *      }, {
   *        "roundId": 4,
   *        "startTime": "2016-10-15T13:54:18.694Z",
   *        "endTime": "2016-10-15T15:54:18.694Z",
   *      }]
   *    }
   *  }
   */
  router.get('/', (req, res) => {
    // noinspection JSUnresolvedVariable
    const auth = req.headers.authorization || '';

    jwt.verify(auth, appConfig.jsonKey, (jwtErr, decoded) => {
      if (jwtErr) {
        res.status(500).json({
          errors: [{
            status: 500,
            title: 'Internal Server Error',
            detail: 'Internal Server Error',
          }],
        });

        return;
      } else if (!decoded) {
        res.status(401).json({
          errors: [{
            status: 401,
            title: 'Unauthorized',
            detail: 'Invalid token',
          }],
        });

        return;
      }

      dbLanternHack.getLanternRounds(({ error, data }) => {
        if (error) {
          res.status(500).json({
            errors: [{
              status: 500,
              title: 'Internal Server Error',
              detail: 'Internal Server Error',
            }],
          });

          return;
        }

        const currentTime = new Date();
        const rounds = data.rounds.filter(round => currentTime >= new Date(round.endTime));

        res.json({ data: { rounds } });
      });
    });
  });

  /**
   * @api {post} /lanternRounds Create a lantern round
   * @apiVersion 5.1.0
   * @apiName CreateLanternRound
   * @apiGroup LanternRounds
   *
   * @apiHeader {String} Authorization Your JSON Web Token
   *
   * @apiDescription Create a lantern round
   *
   * @apiParam {Object} data
   * @apiParam {string} data.round New round
   * @apiParam {number} data.round.roundId Round id
   * @apiParam {Date} data.round.startTime When the round starts
   * @apiParam {Date} data.round.endTime When the round ends
   * @apiParamExample {json} Request-Example:
   *   {
   *    "data": {
   *      "round": {
   *        "roundId": 1,
   *        "startTime": "2016-10-14T09:54:18.694Z",
   *        "endTime": "2016-10-14T11:54:18.694Z",
   *      }
   *    }
   *  }
   *
   * @apiSuccess {Object} data
   * @apiSuccess {Object[]} data.round Round created
   * @apiSuccessExample {json} Success-Response:
   *   {
   *    "data": {
   *      "round": {
   *        "roundId": 1,
   *        "startTime": "2016-10-14T09:54:18.694Z",
   *        "endTime": "2016-10-14T11:54:18.694Z",
   *      }
   *    }
   *  }
   */
  router.post('/', (req, res) => {
    if (!objectValidator.isValidData(req.body, { data: { round: { roundId: true, startTime: true, endTime: true } } })) {
      res.status(400).json({
        errors: [{
          status: 400,
          title: 'Missing data',
          detail: 'Unable to parse data',
        }],
      });

      return;
    }

    // noinspection JSUnresolvedVariable
    const auth = req.headers.authorization || '';

    jwt.verify(auth, appConfig.jsonKey, (jwtErr, decoded) => {
      if (jwtErr) {
        res.status(500).json({
          errors: [{
            status: 500,
            title: 'Internal Server Error',
            detail: 'Internal Server Error',
          }],
        });

        return;
      } else if (!decoded || decoded.data.accessLevel < dbConfig.apiCommands.CreateLanternRound.accessLevel) {
        res.status(401).json({
          errors: [{
            status: 401,
            title: 'Unauthorized',
            detail: 'Invalid token',
          }],
        });

        return;
      }

      const { roundId, startTime, endTime } = req.body.data.round;

      dbLanternHack.updateLanternRound({
        roundId,
        startTime,
        endTime,
        callback: ({ error, data }) => {
          if (error) {
            res.status(500).json({
              errors: [{
                status: 500,
                title: 'Internal Server Error',
                detail: 'Internal Server Error',
              }],
            });

            return;
          }

          // TODO Push to clients, if next round
          res.json({ data: { round: data.round } });
        },
      });
    });
  });

  /**
   * @api {post} /lanternRounds/start Trigger start of a lantern round
   * @apiVersion 5.1.0
   * @apiName StartLanternRound
   * @apiGroup LanternRounds
   *
   * @apiHeader {String} Authorization Your JSON Web Token
   *
   * @apiDescription Start a lantern round
   *
   * @apiParam {Object} data
   * @apiParam {string} data.round Lantern round
   * @apiParam {number} data.round.roundId Round id of the round to start
   * @apiParamExample {json} Request-Example:
   *   {
   *    "data": {
   *      "round": {
   *        "roundId": 1
   *      }
   *    }
   *  }
   *
   * @apiSuccess {Object} data
   * @apiSuccess {Object[]} data.round Round created
   * @apiSuccessExample {json} Success-Response:
   *   {
   *    "data": {
   *      "round": {
   *        "roundId": 1,
   *        "startTime": "2016-10-14T09:54:18.694Z",
   *        "endTime": "2016-10-14T11:54:18.694Z",
   *      }
   *    }
   *  }
   */
  router.post('/start', (req, res) => {
    if (!objectValidator.isValidData(req.body, { data: { round: { roundId: true } } })) {
      res.status(400).json({
        errors: [{
          status: 400,
          title: 'Missing data',
          detail: 'Unable to parse data',
        }],
      });

      return;
    }

    // noinspection JSUnresolvedVariable
    const auth = req.headers.authorization || '';

    jwt.verify(auth, appConfig.jsonKey, (jwtErr, decoded) => {
      if (jwtErr) {
        res.status(500).json({
          errors: [{
            status: 500,
            title: 'Internal Server Error',
            detail: 'Internal Server Error',
          }],
        });

        return;
      } else if (!decoded || decoded.data.accessLevel < dbConfig.apiCommands.StartLanternRound.accessLevel) {
        res.status(401).json({
          errors: [{
            status: 401,
            title: 'Unauthorized',
            detail: 'Invalid token',
          }],
        });

        return;
      }

      const round = req.body.data.round;

      dbLanternHack.getActiveLanternRound(({ error }) => {
        if (error) {
          if (error.type === errorCreator.ErrorTypes.ALREADYEXISTS) {
            res.status(404).json({
              errors: [{
                status: 404,
                title: 'Active round already exists',
                detail: 'Active round already exists',
              }],
            });

            return;
          }

          res.status(500).json({
            errors: [{
              status: 500,
              title: 'Internal Server Error',
              detail: 'Internal Server Error',
            }],
          });

          return;
        }

        dbLanternHack.startLanternRound({
          roundId: round.roundId,
          callback: ({ error: startError, data }) => {
            if (startError) {
              if (startError.type === errorCreator.ErrorTypes.DoesNotExist) {
                res.status(404).json({
                  errors: [{
                    status: 404,
                    title: 'Active round does not exists',
                    detail: 'Active round does not exists',
                  }],
                });

                return;
              }

              res.status(500).json({
                errors: [{
                  status: 500,
                  title: 'Internal Server Error',
                  detail: 'Internal Server Error',
                }],
              });

              return;
            }

            // TODO Emit to clients

            res.json({ data: { round: data.round } });
          },
        });
      });
    });
  });

  /**
   * @api {post} /lanternRounds/end Trigger end of a lantern round
   * @apiVersion 5.1.0
   * @apiName EndLanternRound
   * @apiGroup LanternRounds
   *
   * @apiHeader {String} Authorization Your JSON Web Token
   *
   * @apiDescription End active lantern round
   *
   * @apiSuccess {Object} data
   * @apiSuccess {Object[]} data.success Did the round end properly?
   * @apiSuccessExample {json} Success-Response:
   *   {
   *    "data": {
   *      "success": true
   *    }
   *  }
   */
  router.post('/end', (req, res) => {
    // noinspection JSUnresolvedVariable
    const auth = req.headers.authorization || '';

    jwt.verify(auth, appConfig.jsonKey, (jwtErr, decoded) => {
      if (jwtErr) {
        res.status(500).json({
          errors: [{
            status: 500,
            title: 'Internal Server Error',
            detail: 'Internal Server Error',
          }],
        });

        return;
      } else if (!decoded || decoded.data.accessLevel < dbConfig.apiCommands.StartLanternRound.accessLevel) {
        res.status(401).json({
          errors: [{
            status: 401,
            title: 'Unauthorized',
            detail: 'Invalid token',
          }],
        });

        return;
      }

      dbLanternHack.getActiveLanternRound(({ error }) => {
        if (error) {
          if (error.type === errorCreator.ErrorTypes.DOESNOTEXIST) {
            res.status(404).json({
              errors: [{
                status: 404,
                title: 'Active round does not exist',
                detail: 'Active round does not exist',
              }],
            });

            return;
          }

          res.status(500).json({
            errors: [{
              status: 500,
              title: 'Internal Server Error',
              detail: 'Internal Server Error',
            }],
          });

          return;
        }

        dbLanternHack.endLanternRound(({ error: endError }) => {
          if (endError) {
            if (endError.type === errorCreator.ErrorTypes.DOESNOTEXIST) {
              res.status(404).json({
                errors: [{
                  status: 404,
                  title: 'Active round does not exist',
                  detail: 'Active round does not exist',
                }],
              });

              return;
            }

            res.status(500).json({
              errors: [{
                status: 500,
                title: 'Internal Server Error',
                detail: 'Internal Server Error',
              }],
            });

            return;
          }

          // TODO Emit to clients

          res.json({ data: { success: true } });
        });
      });
    });
  });


  /**
   * @api {post} /:id Update an existing lantern round
   * @apiVersion 5.1.0
   * @apiName UpdateLanternRound
   * @apiGroup LanternRounds
   *
   * @apiHeader {String} Authorization Your JSON Web Token
   *
   * @apiDescription Follow a room
   *
   * @apiParam {Object} id Lantern round id
   *
   * @apiParam {Object} data
   * @apiParam {Object} data.round Lantern round
   * @apiParam {Date} data.round.startTime When the round starts
   * @apiParam {Date} data.round.endTime When the round ends
   * @apiParamExample {json} Request-Example:
   *   {
   *    "data": {
   *      "round": {
   *        "startTime": "2016-10-14T09:54:18.694Z",
   *        "endTime": "2016-10-14T11:54:18.694Z",
   *      }
   *    }
   *  }
   *
   * @apiSuccess {Object} data
   * @apiSuccess {Object} data.round New lantern round
   * @apiSuccess {Date} data.round.startTime When the round starts
   * @apiSuccess {Date} data.round.endTime When the round ends
   * @apiSuccessExample {json} Success-Response:
   *   {
   *    "data": {
   *      "round": {
   *        "startTime": "2016-10-14T09:54:18.694Z",
   *        "endTime": "2016-10-14T11:54:18.694Z",
   *      }
   *    }
   *  }
   */
  router.post('/:id', (req, res) => {
    if (!objectValidator.isValidData(req.body, { data: { round: { startTime: true, endTime: true } } }) || isNaN(req.body.data.round.roundId)) {
      res.status(400).json({
        errors: [{
          status: 400,
          title: 'Incorrect data',
          detail: 'Unable to parse data',
        }],
      });

      return;
    }

    // noinspection JSUnresolvedVariable
    const auth = req.headers.authorization || '';

    jwt.verify(auth, appConfig.jsonKey, (jwtErr, decoded) => {
      if (jwtErr) {
        res.status(500).json({
          errors: [{
            status: 500,
            title: 'Internal Server Error',
            detail: 'Internal Server Error',
          }],
        });

        return;
      } else if (!decoded || decoded.data.accessLevel < dbConfig.apiCommands.UpdateLanternRound.accessLevel) {
        res.status(401).json({
          errors: [{
            status: 401,
            title: 'Unauthorized',
            detail: 'Invalid token',
          }],
        });

        return;
      }

      const { startTime, endTime } = req.body.data.round;
      const roundId = req.params.id;

      dbLanternHack.getLanternRound({
        roundId,
        callback: ({ error }) => {
          if (error) {
            if (error.type === errorCreator.ErrorTypes.DOESNOTEXIST) {
              res.status(404).json({
                errors: [{
                  status: 404,
                  title: 'Failed to update lantern round',
                  detail: 'Lantern round does not exist',
                }],
              });

              return;
            }

            res.status(500).json({
              errors: [{
                status: 500,
                title: 'Internal Server Error',
                detail: 'Internal Server Error',
              }],
            });

            return;
          }

          dbLanternHack.updateLanternRound({
            roundId,
            startTime,
            endTime,
            callback: ({ error: updateError, data }) => {
              if (updateError) {
                res.status(500).json({
                  errors: [{
                    status: 500,
                    title: 'Internal Server Error',
                    detail: 'Internal Server Error',
                  }],
                });

                return;
              }

              const { round } = data;

              // TODO Push to clients, if next round
              res.json({ data: { round } });
            },
          });
        },
      });
    });
  });

  return router;
}

module.exports = handle;
