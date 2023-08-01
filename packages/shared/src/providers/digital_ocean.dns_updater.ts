// public
import * as z from 'zod';
import { NotFoundError } from 'error-lib';
// package-level
import { DnsRecordType, DnsUpdater, UpdateRecordOpts } from '../types';
import { fetchUtils } from '../utils';

export type DomainRecord = {
  id: number;
  type: string;
  name: string;
  data: string;
};

const constructorOptsSchema = z
  .object({
    /**
     * API key obtained from [digital ocean dashboard](https://cloud.digitalocean.com/account/api/tokens)
     */
    apiKey: z.string().nonempty(),

    /**
     * Domain name
     */
    domainName: z.string().nonempty(),

    /**
     * Time to live [docs](https://docs.digitalocean.com/products/networking/dns/details/limits/)
     */
    ttl: z.number().int().positive().min(30).optional().default(300),

    /**
     * Create record if doesn't exist
     */
    createIfNotExist: z.boolean().optional().default(true),
  })
  .strict();

const optionalConstructorOptsSchema = constructorOptsSchema.optional();

export class DigitalOceanDnsUpdater implements DnsUpdater {
  protected static API_V2_URL = 'https://api.digitalocean.com/v2';
  protected static REQUEST_TIMEOUT_MS = 30 * 1000;

  protected readonly options: z.infer<typeof constructorOptsSchema>;

  constructor(opts: z.infer<typeof optionalConstructorOptsSchema>) {
    // validate & parse the inputs
    this.options = constructorOptsSchema.parse(opts);
  }

  protected getRequestInit(): RequestInit {
    return {
      headers: {
        Authorization: `Bearer ${this.options.apiKey}`,
        'Content-Type': 'application/json',
      },
      mode: 'no-cors',
      redirect: 'follow',
    };
  }

  protected async ensureDomainExist(): Promise<void> {
    const timeout = fetchUtils.createTimeoutController(
      DigitalOceanDnsUpdater.REQUEST_TIMEOUT_MS
    );
    timeout.start();

    const res = await fetch(
      `${DigitalOceanDnsUpdater.API_V2_URL}/domains/${this.options.domainName}`,
      {
        ...this.getRequestInit(),
        signal: timeout.signal,
      }
    );

    timeout.clear();

    if (res.status !== 200) {
      throw new NotFoundError(
        `Domain '${this.options.domainName}' was not found`
      );
    }
  }

  protected async fetchDnsRecords(
    recordType: DnsRecordType
  ): Promise<DomainRecord> {
    const timeout = fetchUtils.createTimeoutController(
      DigitalOceanDnsUpdater.REQUEST_TIMEOUT_MS
    );
    timeout.start();

    const res = await fetch(
      `${DigitalOceanDnsUpdater.API_V2_URL}/domains/${this.options.domainName}/records`,
      {
        ...this.getRequestInit(),
        signal: timeout.signal,
      }
    );

    timeout.clear();

    if (res.status !== 200) {
      throw new NotFoundError(
        `Domain '${this.options.domainName}' was not found`
      );
    }

    return {
      id: 1234,
      name: 'asd',
      data: 'ddd',
      type: 'AAAA',
    };
  }

  protected async checkIfSubdomainExists(
    subdomain: string
  ): Promise<{ exist: boolean; recordId: string }> {
    return {
      exist: true,
      recordId: 'qwerty',
    };
  }

  async updateRecord({
    subdomain,
    recordType,
    addresses,
    ttl,
  }: UpdateRecordOpts): Promise<void> {
    // ensure domain exist
    await this.ensureDomainExist();

    let { exist: subdomainExist, recordId } = await this.checkIfSubdomainExists(
      subdomain
    );

    if (subdomainExist === false && this.options.createIfNotExist === false) {
      throw new NotFoundError(
        `Subdomain '${subdomain}' does not exist and requested not to be created.`
      );
    }

    // create subdomain
    if (subdomainExist === false) {
    }
  }
}
