declare module 'ember-cli-fastboot/services/fastboot' {
  import Service from '@ember/service';

  interface Request {
    method: string;
    body: unknown;
    cookies: unknown;
    headers: unknown;
    queryParams: unknown;
    path: string;
    protocol: string;
    host: string;
  }

  interface Response {
    statusCode: number;
    headers: unknown;
    body: unknown;
  }

  interface Shoebox {
    put(key: string, value: unknown): void;
    retrieve(key: string): undefined | JSON;
  }

  export default class Fastboot extends Service {
    public isFastBoot: boolean;
    public request: Request;
    public shoebox: Shoebox;
    public response: Response;
    public metadata: unknown; // need types
    public deferRendering(promise: Promise<unknown>): unknown;
  }
}
