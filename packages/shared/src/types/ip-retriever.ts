// package-level
import { IPFamily } from './shared';

export interface IPRetriever {
  /**
   * Retrieve public IP address of the requested family
   * @param {IPFamily} family IP address family
   */
  retrieve(family: IPFamily): Promise<string>;
}
