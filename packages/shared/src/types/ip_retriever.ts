// package-level
import { IPFamily } from './shared';

/**
 * Retrieve public IP address of the requested family
 * @param {IPFamily} family IP address family
 */
export type IPRetriever = (family: IPFamily) => Promise<string>;
