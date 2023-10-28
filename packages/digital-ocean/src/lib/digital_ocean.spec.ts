import { digitalOcean } from './digital-ocean';

describe('digitalOcean', () => {
  it('should work', () => {
    expect(digitalOcean()).toEqual('digital-ocean');
  });
});
