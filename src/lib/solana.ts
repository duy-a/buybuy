import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';

export const FALLBACK_RPC = 'https://api.mainnet-beta.solana.com';

export const getRpcUrl = (): string => import.meta.env.VITE_SOLANA_RPC_URL || FALLBACK_RPC;

export const getConnection = (): Connection => new Connection(getRpcUrl(), 'confirmed');

export const parseSecretKey = (value: string): Keypair => {
  const trimmed = value.trim();
  try {
    if (trimmed.startsWith('[')) {
      const numbers = JSON.parse(trimmed) as number[];
      return Keypair.fromSecretKey(Uint8Array.from(numbers));
    }
    return Keypair.fromSecretKey(bs58.decode(trimmed));
  } catch {
    throw new Error('Unable to parse private key. Use base58 string or JSON array format.');
  }
};

export const publicKeyFromString = (key: string): PublicKey => new PublicKey(key);
