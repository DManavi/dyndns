import { ipRetrieverCli } from './ip-retriever-cli';
describe('ipRetrieverCli', () => {
  it('should work', () => {
    expect(ipRetrieverCli()).toEqual('ip-retriever-cli');
  });
});
