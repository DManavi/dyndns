// public
import { BadRequestError } from 'error-lib';
// project-level
import { IPFamily, IPRetriever } from '@_/shared';
export { IPFamily };

const API_V4_URL = 'https://api.ipify.org/?format=json';
const API_V6_URL = 'https://api64.ipify.org?format=json';

export const create =
  (): IPRetriever =>
  async (family: IPFamily): Promise<string> => {
    let endpoint: string;

    switch (family) {
      case IPFamily.V4: {
        endpoint = API_V4_URL;
        break;
      }

      case IPFamily.V6: {
        endpoint = API_V6_URL;
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
  };
