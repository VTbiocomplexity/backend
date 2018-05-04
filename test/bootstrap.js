global.bluebird = require('bluebird');
global.chai = require('chai');
global.chaiHttp = require('chai-http');
global.sinon = require('sinon');
// global.proxyquire = require('proxyquire').noCallThru();
// global.supertest = require('supertest');
global.mongoose = require('mongoose');
global.mockgoose = require('mockgoose');

mongoose.Promise = bluebird;
process.env.NODE_ENV = 'test';
process.env.MONGO_DB_URI = 'localhost';
process.env.emailPWD = '';
global.expect = chai.expect;
chai.use(chaiHttp);
