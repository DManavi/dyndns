// public
import { ApplicationError, BadRequestError } from 'error-lib';
import {
  create as createAxiosClient,
  AxiosInstance,
  AxiosResponse,
} from 'axios';
// project-level
import { IPRetriever } from './ip-retriever';
import { IPFamily } from '../types';

export type HTTPResponse = AxiosResponse<string>;

export class IPifyAdapter implements IPRetriever {
  protected ensureIPFamilyIsCorrect(ipFamily: IPFamily): void {
    if (Object.values(IPFamily).indexOf(ipFamily) === -1) {
      throw new BadRequestError(`Unknown IP address family: '${ipFamily}'`);
    }
  }

  protected getBaseURL(ipFamily: IPFamily): string {
    switch (ipFamily) {
      case IPFamily.V4: {
        return 'https://api.ipify.org';
      }

      case IPFamily.V6: {
        return 'https://api64.ipify.org';
      }

      default: {
        throw new BadRequestError(`Unknown IP address family: '${ipFamily}'`);
      }
    }
  }

  protected createHTTPClient(baseURL: string): AxiosInstance {
    return createAxiosClient({
      baseURL,

      timeout: 10 * 1000,
      withCredentials: false,
    });
  }

  protected ensureHTTPRequestWasSuccessful(response: HTTPResponse): void {
    // successful HTTP response
    if (response.status === 200) {
      return;
    }

    // unknown status code
    throw new ApplicationError(
      `Invalid HTTP response code received: ${response.status} (${response.statusText})`,
      { cause: response as any }
    );
  }

  async retrieve(ipFamily: IPFamily): Promise<string> {
    // ensure ip family is correct
    this.ensureIPFamilyIsCorrect(ipFamily);

    // create HTTP client
    const baseURL = this.getBaseURL(ipFamily);
    const httpClient = this.createHTTPClient(baseURL);

    // send HTTP request and parse the response
    const response = await httpClient.get<any, HTTPResponse>('/');
    this.ensureHTTPRequestWasSuccessful(response);

    return response.data;
  }
}
