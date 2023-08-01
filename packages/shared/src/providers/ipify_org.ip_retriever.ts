// public
import { BadRequestError } from 'error-lib';
// project-level
import { IPFamily, IPRetrieverService } from '@_/shared';

export class IpifyOrgIPRetrieverService implements IPRetrieverService {
  protected static API_V4_URL = 'https://api.ipify.org/?format=json';
  protected static API_V6_URL = 'https://api64.ipify.org?format=json';

  async retrieveIP(family: IPFamily): Promise<string> {
    let endpoint: string;

    switch (family) {
      case IPFamily.V4: {
        endpoint = IpifyOrgIPRetrieverService.API_V4_URL;
        break;
      }

      case IPFamily.V6: {
        endpoint = IpifyOrgIPRetrieverService.API_V6_URL;
        break;
      }

      default: {
        throw new BadRequestError(`Unknown IP address family: ${family}`);
      }
    }

    const resp = await fetch(endpoint, {
      credentials: 'omit',
      method: 'GET',
      redirect: 'follow',
    });

    // parse body as JSON
    const body: { ip: string } = await resp.json();

    return body.ip;
  }
}
