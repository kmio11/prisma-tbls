import { generatorHandler } from '@prisma/generator-helper'
import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createRequire } from 'node:module'
import { convertDMMFToTbls } from './converter/dmmf-converter.js'

const require = createRequire(import.meta.url)
const { version } = require('../package.json')

/**
 * Prisma generator for tbls JSON output
 * This follows the prisma-markdown reference implementation pattern
 */
generatorHandler({
  onManifest: () => ({
    version,
    defaultOutput: './schema.json',
    prettyName: 'prisma-tbls',
  }),

  onGenerate: async options => {
    // Convert DMMF to tbls format
    const tblsSchema = convertDMMFToTbls(options.dmmf.datamodel)

    // Get output file path
    const outputPath = options.generator.output?.value ?? './schema.json'

    // Write JSON output
    const jsonContent = JSON.stringify(tblsSchema, null, 2)
    await writeFile(resolve(outputPath), jsonContent, 'utf-8')

    console.log(`✓ Generated tbls JSON: ${outputPath}`)
  },
})
