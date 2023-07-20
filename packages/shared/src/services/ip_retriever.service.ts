export enum IPFamily {
  V4 = 'v4',
  V6 = 'v6',
}

export interface IPRetrieverService {
  /**
   * Retrieve requested IP address family
   * @param {IPFamily} family IP address family
   */
  retrieveIP(family: IPFamily): Promise<string>;
}
