/* eslint-disable @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access */
import Route from '@ember/routing/route';
import config from 'test-app/config/environment';
import { importSync } from '@embroider/macros';

export default class ApplicationRoute extends Route {
  async beforeModel(): Promise<void> {
    if (config.environment === 'development') {
      // @ts-expect-error: cannot get type of that file
      await importSync('test-app/mocks/browser').worker.start();
    }
  }
}
