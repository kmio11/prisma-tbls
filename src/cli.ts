import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pkg from '@prisma/internals';
const { getDMMF } = pkg;
import { convertDMMFToTbls } from './converter/dmmf-converter.js';

const program = new Command();

program
  .name('prisma-tbls')
  .description('Convert Prisma schema to tbls JSON format')
  .version('0.0.1')
  .option('--schema <path>', 'Path to Prisma schema file')
  .option('--out <path>', 'Output path for tbls JSON file')
  .parse();

const options = program.opts();

if (!options.schema) {
  console.error('Error: --schema option is required');
  process.exit(1);
}

if (!options.out) {
  console.error('Error: --out option is required');
  process.exit(1);
}

async function main() {
  try {
    const schemaPath = resolve(options.schema);
    const outputPath = resolve(options.out);
    
    const schemaContent = readFileSync(schemaPath, 'utf8');
    const dmmf = await getDMMF({ datamodel: schemaContent });
    
    const tblsJson = convertDMMFToTbls(dmmf.datamodel);
    
    writeFileSync(outputPath, JSON.stringify(tblsJson, null, 2));
    
    console.log(`Successfully converted ${schemaPath} to ${outputPath}`);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();