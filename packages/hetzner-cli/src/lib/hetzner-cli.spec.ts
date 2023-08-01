import { hetznerCli } from './hetzner-cli';

describe('hetznerCli', () => {
  it('should work', () => {
    expect(hetznerCli()).toEqual('hetzner-cli');
  });
});
