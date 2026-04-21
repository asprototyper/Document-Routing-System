#!/usr/bin/env node
// Generate a bcrypt hash for your app PIN.
//
// Usage:
//   node scripts/hash-pin.mjs 1234
//   node scripts/hash-pin.mjs            (prompts interactively)
//
// Paste the printed hash into Vercel env as PIN_HASH (server-side, NOT VITE_*).

import bcrypt from 'bcryptjs'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

const ROUNDS = 12

async function prompt() {
  const rl = createInterface({ input, output })
  try {
    const pin = (await rl.question('Enter PIN (4-8 digits): ')).trim()
    return pin
  } finally {
    rl.close()
  }
}

const arg = process.argv[2]
const pin = arg ?? (await prompt())

if (!/^\d{4,8}$/.test(pin)) {
  console.error('PIN must be 4-8 digits.')
  process.exit(1)
}

const hash = await bcrypt.hash(pin, ROUNDS)
console.log('\nPIN_HASH=' + hash + '\n')
console.log('Add this line to your Vercel project env vars (server-side).')
