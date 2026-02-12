import { useEffect, useMemo, useState } from 'react';
import { Keypair, LAMPORTS_PER_SOL, VersionedTransaction } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PrivateKeyModal } from './components/PrivateKeyModal';
import { TimerBadge } from './components/TimerBadge';
import { TokenTable } from './components/TokenTable';
import { WalletPanel } from './components/WalletPanel';
import { useCountdown } from './hooks/useCountdown';
import { useInterval } from './hooks/useInterval';
import { useVisibility } from './hooks/useVisibility';
import { verifyTokens } from './lib/filters';
import { parseSecretKey } from './lib/solana';
import type { RawToken, ScannerResponse, VerifiedToken } from './lib/types';

const REFRESH_SECONDS = 30;
const FALLBACK_WARNING = !import.meta.env.VITE_SOLANA_RPC_URL;
const CLUSTER = import.meta.env.VITE_SOLANA_CLUSTER || 'mainnet-beta';

type JupiterSwapPayload = {
  swapTransaction: string;
};

const decodeBase64 = (input: string): Uint8Array => Uint8Array.from(atob(input), (c) => c.charCodeAt(0));

function App(): JSX.Element {
  const { publicKey: adapterPublicKey, connected, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const visible = useVisibility();
  const [countdown, resetCountdown] = useCountdown(REFRESH_SECONDS, visible);
  const [rawTokens, setRawTokens] = useState<RawToken[]>([]);
  const [solUsd, setSolUsd] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importedKeypair, setImportedKeypair] = useState<Keypair | null>(null);
  const [balanceSol, setBalanceSol] = useState<number | null>(null);
  const [buyAmounts, setBuyAmounts] = useState<Record<string, string>>({});
  const [busyMint, setBusyMint] = useState<string | null>(null);
  const [slippageBps, setSlippageBps] = useState(100);
  const [banner, setBanner] = useState<string | null>(null);

  const effectivePublicKey = importedKeypair?.publicKey ?? adapterPublicKey;
  const verifiedTokens: VerifiedToken[] = useMemo(() => verifyTokens(rawTokens, solUsd), [rawTokens, solUsd]);

  const fetchScanner = async (): Promise<void> => {
    try {
      const [gmgnRes, priceRes] = await Promise.all([
        fetch('/.netlify/functions/gmgn_migrated'),
        fetch('/.netlify/functions/sol_price'),
      ]);
      if (!gmgnRes.ok || !priceRes.ok) throw new Error('Unable to refresh scanner now.');
      const gmgnData = (await gmgnRes.json()) as ScannerResponse;
      const priceData = (await priceRes.json()) as { solUsd: number };
      setRawTokens(gmgnData.tokens);
      setSolUsd(priceData.solUsd);
      setLastUpdated(new Date().toLocaleTimeString());
      setScannerError(null);
    } catch (error) {
      setScannerError((error as Error).message);
      setBanner('Data temporarily unavailable. Showing last successful results.');
    }
  };

  const refreshBalance = async (): Promise<void> => {
    if (!effectivePublicKey) {
      setBalanceSol(null);
      return;
    }
    try {
      const lamports = await connection.getBalance(effectivePublicKey);
      setBalanceSol(lamports / LAMPORTS_PER_SOL);
    } catch {
      setBanner('Unable to fetch SOL balance right now.');
    }
  };

  const performBuy = async (token: VerifiedToken): Promise<void> => {
    if (!effectivePublicKey) return;
    const amount = Number(buyAmounts[token.mint] ?? '0.01');
    if (Number.isNaN(amount) || amount < 0.01) {
      setBanner('Buy amount must be at least 0.01 SOL.');
      return;
    }

    setBusyMint(token.mint);
    try {
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
      const quoteRes = await fetch(`/.netlify/functions/jupiter_quote?outputMint=${token.mint}&amount=${lamports}&slippageBps=${slippageBps}`);
      if (!quoteRes.ok) throw new Error('Quote unavailable');
      const quoteJson = await quoteRes.json();

      const swapRes = await fetch('/.netlify/functions/jupiter_swap', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ quoteResponse: quoteJson, userPublicKey: effectivePublicKey.toBase58() }),
      });
      if (!swapRes.ok) throw new Error('Swap transaction unavailable');
      const swapPayload = (await swapRes.json()) as JupiterSwapPayload;
      const tx = VersionedTransaction.deserialize(decodeBase64(swapPayload.swapTransaction));
      let signature: string;

      if (importedKeypair) {
        tx.sign([importedKeypair]);
        signature = await connection.sendRawTransaction(tx.serialize());
      } else {
        if (!connected) throw new Error('Wallet not connected');
        signature = await sendTransaction(tx, connection);
      }

      setBanner(`Swap sent: https://solscan.io/tx/${signature}?cluster=${CLUSTER}`);
    } catch (error) {
      setBanner((error as Error).message);
    } finally {
      setBusyMint(null);
    }
  };

  useEffect(() => {
    void fetchScanner();
    void refreshBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!visible) return;
    if (countdown === 0) {
      void fetchScanner();
      resetCountdown();
    }
  }, [countdown, resetCountdown, visible]);

  useInterval(() => {
    if (effectivePublicKey) void refreshBalance();
  }, effectivePublicKey ? 12000 : null);

  const handleImport = (secret: string): void => {
    try {
      const kp = parseSecretKey(secret);
      setImportedKeypair(kp);
      setImportOpen(false);
      setBanner('Private key imported into memory for this tab only.');
    } catch (error) {
      setBanner((error as Error).message);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-7xl space-y-5 p-6 text-slate-100">
      <h1 className="text-2xl font-bold">BuyBuy: Pump.fun Migrated Scanner + Jupiter Buy</h1>
      {banner ? <div className="rounded border border-amber-500 bg-amber-950/70 p-3 text-sm">{banner}</div> : null}
      {scannerError ? <div className="rounded border border-red-500 bg-red-950/70 p-3 text-sm">Data temporarily unavailable.</div> : null}

      <WalletPanel
        publicKey={effectivePublicKey ?? null}
        importedKeypair={importedKeypair}
        balanceSol={balanceSol}
        onOpenImport={() => setImportOpen(true)}
        onForget={() => setImportedKeypair(null)}
        onRefreshBalance={() => void refreshBalance()}
        rpcWarning={FALLBACK_WARNING}
      />

      <div className="flex items-center justify-between gap-3">
        <TimerBadge countdown={countdown} lastUpdated={lastUpdated} />
        <div className="flex items-center gap-2">
          <label className="text-sm">Slippage (bps)</label>
          <input
            type="number"
            min={10}
            max={1000}
            value={slippageBps}
            onChange={(e) => setSlippageBps(Number(e.target.value))}
            className="w-24 rounded border border-slate-700 bg-slate-900"
          />
          <button
            className="rounded bg-cyan-700 px-3 py-2 text-sm font-semibold"
            onClick={() => {
              void fetchScanner();
              resetCountdown();
            }}
          >
            Refresh Now
          </button>
        </div>
      </div>

      <TokenTable
        tokens={verifiedTokens}
        buyAmounts={buyAmounts}
        onBuyAmountChange={(mint, amount) => setBuyAmounts((old) => ({ ...old, [mint]: amount }))}
        onBuy={(token) => void performBuy(token)}
        canBuy={Boolean(effectivePublicKey)}
        busyMint={busyMint}
      />

      <PrivateKeyModal open={importOpen} onClose={() => setImportOpen(false)} onImport={handleImport} />
    </main>
  );
}

export default App;
