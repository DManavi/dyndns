import {
  DnsRecordType,
  DnsUpdater,
  DnsUpdateResult,
  fetchUtils,
} from '@_/shared';

import { DomainNotFoundError } from './domain-not-found.error';
import { UnauthorizedError } from './unauthorized.error';
import { ApplicationError } from 'error-lib';

export type DigitalOceanDnsUpdaterOpts = {
  /**
   * Digital ocean API key
   */
  apiKey: string;

  /**
   * Timeout (in ms)
   */
  timeout?: number;
};

type Domain = {
  name: string;
  ttl?: number;
  zone_file: string;
};

type FetchDomainResponse = { domain: Domain };

type DomainRecord = {
  id: number;
  type: string;
  name: string;
  data: string;
  ttl: number;
};

type FetchDomainRecordsResponse = {
  domain_records: Array<DomainRecord>;
};

const DEFAULT_TIMEOUT = 30 * 1000;
const API_BASE_URL = 'https://api.digitalocean.com/v2';

export const processCommonStatusCodes = (statusCode: number): void => {
  switch (statusCode) {
    case 401: {
      throw new UnauthorizedError();
    }
    case 429: {
      throw new ApplicationError(`API rate limit exceeded`);
    }

    case 500: {
      throw new ApplicationError('Server Error');
    }
  }
};

export const fetchDomain = async (
  apiKey: string,
  domainName: string,
  timeout: number
): Promise<Domain> => {
  const timeoutController = fetchUtils.createTimeoutController(timeout);

  timeoutController.start();

  const response = await fetch(`${API_BASE_URL}/domains/${domainName}`, {
    signal: timeoutController.signal,

    credentials: 'omit',
    method: 'GET',
    redirect: 'follow',

    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  timeoutController.clear();

  // check common status code
  processCommonStatusCodes(response.status);

  // check endpoint-specific status code
  switch (response.status) {
    case 200: {
      break;
    }
    case 404: {
      throw new DomainNotFoundError();
    }
    default: {
      throw new ApplicationError(`Unexpected Error ${response.status}`);
    }
  }

  // parse JSON response
  const { domain }: FetchDomainResponse = await response.json();

  return domain;
};

export const fetchDomainRecord = async (
  apiKey: string,
  domainName: string,
  recordType: DnsRecordType,
  timeout: number
): Promise<DomainRecord> => {
  const timeoutController = fetchUtils.createTimeoutController(timeout);
  const qs = new URLSearchParams({ type: recordType }).toString();

  timeoutController.start();

  const response = await fetch(
    `${API_BASE_URL}/domains/${domainName}/records?${qs.toString()}`,
    {
      signal: timeoutController.signal,

      credentials: 'omit',
      method: 'GET',
      redirect: 'follow',

      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  timeoutController.clear();

  // check common status code
  processCommonStatusCodes(response.status);

  // check endpoint-specific status code
  switch (response.status) {
    case 200: {
      break;
    }
    case 404: {
      throw new DomainNotFoundError();
    }
    default: {
      throw new ApplicationError(`Unexpected Error ${response.status}`);
    }
  }

  // parse JSON response
  const { domain_records: domainRecords }: FetchDomainRecordsResponse =
    await response.json();

  return domainRecords;
};

export const createDomainRecord = async (): Promise<void> => {};

export const updateDomainRecord = async (): Promise<void> => {};

export const create =
  (digitalOceanOpts: DigitalOceanDnsUpdaterOpts): DnsUpdater =>
  async (opts) => {
    // const timeoutController = fetchUtils.createTimeoutController(
    //   digitalOceanOpts.timeout ?? DEFAULT_TIMEOUT
    // );

    const timeout = digitalOceanOpts.timeout ?? DEFAULT_TIMEOUT;

    const domain = await fetchDomain(
      digitalOceanOpts.apiKey,
      opts.domainName,
      timeout
    );

    const domainRecords = await fetchDomainRecord(
      digitalOceanOpts.apiKey,
      opts.domainName,
      opts.subdomain,
      opts.recordType,
      timeout
    );
  };

export class DigitalOceanDynamicDNS {
  constructor() {}
}
