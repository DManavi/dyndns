export interface DnsUpdater {
  /**
   * Update v4 record (A)
   * @param {string} subdomain Target subdomain
   * @param {Array<string>} addresses Addresses to set
   */
  updateRecordV4(subdomain: string, addresses: Array<string>): Promise<void>;

  /**
   * Update v6 record (AAAA)
   * @param subdomain Target subdomain
   * @param addresses Addresses to set
   */
  updateRecordV6(subdomain: string, addresses: Array<string>): Promise<void>;
}
