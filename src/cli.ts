import { Command } from 'commander'

const program = new Command()

program
  .name('prisma-tbls')
  .description('Convert Prisma schema to tbls JSON format for database documentation')
  .version('0.0.1')

program
  .argument('<input>', 'Path to Prisma schema file')
  .option('-o, --output <path>', 'Output file path for tbls JSON', 'schema.json')
  .option('-p, --pretty', 'Pretty print JSON output', false)
  .option('-v, --verbose', 'Verbose logging', false)
  .action(async (input: string, options: { output: string; pretty: boolean; verbose: boolean }) => {
    console.error('Standalone CLI mode requires integration with Prisma workflow.')
    console.error('Please use the generator mode instead:')
    console.error('')
    console.error('1. Add to your schema.prisma:')
    console.error('   generator tbls {')
    console.error('     provider = "prisma-tbls-generator"')
    console.error('     output   = "./schema.json"')
    console.error('   }')
    console.error('')
    console.error('2. Run: npx prisma generate')
    process.exit(1)
  })

program.parse()