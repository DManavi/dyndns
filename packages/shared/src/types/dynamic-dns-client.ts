// package-level
import { DnsRecordType } from './shared';

export type UpdateRecordOpts = {
  /**
   * Root domain
   */
  domainName: string;

  /**
   * Subdomain
   */
  subdomain?: string;

  /**
   * Record type
   */
  recordType: DnsRecordType;

  /**
   * Record data
   */
  data: string;

  /**
   * Time-to-live
   */
  ttl?: number;

  /**
   * Always update DNS record (regardless of passing the same IP over and over again)
   */
  forceUpdate?: boolean;
};

export enum UpdateRecordResult {
  /**
   * Updated was successful
   */
  OK = 'ok',

  /**
   * Update was failed
   */
  Failed = 'failed',

  /**
   * Unknown error response
   */
  Unknown = 'unknown',
}

export type UpdateRecordResponse = {
  /**
   * Update result
   */
  result: UpdateRecordResult;
};

export interface DynamicDNSClient {
  /**
   * Update DNS record
   * @param opts Record options
   */
  updateRecord(opts: UpdateRecordOpts): Promise<UpdateRecordResponse>;
}
