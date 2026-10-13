import { isAddress, zeroAddress } from 'viem'

export function validAddress(value: string | undefined | null) {
  return value && isAddress(value, { strict: false }) && value.toLowerCase() !== zeroAddress
    ? value as `0x${string}` : null
}
export const DEFAULT_FID = process.env.NEXT_PUBLIC_FARCASTER_FID ?? '824669'
export const PROFILE_ADDRESS = validAddress(process.env.NEXT_PUBLIC_PROFILE_ADDRESS)
export const CONTRACT_ADDRESS = validAddress(process.env.NEXT_PUBLIC_PAYCHECK_CONTRACT)
export const OWNER_ADDRESS = validAddress(process.env.NEXT_PUBLIC_OWNER_ADDRESS)
