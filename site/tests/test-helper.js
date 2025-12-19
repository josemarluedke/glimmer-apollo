import Application from 'site/app';
import config from 'site/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start as qunitStart } from 'ember-qunit';

setApplication(Application.create(config.APP));

setup(QUnit.assert);

export function start() {
  qunitStart();
}
