import { vultr } from './vultr';

describe('vultr', () => {
  it('should work', () => {
    expect(vultr()).toEqual('vultr');
  });
});
