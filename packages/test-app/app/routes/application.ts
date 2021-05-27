import Route from '@ember/routing/route';
import config from 'test-app/config/environment';
import { worker } from 'test-app/mocks/browser';

export default class ApplicationRoute extends Route {
  async beforeModel(): Promise<void> {
    if (config.environment === 'development') {
      await worker.start();
    }
  }
}
