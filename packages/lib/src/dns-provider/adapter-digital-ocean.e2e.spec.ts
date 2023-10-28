// npm-level
import { get as env } from 'env-var';
import { NotFoundError } from 'error-lib';
import { AxiosInstance, create as createAxiosClient } from 'axios';
// package-level
import { DigitalOceanAdapter } from './adapter-digital-ocean';
import { DNSProvider } from './dns-provider';
import { DnsRecordType } from '../types';
import { AuthenticationFailedError } from './errors';

describe('adapter-digital-ocean.e2e', () => {
  const DOMAIN_NAME = env('DNS_PROVIDER_DIGITAL_OCEAN_DOMAIN_NAME')
    .required()
    .asString();
  const API_KEY = env('DNS_PROVIDER_DIGITAL_OCEAN_API_KEY')
    .required()
    .asString();

  const waitS = (seconds: number) =>
    new Promise((resolve) => setTimeout(resolve, seconds * 1000));

  let dnsProvider: DNSProvider;
  let subdomains: Record<string, DnsRecordType>;

  // cleanup records
  let httpClient: AxiosInstance;

  beforeAll(async () => {
    subdomains = {};

    httpClient = createAxiosClient({
      baseURL: 'https://api.digitalocean.com/v2',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    // create the domain
    const response = await httpClient.post('/domains', { name: DOMAIN_NAME });
    expect(response.status).toBe(201);

    await waitS(3);
  });

  beforeEach(() => {
    dnsProvider = new DigitalOceanAdapter({
      apiKey: API_KEY,
    });
  });

  afterAll(async () => {
    // delete the domain
    const response = await httpClient.delete(`/domains/${DOMAIN_NAME}`);
    expect(response.status).toBe(204);
  });

  it('throws error if API key is incorrect', async () => {
    (dnsProvider as any).opts.apiKey = 'incorrect-api-key';

    await expect(
      dnsProvider.updateRecord({
        domainName: DOMAIN_NAME,
        recordType: DnsRecordType.A,
        data: '127.0.0.1',
        subdomain: 'qwerty1',
      })
    ).rejects.toThrow(AuthenticationFailedError);
  });

  it('throws error if domain not found', async () => {
    await expect(
      dnsProvider.updateRecord({
        domainName: 'invalid-domain.com',
        recordType: DnsRecordType.A,
        data: '127.0.0.1',
        subdomain: 'qwerty1',
      })
    ).rejects.toThrow(NotFoundError);
  });

  it('throws error if subdomain not found and createIfNotExists=false', async () => {
    await expect(
      dnsProvider.updateRecord({
        domainName: DOMAIN_NAME,
        recordType: DnsRecordType.A,
        data: '127.0.0.1',
        subdomain: 'non.existing.subdomain',
      })
    ).rejects.toThrow(NotFoundError);
  });

  it('creates a new non-existing subdomain', async () => {
    await expect(
      dnsProvider.updateRecord({
        domainName: DOMAIN_NAME,

        recordType: DnsRecordType.A,
        subdomain: 'non.existing.subdomain',

        data: '127.0.0.1',
        createIfNotExists: true,
      })
    ).resolves.toBeUndefined();

    await waitS(2);
  });

  it('update an already existing subdomain', async () => {
    await expect(
      dnsProvider.updateRecord({
        domainName: DOMAIN_NAME,

        recordType: DnsRecordType.A,
        subdomain: 'non.existing.subdomain',

        data: '127.0.0.2',
      })
    ).resolves.toBeUndefined();
  });
});
