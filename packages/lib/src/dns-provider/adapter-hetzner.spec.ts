// public
import * as z from 'zod';
import { ApplicationError, ForbiddenError, NotFoundError } from 'error-lib';
import { AxiosResponse } from 'axios';
import * as sinon from 'sinon';
// package-level
import { DnsRecordType } from '../types';
import {
  CreateDomainRecordHTTPResponse,
  CreateDomainRecordResult,
  HetznerAdapter,
  FetchDomainByNameHTTPResponse,
  FetchDomainByNameResult,
  FetchDomainRecordsResult,
  FetchDomainRecordsResultHttpResponse,
  FindDomainRecordResult,
  UpdateDomainRecordHTTPResponse,
  UpdateDomainRecordResult,
} from './adapter-hetzner';
import { DNSProvider } from './dns-provider';
import { AuthenticationFailedError } from './errors';

const urlSchema = z.string().nonempty().url();

describe('adapter-hetzner', () => {
  const DOMAIN_NAME = 'example.com';
  const API_KEY = 'my-secret-api-key';
  let dnsProvider: DNSProvider;

  const FETCH_DOMAIN_MOCK_RESPONSE: FetchDomainByNameHTTPResponse = {
    zones: [
      {
        id: 'domain-id',
        name: DOMAIN_NAME,
        ttl: 1800,
      },
    ],
  };

  const FETCH_DOMAIN_RECORDS_MOCK_RESPONSE: FetchDomainRecordsResultHttpResponse =
    {
      records: [
        {
          id: '1',
          zone_id: 'z1',
          name: 'a',
          type: DnsRecordType.A,
          value: '1.1.1.1',
          ttl: 1800,
        },
        {
          id: '2',
          zone_id: 'z1',
          name: 'aaaa',
          type: DnsRecordType.AAAA,
          value: '::1',
          ttl: 1800,
        },
      ],

      meta: {
        total: 2,
      },
    };

  const CREATE_DOMAIN_MOCK_RESPONSE: CreateDomainRecordHTTPResponse = {
    record: {
      id: '1234',
      zone_id: 'z1',
      type: DnsRecordType.A,
      name: DOMAIN_NAME,
      value: '1.1.1.1',
      ttl: 1800,
    },
  };

  const UPDATE_DOMAIN_MOCK_RESPONSE: UpdateDomainRecordHTTPResponse = {
    record: {
      id: '1234',
      zone_id: 'z1',
      type: DnsRecordType.A,
      name: DOMAIN_NAME,
      value: '1.1.1.1',
      ttl: 1800,
    },
  };

  beforeEach(() => {
    dnsProvider = new HetznerAdapter({
      apiKey: API_KEY,
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getBaseURL', () => {
    it('always returns base URL', () => {
      const fn = (dnsProvider as any).getBaseURL;

      const httpEndpoint = fn();

      expect(typeof httpEndpoint).toBe('string');
      expect(httpEndpoint.length).toBeGreaterThan(0);

      const parseResult = urlSchema.safeParse(httpEndpoint);

      expect(parseResult.success).toBe(true);
      expect((parseResult as any).data).toBe(httpEndpoint);
    });
  });

  describe('createHTTPClient', () => {
    it('always creates an instance of axios', () => {
      const baseURL = 'http://base-url.local';
      const apiKey = '123456';

      const fn = (dnsProvider as any).createHTTPClient;
      const httpClient = fn(baseURL, apiKey);

      expect(httpClient.defaults.baseURL).toBe(baseURL);
      expect(httpClient.defaults?.headers['Auth-API-Token']).toBe(apiKey);
    });
  });

  describe('ensureAuthenticationWasSuccessful', () => {
    it('throws error if status code is 401 (Unauthorized)', () => {
      const response: Partial<AxiosResponse> = {
        status: 401,
        data: {
          id: 'error-id',
          message: 'error-message',
          request_id: 'request-id',
        },
      };

      const fn = (dnsProvider as any).ensureAuthenticationWasSuccessful;
      expect(() => fn(response)).toThrow(AuthenticationFailedError);
    });

    it('returns undefined (void) if the status is anything other than 401 (Unauthorized)', () => {
      const response: Partial<AxiosResponse> = {
        status: 402,
      };

      const fn = (dnsProvider as any).ensureAuthenticationWasSuccessful;
      expect(fn(response)).toBeUndefined();
    });
  });

  describe('ensureRequestWasSuccessful', () => {
    it('throws error if status code is not among successful status codes', () => {
      const response: Partial<AxiosResponse> = {
        status: 200,
        data: {
          id: 'error-id',
          message: 'error-message',
          request_id: 'request-id',
        },
      };

      const fn = (dnsProvider as any).ensureRequestWasSuccessful;
      expect(() => fn(response, 400, 403, 401)).toThrow(ApplicationError);
    });

    it('returns undefined (void) if the status is among successful status codes', () => {
      const response: Partial<AxiosResponse> = {
        status: 402,
      };

      const fn = (dnsProvider as any).ensureRequestWasSuccessful;
      expect(fn(response, 200, 402, 503)).toBeUndefined();
    });
  });

  describe('ensureResourceWasFound', () => {
    it('throws error if status code is 404', () => {
      const response: Partial<AxiosResponse> = {
        status: 404,
        data: {
          id: 'error-id',
          message: 'error-message',
          request_id: 'request-id',
        },
      };

      const fn = (dnsProvider as any).ensureResourceWasFound;
      expect(() => fn(response)).toThrow(NotFoundError);
    });

    it('returns undefined (void) if the status is anything other than 404', () => {
      const response: Partial<AxiosResponse> = {
        status: 401,
        data: {
          id: 'error-id',
          message: 'error-message',
          request_id: 'request-id',
        },
      };

      const fn = (dnsProvider as any).ensureResourceWasFound;
      expect(fn(response)).toBeUndefined();
    });
  });

  describe('ensureAccessWasGranted', () => {
    it('throws error if status code is 403', () => {
      const response: Partial<AxiosResponse> = {
        status: 403,
        data: {
          id: 'error-id',
          message: 'error-message',
          request_id: 'request-id',
        },
      };

      const fn = (dnsProvider as any).ensureAccessWasGranted;
      expect(() => fn(response)).toThrow(ForbiddenError);
    });

    it('returns undefined (void) if the status is anything other than 403', () => {
      const response: Partial<AxiosResponse> = {
        status: 401,
        data: {
          id: 'error-id',
          message: 'error-message',
          request_id: 'request-id',
        },
      };

      const fn = (dnsProvider as any).ensureAccessWasGranted;
      expect(fn(response)).toBeUndefined();
    });
  });

  describe('fetchDomainByName', () => {
    it("returns the requested domain's details", async () => {
      const createHTTPClient = (dnsProvider as any).createHTTPClient;
      const httpClient = createHTTPClient('/', API_KEY);

      sinon.replace(
        httpClient,
        'get',
        sinon.fake(async () => ({
          status: 200,
          data: FETCH_DOMAIN_MOCK_RESPONSE,
        }))
      );

      const result: FetchDomainByNameResult = await (
        dnsProvider as any
      ).fetchDomainByName({
        httpClient: httpClient,
        domainName: DOMAIN_NAME,
      });

      expect(typeof result).toBe('object');
      expect(typeof result?.name).toBe('string');
      expect(result?.name).toBe(DOMAIN_NAME);
    });
  });

  describe('fetchDomainRecords', () => {
    it("returns the requested domain's records", async () => {
      const createHTTPClient = (dnsProvider as any).createHTTPClient;
      const httpClient = createHTTPClient('/', API_KEY);

      const spy = sinon.replace(
        httpClient,
        'get',
        sinon.fake(async () => ({
          status: 200,
          data: FETCH_DOMAIN_RECORDS_MOCK_RESPONSE,
        }))
      );

      const result: FetchDomainRecordsResult = await (
        dnsProvider as any
      ).fetchDomainRecords({
        httpClient: httpClient,
        filters: {
          zoneId: 'z1',

          pageSize: 10,
          pageNumber: 1,
        },
      });

      const [url, opts] = spy.args[0] as any;

      expect(url).toBe(`/records`);
      expect(opts.params).toStrictEqual({
        zone_id: 'z1',

        per_page: 10,
        page: 1,
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result).toStrictEqual(FETCH_DOMAIN_RECORDS_MOCK_RESPONSE.records);
    });
  });

  describe('findDomainRecord', () => {
    it('returns the domain record', () => {
      const result: FindDomainRecordResult = (
        dnsProvider as any
      ).findDomainRecord({
        domainRecords: FETCH_DOMAIN_RECORDS_MOCK_RESPONSE.records,
        filters: {
          recordType: DnsRecordType.A,
          recordName: 'a',
        },
      });

      expect(typeof result).toBe('object');
      expect(result).toStrictEqual(
        FETCH_DOMAIN_RECORDS_MOCK_RESPONSE.records[0]
      );
    });

    it('return undefined if nothing is matched', () => {
      const result: FindDomainRecordResult = (
        dnsProvider as any
      ).findDomainRecord({
        domainRecords: FETCH_DOMAIN_RECORDS_MOCK_RESPONSE.records,
        filters: {
          recordType: DnsRecordType.A,
          recordName: 'b',
        },
      });

      expect(result).toBeUndefined();
    });
  });

  describe('createDomainRecord', () => {
    it('returns the created record details', async () => {
      const createHTTPClient = (dnsProvider as any).createHTTPClient;
      const httpClient = createHTTPClient('/', API_KEY);

      sinon.replace(
        httpClient,
        'post',
        sinon.fake(async () => ({
          status: 200,
          data: CREATE_DOMAIN_MOCK_RESPONSE,
        }))
      );

      const result: CreateDomainRecordResult = await (
        dnsProvider as any
      ).createDomainRecord({
        httpClient: httpClient,
        domainName: DOMAIN_NAME,
        domainRecord: FETCH_DOMAIN_RECORDS_MOCK_RESPONSE.records[0],
      });

      expect(typeof result).toBe('object');
      expect(typeof result?.name).toBe('string');
      expect(result?.name).toBe(DOMAIN_NAME);
      expect(typeof result?.id).toBe('string');
    });
  });

  describe('updateDomainRecord', () => {
    it('updates the record', async () => {
      const createHTTPClient = (dnsProvider as any).createHTTPClient;
      const httpClient = createHTTPClient('/', API_KEY);

      sinon.replace(
        httpClient,
        'put',
        sinon.fake(async () => ({
          status: 200,
          data: UPDATE_DOMAIN_MOCK_RESPONSE,
          domainRecord: FETCH_DOMAIN_RECORDS_MOCK_RESPONSE.records[0],
        }))
      );

      const result: UpdateDomainRecordResult = await (
        dnsProvider as any
      ).updateDomainRecord({
        httpClient: httpClient,
        recordId: FETCH_DOMAIN_RECORDS_MOCK_RESPONSE.records[0].id,
        domainRecord: FETCH_DOMAIN_RECORDS_MOCK_RESPONSE.records[0],
      });

      expect(typeof result).toBe('object');
      expect(typeof result?.name).toBe('string');
      expect(result?.name).toBe(DOMAIN_NAME);
      expect(typeof result?.id).toBe('string');
    });
  });

  describe('updateRecord', () => {
    it("throws error if createIfNotExists=false and record doesn't exist", async () => {
      const recordName = '@';
      const recordType = DnsRecordType.A;

      sinon.replace(
        dnsProvider as any,
        'fetchDomainByName',
        async () => FETCH_DOMAIN_MOCK_RESPONSE.zones[0]
      );
      sinon.replace(dnsProvider as any, 'fetchDomainRecords', async () => []);

      await expect(
        dnsProvider.updateRecord({
          domainName: DOMAIN_NAME,
          subdomain: recordName,
          recordType,
          data: '1.1.1.1',
        })
      ).rejects.toThrow(
        `No record found on domain '${DOMAIN_NAME}' called '${recordName}' with type '${recordType}'`
      );
    });

    it("creates the requested record if createIfNotExists=true and record doesn't exist", async () => {
      const recordName = '@';
      const recordType = DnsRecordType.A;

      sinon.replace(
        dnsProvider as any,
        'fetchDomainByName',
        async () => FETCH_DOMAIN_MOCK_RESPONSE.zones[0]
      );
      sinon.replace(dnsProvider as any, 'fetchDomainRecords', async () => []);
      const createDomainRecordSpy = sinon.replace(
        dnsProvider as any,
        'createDomainRecord',
        sinon.fake(async () => undefined)
      );

      await expect(
        dnsProvider.updateRecord({
          domainName: DOMAIN_NAME,
          subdomain: recordName,
          recordType,
          data: '1.1.1.1',

          createIfNotExists: true,
        })
      ).resolves.toBeUndefined();

      expect(createDomainRecordSpy.calledOnce).toBe(true);
    });

    it('always updates the record, no matter what', async () => {
      const recordName = 'a';
      const recordType = DnsRecordType.A;

      sinon.replace(
        dnsProvider as any,
        'fetchDomainByName',
        async () => FETCH_DOMAIN_MOCK_RESPONSE.zones[0]
      );
      sinon.replace(
        dnsProvider as any,
        'fetchDomainRecords',
        async () => FETCH_DOMAIN_RECORDS_MOCK_RESPONSE.records
      );
      const createDomainRecordSpy = sinon.replace(
        dnsProvider as any,
        'createDomainRecord',
        sinon.fake(async () => undefined)
      );

      const updateDomainRecordSpy = sinon.replace(
        dnsProvider as any,
        'updateDomainRecord',
        sinon.fake(() => FETCH_DOMAIN_RECORDS_MOCK_RESPONSE.records[0])
      );

      await expect(
        dnsProvider.updateRecord({
          domainName: DOMAIN_NAME,
          subdomain: recordName,
          recordType,
          data: '1.1.1.1',

          forceUpdate: true,
        })
      ).resolves.toBeUndefined();

      expect(createDomainRecordSpy.calledOnce).toBe(false);
      expect(updateDomainRecordSpy.calledOnce).toBe(true);
    });

    it('always updates the record, cause the data is changed', async () => {
      const recordName = 'a';
      const recordType = DnsRecordType.A;

      sinon.replace(
        dnsProvider as any,
        'fetchDomainByName',
        async () => FETCH_DOMAIN_MOCK_RESPONSE.zones[0]
      );
      sinon.replace(
        dnsProvider as any,
        'fetchDomainRecords',
        async () => FETCH_DOMAIN_RECORDS_MOCK_RESPONSE.records
      );
      const createDomainRecordSpy = sinon.replace(
        dnsProvider as any,
        'createDomainRecord',
        sinon.fake(async () => undefined)
      );

      const updateDomainRecordSpy = sinon.replace(
        dnsProvider as any,
        'updateDomainRecord',
        sinon.fake(() => FETCH_DOMAIN_RECORDS_MOCK_RESPONSE.records[0])
      );

      await expect(
        dnsProvider.updateRecord({
          domainName: DOMAIN_NAME,
          subdomain: recordName,
          recordType,
          data: '2.2.2.2',
        })
      ).resolves.toBeUndefined();

      expect(createDomainRecordSpy.calledOnce).toBe(false);
      expect(updateDomainRecordSpy.calledOnce).toBe(true);
    });
  });
});
