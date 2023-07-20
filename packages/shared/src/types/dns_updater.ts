import { DnsRecordType } from './shared';

export interface DnsUpdater {
  /**
   * Update DNS record
   * @param {string} subdomain Target subdomain
   * @param {DnsRecordType} recordType DNS record type
   * @param {Array<string>} addresses Addresses to set
   */

  updateRecord(
    subdomain: string,
    recordType: DnsRecordType,
    addresses: Array<string>
  ): Promise<void>;
}
