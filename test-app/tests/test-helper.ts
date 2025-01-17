import Application from 'test-app/app';
import config from 'test-app/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start as qunitStart } from 'ember-qunit';
import { worker } from 'test-app/mocks/browser';

export async function start() {
  setApplication(Application.create(config.APP));
  setup(QUnit.assert);
  await worker.start();

  qunitStart({ loadTests: false });
}
