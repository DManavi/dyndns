// public
import { BadRequestError } from 'error-lib';
// project-level
import { IPFamily, IPRetrieverService } from '@_/shared';

const IPV4_ENDPOINT = 'https://api.ipify.org/?format=json';
const IPV6_ENDPOINT = 'https://api64.ipify.org?format=json';

export class IpifyOrgIPRetrieverService implements IPRetrieverService {
  async retrieveIP(family: IPFamily): Promise<string> {
    let endpoint: string;

    switch (family) {
      case IPFamily.V4: {
        endpoint = IPV4_ENDPOINT;
        break;
      }

      case IPFamily.V6: {
        endpoint = IPV6_ENDPOINT;
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
