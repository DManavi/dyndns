import { IPFamily } from './shared';

export interface IPRetrieverService {
  /**
   * Retrieve requested IP address family
   * @param {IPFamily} family IP address family
   */
  retrieveIP(family: IPFamily): Promise<string>;
}
