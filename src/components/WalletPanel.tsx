import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Keypair, PublicKey } from '@solana/web3.js';
import { shortAddress } from '../lib/format';

type WalletPanelProps = {
  publicKey: PublicKey | null;
  importedKeypair: Keypair | null;
  balanceSol: number | null;
  onOpenImport: () => void;
  onForget: () => void;
  onRefreshBalance: () => void;
  rpcWarning: boolean;
};

export const WalletPanel = ({
  publicKey,
  importedKeypair,
  balanceSol,
  onOpenImport,
  onForget,
  onRefreshBalance,
  rpcWarning,
}: WalletPanelProps): JSX.Element => (
  <section className="space-y-3 rounded-xl border border-slate-700 bg-slate-900 p-4">
    <div className="flex flex-wrap gap-2">
      <WalletMultiButton className="!bg-cyan-700 hover:!bg-cyan-600" />
      <button className="rounded bg-amber-700 px-3 py-2 text-sm font-semibold" onClick={onOpenImport}>
        Import Private Key (Advanced)
      </button>
      <button className="rounded bg-slate-700 px-3 py-2 text-sm" onClick={onRefreshBalance}>
        Refresh Balance
      </button>
      {importedKeypair ? (
        <button className="rounded bg-red-700 px-3 py-2 text-sm" onClick={onForget}>
          Forget Key
        </button>
      ) : null}
    </div>
    <p className="text-sm text-slate-200">Address: {publicKey ? shortAddress(publicKey.toBase58()) : 'Not connected'}</p>
    <p className="text-sm text-slate-200">SOL balance: {balanceSol !== null ? balanceSol.toFixed(4) : '--'}</p>
    {rpcWarning ? <p className="text-xs text-amber-300">Using fallback public RPC. Set VITE_SOLANA_RPC_URL for production reliability.</p> : null}
    {importedKeypair ? <p className="text-xs text-red-300">Advanced key mode active in memory only.</p> : null}
  </section>
);
