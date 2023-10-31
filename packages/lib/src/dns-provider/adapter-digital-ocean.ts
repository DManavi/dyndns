// npm-level
import { AxiosInstance, AxiosResponse } from 'axios';
import axios from 'axios';
import {
  ApplicationError,
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from 'error-lib';
// package-level
import { DNSProvider, UpdateRecordOpts } from './dns-provider';
import { AuthenticationFailedError } from './errors';
import { DnsRecordType, IPFamily } from '../types';

export type DigitalOceanAdapterConstructorOpts = {
  /**
   * Your digital ocean API key
   */
  apiKey: string;
};

export type DefaultHTTPErrorResponse = {
  /**
   * Error identifier
   */
  id: string;

  /**
   * Error message
   */
  message: string;

  /**
   * Request id
   */
  request_id: string;
};

export type FetchDomainByNameOpts = {
  /**
   * HTTP client
   */
  httpClient: AxiosInstance;

  /**
   * Domain name to fetch
   */
  domainName: string;
};

export type FetchDomainByNameHTTPResponse = {
  domain: {
    /**
     * Domain name
     */
    name: string;

    /**
     * Domain TTL
     */
    ttl: number;

    /**
     * Zone file
     */
    zone_file: string;
  };
};

export type FetchDomainByNameResult = {
  /**
   * Domain name
   */
  name: string;

  /**
   * Time-to-live
   */
  ttl: number;

  /**
   * Zone file
   */
  zoneFile: string;
};

export type DomainRecord = {
  /**
   * Record identifier
   */
  id: number;

  /**
   * Record type
   */
  type: DnsRecordType;

  /**
   * Record name
   */
  name: string;

  /**
   * Record data
   */
  data: string;

  /**
   * Time-to-live
   */
  ttl: number;
};

export type FetchDomainRecordsOpts = {
  httpClient: AxiosInstance;

  filters: {
    domainName: string;

    recordType: DnsRecordType;

    pageSize: number;
    pageNumber: number;
  };
};

export type FetchDomainRecordsResultHttpResponse = {
  domain_records: Array<DomainRecord>;
  meta: {
    total: number;
  };
};

export type FetchDomainRecordsResult = Array<DomainRecord>;

export type FindDomainRecordOpts = {
  domainRecords: Array<DomainRecord>;
  filters: FindDomainRecordFilters;
};

export type FindDomainRecordResult = DomainRecord | undefined;

export type FindDomainRecordFilters = {
  /**
   * DNS Record type
   */
  recordType: DnsRecordType;

  /**
   * Record name
   */
  recordName: string;
};

export type CreateDomainRecordOpts = {
  /**
   * HTTP client
   */
  httpClient: AxiosInstance;

  /**
   * Domain name
   */
  domainName: string;

  /**
   * Domain record
   */
  domainRecord: Omit<DomainRecord, 'id'>;
};

export type CreateDomainRecordHTTPResponse = {
  /**
   * Newly created domain record
   */
  domain_record: DomainRecord;
};

export type CreateDomainRecordResult = DomainRecord;

export type UpdateDomainRecordOpts = {
  /**
   * HTTP client
   */
  httpClient: AxiosInstance;

  /**
   * Domain name
   */
  domainName: string;

  /**
   * Updated domain record
   */
  domainRecord: DomainRecord;
};

export type UpdateDomainRecordHTTPResponse = {
  /**
   * Updated domain record
   */
  domain_record: DomainRecord;
};

export type UpdateDomainRecordResult = DomainRecord;

export class DigitalOceanAdapter implements DNSProvider {
  constructor(protected readonly opts: DigitalOceanAdapterConstructorOpts) {}

  protected ensureIPFamilyIsCorrect(ipFamily: IPFamily): void {
    if (Object.values(IPFamily).indexOf(ipFamily) === -1) {
      throw new BadRequestError(`Unknown IP address family: '${ipFamily}'`);
    }
  }

  protected getBaseURL(): string {
    return 'https://api.digitalocean.com/v2';
  }

  protected createHTTPClient(baseURL: string, apiKey: string): AxiosInstance {
    return axios.create({
      baseURL,

      headers: {
        Authorization: `Bearer ${apiKey}`,
      },

      timeout: 10 * 1000,
      withCredentials: false,

      validateStatus: () => true,
    });
  }

  protected ensureAuthenticationWasSuccessful(
    response: AxiosResponse<DefaultHTTPErrorResponse>
  ): void {
    if (response.status === 401) {
      throw new AuthenticationFailedError(
        `${response.data.message} (request id: ${response.data.request_id})`,
        { code: response.data.id }
      );
    }
  }

  protected ensureRateLimitNotExceeded(
    response: AxiosResponse<DefaultHTTPErrorResponse>
  ): void {
    if (response.status === 429) {
      throw new ForbiddenError(
        `${response.data.message} (request id: ${response.data.request_id})`,
        {
          code: response.data.id,
        }
      );
    }
  }

  protected ensureRequestWasSuccessful(
    response: AxiosResponse,
    ...successfulStatusCodes: Array<number>
  ): void {
    // successful HTTP response code(s)
    if (successfulStatusCodes.includes(response.status) === true) {
      return;
    }

    const errorResponse: AxiosResponse<DefaultHTTPErrorResponse> = response;

    // unknown status code
    throw new ApplicationError(
      `${errorResponse.data.message} (request id: ${errorResponse.data.request_id}) (${response.status} - ${response.statusText})`,
      { code: errorResponse.data.id, cause: response as any }
    );
  }

  protected ensureResourceWasFound(
    response: AxiosResponse<DefaultHTTPErrorResponse>
  ): void {
    if (response.status === 404) {
      throw new NotFoundError(
        `${response.data.message} (request id: ${response.data.request_id})`,
        {
          code: response.data.id,
        }
      );
    }
  }

  protected async fetchDomainByName({
    httpClient,
    domainName,
  }: FetchDomainByNameOpts): Promise<FetchDomainByNameResult> {
    // fetch domain details
    const response: AxiosResponse = await httpClient.get(
      `/domains/${domainName}`
    );

    // validate HTTP response status
    this.ensureAuthenticationWasSuccessful(response);
    this.ensureRateLimitNotExceeded(response);
    this.ensureResourceWasFound(response);
    this.ensureRequestWasSuccessful(response, 200);

    // map parameters
    const { domain }: FetchDomainByNameHTTPResponse = response.data;

    return {
      name: domain.name,
      ttl: domain.ttl,
      zoneFile: domain.zone_file,
    };
  }

  protected async fetchDomainRecords({
    httpClient,
    filters,
  }: FetchDomainRecordsOpts): Promise<FetchDomainRecordsResult> {
    // fetch domain records
    const response: AxiosResponse = await httpClient.get(
      `/domains/${filters.domainName}/records`,
      {
        params: {
          type: filters.recordType.toUpperCase(),

          per_page: filters.pageSize,
          page: filters.pageNumber,
        },
      }
    );

    // validate HTTP response status
    this.ensureAuthenticationWasSuccessful(response);
    this.ensureRateLimitNotExceeded(response);
    this.ensureResourceWasFound(response);
    this.ensureRequestWasSuccessful(response, 200);

    // map parameters
    const { domain_records }: FetchDomainRecordsResultHttpResponse =
      response.data;

    // clone the domain records
    return domain_records.map((_) => ({ ..._ }));
  }

  protected findDomainRecord({
    domainRecords,
    filters,
  }: FindDomainRecordOpts): FindDomainRecordResult {
    return domainRecords.find(
      (_) =>
        _.name === filters.recordName &&
        _.type.toUpperCase() === filters.recordType.toUpperCase()
    );
  }

  protected async createDomainRecord({
    httpClient,
    domainName,
    domainRecord,
  }: CreateDomainRecordOpts): Promise<CreateDomainRecordResult> {
    // create domain record
    const response: AxiosResponse = await httpClient.post(
      `/domains/${domainName}/records`,
      {
        ...domainRecord,
        type: domainRecord.type.toUpperCase(),
      }
    );

    // validate HTTP response status
    this.ensureAuthenticationWasSuccessful(response);
    this.ensureRateLimitNotExceeded(response);
    this.ensureResourceWasFound(response);
    this.ensureRequestWasSuccessful(response, 201);

    // map parameters
    const {
      domain_record: createdDomainRecord,
    }: CreateDomainRecordHTTPResponse = response.data;

    // clone the created domain record
    return { ...createdDomainRecord };
  }

  protected async updateDomainRecord({
    httpClient,
    domainName,
    domainRecord,
  }: UpdateDomainRecordOpts): Promise<UpdateDomainRecordResult> {
    // update domain record
    const response: AxiosResponse = await httpClient.put(
      `/domains/${domainName}/records/${domainRecord.id}`,
      {
        ...domainRecord,
        type: domainRecord.type.toUpperCase(),
      }
    );

    // validate HTTP response status
    this.ensureAuthenticationWasSuccessful(response);
    this.ensureRateLimitNotExceeded(response);
    this.ensureResourceWasFound(response);
    this.ensureRequestWasSuccessful(response, 200);

    // map parameters
    const {
      domain_record: updatedDomainRecord,
    }: UpdateDomainRecordHTTPResponse = response.data;

    // clone the updated domain record
    return { ...updatedDomainRecord };
  }

  async updateRecord({
    domainName,

    subdomain,
    recordType,
    data,
    ttl,

    createIfNotExists,
    forceUpdate,
  }: UpdateRecordOpts<string>): Promise<void> {
    const baseURL = this.getBaseURL();
    const httpClient = await this.createHTTPClient(baseURL, this.opts.apiKey);

    // make sure domain exist (no need to read domain name in further steps)
    await this.fetchDomainByName({ httpClient, domainName });

    // if no subdomain is provided, use '@'
    const recordName = subdomain ?? '@';
    const recordTTL = ttl ?? 300;

    // list domain records (subdomains)
    const domainRecords = await this.fetchDomainRecords({
      httpClient,
      filters: {
        domainName,
        recordType,
        pageNumber: 1,
        pageSize: 100,
      },
    });

    // find the matched domain record (subdomain)
    let domainRecord = this.findDomainRecord({
      domainRecords,
      filters: {
        recordName,
        recordType,
      },
    });

    // create record if doesn't exist & user consented
    if (typeof domainRecord === 'undefined' && createIfNotExists === true) {
      domainRecord = await this.createDomainRecord({
        httpClient,
        domainName,
        domainRecord: {
          type: recordType,
          name: recordName,
          data,
          ttl: recordTTL,
        },
      });

      // early return since the record is just created
      return;
    }

    // record not found and user didn't consent to create one
    if (typeof domainRecord === 'undefined') {
      throw new NotFoundError(
        `No record found on domain '${domainName}' called '${recordName}' with type '${recordType}'`
      );
    }

    // forceful update requested, data, or TTL is different.
    const needUpdate =
      forceUpdate === true ||
      domainRecord.data !== data ||
      domainRecord.ttl !== recordTTL;

    if (needUpdate === true) {
      domainRecord = await this.updateDomainRecord({
        httpClient,
        domainName,
        domainRecord: {
          id: domainRecord.id,
          type: recordType,
          name: domainRecord.name,
          data,
          ttl: recordTTL,
        },
      });
    }
  }
}
