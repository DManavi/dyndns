// package-level
import { DnsRecordType } from '../types';

export type UpdateRecordOpts<TData = string> = {
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
  data: TData;

  /**
   * Time-to-live
   */
  ttl?: number;

  /**
   * Always update DNS record (regardless of passing the same IP over and over again)
   */
  forceUpdate?: boolean;

  /**
   * Create record if it doesn't exist
   */
  createIfNotExists?: boolean;
};

export interface DNSProvider {
  /**
   * Update DNS record
   * @param opts Record options
   */
  updateRecord(opts: UpdateRecordOpts): Promise<void>;
}
