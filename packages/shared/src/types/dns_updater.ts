// package-level
import { DnsRecordType } from './shared';

export type UpdateRecordOpts = {
  /**
   * Subdomain address
   */
  subdomain: string;

  /**
   * Record type
   */
  recordType: DnsRecordType;

  /**
   * Addresses (hostnames or IP addresses) to set
   */
  addresses: Array<string>;

  /**
   * Time-to-live
   */
  ttl?: number;
};

export interface DnsUpdater {
  /**
   * Update DNS record
   * @param opts Update record options
   */
  updateRecord(opts: UpdateRecordOpts): Promise<void>;
}
