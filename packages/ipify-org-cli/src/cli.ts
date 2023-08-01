#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { IpifyOrgIPRetrieverService, IPFamily } from '@_/shared';

yargs(hideBin(process.argv))
  .command(
    'ipify-cli',
    'ipify-org command-line interface',
    (yargs) =>
      yargs.option('ip', {
        describe: 'IP address version',
        choices: [IPFamily.V4, IPFamily.V6],
        default: IPFamily.V4,
      }),
    async (argv) => {
      const ipRetriever = new IpifyOrgIPRetrieverService();
      const ipAddress = await ipRetriever.retrieveIP(argv.ip);

      console.log(ipAddress);
    }
  )
  .parse();
