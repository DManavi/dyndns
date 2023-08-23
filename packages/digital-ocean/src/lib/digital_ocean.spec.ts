import { digitalOcean } from './digital_ocean';

describe('digitalOcean', () => {
  it('should work', () => {
    expect(digitalOcean()).toEqual('digital-ocean');
  });
});
