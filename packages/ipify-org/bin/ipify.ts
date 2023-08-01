// public
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
// package-level
import * as ipifyClient from '../src';
import { IPFamily } from '@_/shared';

yargs(hideBin(process.argv))
  .command(
    'ipify',
    'ipify-org IP retriever command-line interface',
    (yargs) =>
      yargs.option('ip', {
        describe: 'IP address version',
        choices: [IPFamily.V4, IPFamily.V6],
        default: IPFamily.V4,
      }),
    async (argv) => {
      const retrieveIP = ipifyClient.create();
      const ipAddress = await retrieveIP(argv.ip);

      console.log(ipAddress);
    }
  )
  .parse();
