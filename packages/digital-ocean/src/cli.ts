// public
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
// project-level
import { DnsRecordType, IPFamily } from '#lib/types';
import { DigitalOceanAdapter } from '#lib/dns-provider';
import { ApplicationError } from 'error-lib';

yargs(hideBin(process.argv))
  .scriptName('dyndns-do')
  .epilog('for more information visit https://github.com/dmanavi/dyndns')
  .option('h', { alias: 'help' })
  .env('DYNDNS_DO')
  .command(
    ['set'],
    'Set create/update DNS record',
    (yargs) =>
      yargs
        .option('domain', {
          alias: 'd',
          description: 'Domain name (e.g. example.com)',
          demandOption: true,
          string: true,
        })
        .option('subdomain', {
          alias: 's',
          description: 'Subdomain that you want to bind the IP to',
          string: true,
        })
        .option('ip-address', {
          alias: 'a',
          demandOption: true,
          string: true,
        })
        .option('ttl', {
          alias: 't',
          description: 'TTL (in seconds)',
          default: 300,
          number: true,
        })
        .option('ip-version', {
          describe: 'IP address family/version',
          choices: [IPFamily.V4, IPFamily.V6],
          default: IPFamily.V4,
          string: true,
        })
        .option('api-key', {
          alias: 'k',
          description:
            'DO API key (https://cloud.digitalocean.com/account/api/tokens)',
          demandOption: true,
          string: true,
        })
        .option('force-update', {
          alias: 'f',
          description: 'Forcefully update DNS record',
          boolean: true,
          default: false,
        })
        .option('create', {
          alias: 'c',
          description: "Create if record doesn't exist",
          boolean: true,
          default: true,
        }),
    ({
      apiKey,
      domain: domainName,
      subdomain,
      ipVersion,
      ipAddress,
      ttl,
      create: createIfNotExists,
      forceUpdate,
    }) => {
      const dnsProvider = new DigitalOceanAdapter({ apiKey });

      let recordType;
      switch (ipVersion) {
        case IPFamily.V4: {
          recordType = DnsRecordType.A;
          break;
        }
        case IPFamily.V6: {
          recordType = DnsRecordType.AAAA;
          break;
        }
        default: {
          throw new ApplicationError(
            `IP version '${ipVersion}' has no corresponding DNS record type.`
          );
        }
      }

      // update DNS record
      dnsProvider
        .updateRecord({
          domainName,
          subdomain,
          recordType,
          data: ipAddress,
          ttl,

          createIfNotExists,
          forceUpdate,
        })
        .catch((err) => {
          console.error('DYNDNS: Failed to create/update DNS record');
          console.error(`Digital Ocean: `, err.message);

          process.exit(1);
        });
    }
  )
  .demandCommand(1, '')
  .help()
  .strict()
  .completion()
  .parse();
