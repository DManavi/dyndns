import { dnsUpdateCli } from './dns-update-cli';

describe('dnsUpdateCli', () => {
  it('should work', () => {
    expect(dnsUpdateCli()).toEqual('dns-update-cli');
  });
});
