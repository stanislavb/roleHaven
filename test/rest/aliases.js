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

/* eslint-disable no-unused-expressions */

'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');
const chaiJson = require('chai-json-schema');
const schemas = require('./helper/schemas');
const helperData = require('./helper/data');

chai.should();
chai.use(chaiHttp);
chai.use(chaiJson);

describe('Aliases', () => {
  // jwt token
  let adminToken = '';

  before('Authenticate', (done) => {
    chai
      .request(app)
      .post('/api/authenticate')
      .send({ data: { user: helperData.adminUser } })
      .end((error, response) => {
        response.should.have.status(200);
        response.should.be.json;
        response.body.should.be.jsonSchema(schemas.authenticate);

        adminToken = response.body.data.token;

        done();
      });
  });

  it('Should NOT retrieve aliases with incorrect authorization on /aliases GET', (done) => {
    chai
      .request(app)
      .get('/api/aliases')
      .set('Authorization', helperData.incorrectJwt)
      .end((error, response) => {
        response.should.have.status(401);
        response.should.be.json;

        done();
      });
  });

  it('Should retrieve aliases and user name from self on /aliases GET', (done) => {
    chai
      .request(app)
      .get('/api/aliases')
      .set('Authorization', adminToken)
      .end((error, response) => {
        response.should.have.status(200);
        response.should.be.json;
        response.body.should.be.jsonSchema(schemas.aliases);

        done();
      });
  });

  it('Should create an alias on self on /aliases POST', (done) => {
    chai
      .request(app)
      .post('/api/aliases')
      .send({ data: { alias: 'secretalias' } })
      .set('Authorization', adminToken)
      .end((error, response) => {
        response.should.have.status(200);
        response.should.be.json;
        response.body.should.be.jsonSchema(schemas.alias);

        done();
      });
  });

  it('Should NOT create an alias with incorrect authorization on /aliases POST', (done) => {
    chai
      .request(app)
      .post('/api/aliases')
      .send({ data: { alias: 'twoalias' } })
      .set('Authorization', helperData.incorrectJwt)
      .end((error, response) => {
        response.should.have.status(401);
        response.should.be.json;

        done();
      });
  });

  it('Should NOT create an existing alias on /aliases POST', (done) => {
    chai
      .request(app)
      .post('/api/aliases')
      .send({ data: { alias: 'secretalias' } })
      .set('Authorization', adminToken)
      .end((error, response) => {
        response.should.have.status(403);
        response.should.be.json;

        done();
      });
  });
});
