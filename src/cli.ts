import { Command } from 'commander'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { convertPrismaToTbls } from './index.js'

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
    try {
      const inputPath = resolve(input)
      const outputPath = resolve(options.output)

      if (options.verbose) {
        console.log(`Reading Prisma schema from: ${inputPath}`)
      }

      const prismaSchema = await readFile(inputPath, 'utf-8')
      const tblsJson = await convertPrismaToTbls(prismaSchema)

      const jsonOutput = options.pretty
        ? JSON.stringify(tblsJson, null, 2)
        : JSON.stringify(tblsJson)

      await writeFile(outputPath, jsonOutput, 'utf-8')

      if (options.verbose) {
        console.log(`tbls JSON written to: ${outputPath}`)
      } else {
        console.log(`✓ Converted ${input} to ${options.output}`)
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

program.parse()