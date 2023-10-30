// public
import * as z from 'zod';
import { ApplicationError, BadRequestError } from 'error-lib';
// package-level
import { IPFamily } from '../types';
import { HTTPResponse, IPifyAdapter } from './adapter-ipify';
import { IPRetriever } from './ip-retriever';

const urlSchema = z.string().nonempty().url();
const ipV4Schema = z.string().nonempty().ip(IPFamily.V4);
const ipV6Schema = z.string().nonempty().ip(IPFamily.V6);

describe('adapter-ipify', () => {
  let retrieveIP: IPRetriever;

  beforeEach(() => {
    retrieveIP = new IPifyAdapter();
  });

  describe('ensureIPFamilyIsCorrect', () => {
    it('throw error if IP family is unknown', () => {
      const fn = (retrieveIP as any).ensureIPFamilyIsCorrect;

      [undefined, null, 'v32', '', 'invalid', 1, -1, {}, Math.max].forEach(
        (_) => expect(() => fn()).toThrow(BadRequestError)
      );
    });

    it('returns undefined if the IP family is correct', () => {
      const fn = (retrieveIP as any).ensureIPFamilyIsCorrect;

      Object.values(IPFamily).forEach((_) => expect(fn(_)).toBeUndefined());
    });
  });

  describe('getBaseURL', () => {
    it('throw error if IP family is unknown', () => {
      const fn = (retrieveIP as any).getBaseURL;

      [undefined, null, 'v32', '', 'invalid', 1, -1, {}, Math.max].forEach(
        (_) => expect(() => fn(_)).toThrow(BadRequestError)
      );
    });

    it('returns base URL if the IP family is correct', () => {
      const fn = (retrieveIP as any).getBaseURL;

      Object.values(IPFamily).forEach((_) => {
        const httpEndpoint = fn(_);

        expect(typeof httpEndpoint).toBe('string');
        expect(httpEndpoint.length).toBeGreaterThan(0);

        const parseResult = urlSchema.safeParse(httpEndpoint);

        expect(parseResult.success).toBe(true);
        expect((parseResult as any).data).toBe(httpEndpoint);
      });
    });
  });

  describe('createHTTPClient', () => {
    it('always creates an instance of axios', () => {
      const baseURL = 'http://base-url.local';

      const fn = (retrieveIP as any).createHTTPClient;
      const httpClient = fn(baseURL);

      expect(httpClient.defaults.baseURL).toBe(baseURL);
    });
  });

  describe('ensureHTTPRequestWasSuccessful', () => {
    it('returns body.ip if status code is 200', () => {
      const response: Partial<HTTPResponse> = {
        status: 200,
        data: '1.1.1.1',
      };

      const fn = (retrieveIP as any).ensureHTTPRequestWasSuccessful;
      expect(fn(response)).toBeUndefined();
    });

    it('throws error if status is anything other than HTTP_OK (200)', () => {
      const response: Partial<HTTPResponse> = {
        status: 404,
        statusText: 'NOT_FOUND',
        data: { error: 'Page not found' } as any,
      };

      const fn = (retrieveIP as any).ensureHTTPRequestWasSuccessful;
      expect(() => fn(response)).toThrow(ApplicationError);
    });
  });

  describe('retrieve', () => {
    it('returns IP v4 of the current machine', async () => {
      const ipAddress = await retrieveIP.retrieve(IPFamily.V4);
      const parseResult = ipV4Schema.safeParse(ipAddress);

      expect(parseResult.success).toBe(true);
      expect((parseResult as any).data).toBe(ipAddress);
    });

    it('returns IP v6 of the current machine', async () => {
      const ipV6 = await retrieveIP.retrieve(IPFamily.V6);
      const parseResult = ipV6Schema.safeParse(ipV6);

      expect(parseResult.success).toBe(true);
      expect((parseResult as any).data).toBe(ipV6);
    });
  });
});
