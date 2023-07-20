// public
import * as z from 'zod';
// project-level
import { IPFamily } from '@_/shared';
// package-level
import { IPRetrieverServiceImpl } from './ip_retriever.service';

describe('IPRetrieverServiceImpl', () => {
  let service: IPRetrieverServiceImpl;

  beforeAll(() => {
    service = new IPRetrieverServiceImpl();
  });

  describe('success', () => {
    describe('IPv4', () => {
      it('should return IPv4 of the current environment', async () => {
        const ipv4 = await service.retrieveIP(IPFamily.V4);
        const ipv4Validator = z
          .string()
          .trim()
          .nonempty()
          .ip({ version: 'v4' });

        const parsedIPv4 = ipv4Validator.safeParse(ipv4);

        expect(typeof ipv4).toBe('string');
        expect(parsedIPv4.success).toBe(true);
      });
    });

    describe('IPv6', () => {
      it('should return IPv6 of the current environment', async () => {
        const ipv6 = await service.retrieveIP(IPFamily.V6);
        const ipv6Validator = z
          .string()
          .trim()
          .nonempty()
          .ip({ version: 'v6' });

        const parsedIPv6 = ipv6Validator.safeParse(ipv6);

        expect(typeof ipv6).toBe('string');
        expect(parsedIPv6.success).toBe(true);
      });
    });
  });

  describe('Failure', () => {
    it('should throw error if invalid IP family is passed', async () => {
      expect(() => service.retrieveIP('v10' as any)).rejects.toThrow();
    });
  });
});
