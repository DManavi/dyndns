// public
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
// project-level
import { IPFamily } from '@_/shared';
// package-level
import * as ipifyClient from '../src';

yargs(hideBin(process.argv))
  .env('DYNDNS_IPIFY')
  .command(
    ['get', '$0'],
    'ipify.org command-line interface (CLI)',
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
  .help().argv;
