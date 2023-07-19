export interface IPRetrieverService {
  /**
   * Retrieve IPv4
   */
  retrieveIPv4(): Promise<string>;

  /**
   * Retrieve IPv6
   */
  retrieveIPv6(): Promise<string>;
}
