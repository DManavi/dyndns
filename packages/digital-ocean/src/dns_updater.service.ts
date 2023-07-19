import { DnsUpdater } from '@_/shared';

export class DigitalOceanDnsUpdaterService implements DnsUpdater {
  async updateRecordV4(subdomain: string, addresses: string[]): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async updateRecordV6(subdomain: string, addresses: string[]): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
