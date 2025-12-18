import Application from 'test-app/app';
import config from 'test-app/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start, setupEmberOnerrorValidation } from 'ember-qunit';
import { loadTests } from 'ember-qunit/test-loader';
import { worker } from 'test-app/mocks/browser';

setApplication(Application.create(config.APP));

setup(QUnit.assert);

(async function () {
  await worker.start();
  setupEmberOnerrorValidation();
  loadTests();
  start();
})();
