import { IPRetrieverService } from '@_/shared';

export class IPRetrieverServiceImpl implements IPRetrieverService {
  async retrieveIPv4(): Promise<string> {
    // call the API
    const resp = await fetch('https://api.ipify.org/?format=json', {
      credentials: 'omit',
      method: 'GET',
      redirect: 'follow',
    });

    // parse body as JSON
    const body: { ip: string } = await resp.json();

    return body.ip;
  }

  async retrieveIPv6(): Promise<string> {
    // call the API
    const resp = await fetch('https://api64.ipify.org?format=json', {
      credentials: 'omit',
      method: 'GET',
      redirect: 'follow',
    });

    // parse body as JSON
    const body: { ip: string } = await resp.json();

    return body.ip;
  }
}
