#!/usr/bin/env node

/**
 * Auto-increment version script
 * Increments the minor version in package.json and updates .env files
 */

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

// Read package.json
const packagePath = join(rootDir, 'package.json')
const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'))

// Parse current version
const [major, minor, patch] = packageJson.version.split('.').map(Number)

// Increment minor version
const newVersion = `${major}.${minor}.${patch + 1}`

// Update package.json
packageJson.version = newVersion
writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n')

console.log(`✅ Version bumped: ${major}.${minor}.${patch} → ${newVersion}`)

// Update .env files
const envFiles = ['.env.development', '.env.server', '.env.example']

envFiles.forEach((envFile) => {
  const envPath = join(rootDir, envFile)
  try {
    let content = readFileSync(envPath, 'utf-8')
    content = content.replace(/VITE_APP_VERSION=.*/g, `VITE_APP_VERSION=${newVersion}`)
    writeFileSync(envPath, content)
    console.log(`✅ Updated ${envFile}`)
  } catch (err) {
    console.log(`⚠️  Skipped ${envFile} (not found)`)
  }
})
