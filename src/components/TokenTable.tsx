import { humanAge, shortAddress, sol, usd } from '../lib/format';
import type { VerifiedToken } from '../lib/types';

type TokenTableProps = {
  tokens: VerifiedToken[];
  buyAmounts: Record<string, string>;
  onBuyAmountChange: (mint: string, amount: string) => void;
  onBuy: (token: VerifiedToken) => void;
  canBuy: boolean;
  busyMint: string | null;
};

export const TokenTable = ({
  tokens,
  buyAmounts,
  onBuyAmountChange,
  onBuy,
  canBuy,
  busyMint,
}: TokenTableProps): JSX.Element => (
  <div className="overflow-x-auto rounded-xl border border-slate-700">
    <table className="min-w-full bg-slate-900 text-sm text-slate-100">
      <thead className="bg-slate-800 text-xs uppercase text-slate-300">
        <tr>
          <th className="p-3 text-left">Token</th>
          <th className="p-3 text-left">Mint</th>
          <th className="p-3 text-left">Holders</th>
          <th className="p-3 text-left">Age</th>
          <th className="p-3 text-left">Volume 24h</th>
          <th className="p-3 text-left">Fees</th>
          <th className="p-3 text-left">Ratio</th>
          <th className="p-3 text-left">GMGN</th>
          <th className="p-3 text-left">Buy</th>
        </tr>
      </thead>
      <tbody>
        {tokens.map((token) => (
          <tr key={token.mint} className="border-t border-slate-800">
            <td className="p-3">{token.name} ({token.symbol})</td>
            <td className="p-3">
              <button
                onClick={() => navigator.clipboard.writeText(token.mint)}
                className="rounded bg-slate-800 px-2 py-1 text-xs"
              >
                {shortAddress(token.mint)} copy
              </button>
            </td>
            <td className="p-3">{token.holders.toLocaleString()}</td>
            <td className="p-3">{humanAge(token.ageSeconds)}</td>
            <td className="p-3">{usd(token.volume24hUsd)}</td>
            <td className="p-3">{sol(token.feesTotalSol)} / {usd(token.feesUsd)}</td>
            <td className="p-3">{token.ratio.toFixed(2)}</td>
            <td className="p-3">
              <a className="text-cyan-300 underline" href={token.gmgnUrl} target="_blank" rel="noreferrer">
                Open
              </a>
            </td>
            <td className="p-3">
              <div className="flex items-center gap-2">
                <input
                  min={0.01}
                  step={0.01}
                  type="number"
                  value={buyAmounts[token.mint] ?? '0.01'}
                  onChange={(e) => onBuyAmountChange(token.mint, e.target.value)}
                  className="w-24 rounded border border-slate-600 bg-slate-800 p-1"
                />
                <button
                  className="rounded bg-emerald-700 px-3 py-1 disabled:cursor-not-allowed disabled:bg-slate-700"
                  disabled={!canBuy || busyMint === token.mint}
                  onClick={() => onBuy(token)}
                >
                  {busyMint === token.mint ? 'Buying...' : 'Buy'}
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
