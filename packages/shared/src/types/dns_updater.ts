// package-level
import { DnsRecordType } from './shared';

export type DnsUpdaterOpts = {
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

export enum DnsUpdateResult {
  Done = 'done',
  NotRequired = 'not_required',
}

export type DnsUpdater = (opts: DnsUpdaterOpts) => Promise<DnsUpdateResult>;
