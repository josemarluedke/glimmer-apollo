import Route from '@ember/routing/route';
import config from 'dummy/config/environment';
import { worker } from 'dummy/mocks/browser';

export default class ApplicationRoute extends Route {
  async beforeModel(): Promise<void> {
    if (config.environment === 'development') {
      await worker.start();
    }
  }
}
