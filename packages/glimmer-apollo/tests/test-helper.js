import Application from 'dummy/app';
import config from 'dummy/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start } from 'ember-qunit';
import { worker } from 'dummy/mocks/browser';

setApplication(Application.create(config.APP));

setup(QUnit.assert);

(async function () {
  await worker.start();
  start();
})();
