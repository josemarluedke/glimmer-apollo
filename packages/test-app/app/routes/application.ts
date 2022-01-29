import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import config from 'test-app/config/environment';
import { importSync } from '@embroider/macros';

export default class ApplicationRoute extends Route {
  @service fastboot!: { isFastBoot: boolean };

  async beforeModel(): Promise<void> {
    if (config.environment === 'development') {
      if (!this.fastboot.isFastBoot) {
        // @ts-ignore
        await importSync('test-app/mocks/browser').worker.start();
      }
    }
  }
}
