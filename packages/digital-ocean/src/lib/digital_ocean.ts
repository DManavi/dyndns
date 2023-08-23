import { DnsUpdater, DnsUpdateResult } from '@_/shared';

export type DigitalOceanDnsUpdaterOpts = {
  /**
   * Digital ocean API key
   */
  apiKey: string;
};



export const create = (opts?: DigitalOceanDnsUpdaterOpts): DnsUpdater => {
  // validate options

  return async (opts) => {


    
  };
};
