import fs from 'node:fs'
import solc from 'solc'
const source = fs.readFileSync('contracts/Paycheck.sol', 'utf8')
const output = JSON.parse(solc.compile(JSON.stringify({ language: 'Solidity', sources: { 'Paycheck.sol': { content: source } }, settings: { optimizer: { enabled: true, runs: 200 }, evmVersion: 'paris', outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } } } })))
const errors = output.errors?.filter(e => e.severity === 'error') ?? []
if (errors.length) throw new Error(errors.map(e => e.formattedMessage).join('\n'))
const contract = output.contracts['Paycheck.sol'].Paycheck
fs.writeFileSync('lib/deployment.ts', `// Generated from contracts/Paycheck.sol by npm run contract:compile.\nexport const PAYCHECK_BYTECODE = '0x${contract.evm.bytecode.object}' as const\n`)
console.log('Paycheck compiled successfully')
