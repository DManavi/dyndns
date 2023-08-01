// package-level
import { IPFamily } from './shared';

export interface IPRetrieverService {
  /**
   * Retrieve public IP address of the requested family
   * @param {IPFamily} family IP address family
   */
  retrieveIP(family: IPFamily): Promise<string>;
}
