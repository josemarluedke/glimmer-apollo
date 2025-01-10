import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import config from 'test-app/config/environment';
import { importSync } from '@embroider/macros';

export default class ApplicationRoute extends Route {
  async beforeModel(): Promise<void> {
    if (config.environment === 'development') {
      // @ts-ignore
      await importSync('test-app/mocks/browser').worker.start();
    }
  }
}
