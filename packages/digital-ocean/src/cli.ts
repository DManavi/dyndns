#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { IPRetrieverServiceImpl } from '@_/ipify-org';
import { DigitalOceanDnsUpdaterService } from './dns_updater.service';

yargs(hideBin(process.argv))
  .command(
    'do-dns',
    'Digital Ocean dynamic DNS client',
    (yargs) =>
      yargs
        .option('key', {
          alias: 'k',
          describe: 'Digital Ocean API key',
          string: true,
        })
        .option('domain', {
          alias: 'd',
          describe: 'Root domain e.g. example.com',
          string: true,
        })
        .option('subdomain', {
          alias: 's',
          describe: 'Subdomain you want to update',
          string: true,
        })
        .option('ip', {
          describe: 'IP address version',
          choices: ['v4', 'v6'],
          default: 'v4',
        })
        .demandOption(['key', 'domain', 'subdomain']),
    async (argv) => {

      const ipRetriever = new IPRetrieverServiceImpl();
      const dnsUpdater = new DigitalOceanDnsUpdaterService();

      const ipAddress = argv.ip === 'v4' ? await ipRetriever.retrieveIPv4() : await ipRetriever.retrieveIPv6();

      switch (argv.ip) {
        case 'v4': {
          const currentIP = await ipRetriever.retrieveIPv4();

          break;
        }

        case 'v6': {
          const currentIP = await ipRetriever.retrieveIPv6();

          break;
        }
      }
    }
  )
  .parse();
