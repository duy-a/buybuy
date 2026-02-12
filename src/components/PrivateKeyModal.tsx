import { useState } from 'react';

type PrivateKeyModalProps = {
  open: boolean;
  onClose: () => void;
  onImport: (secret: string) => void;
};

export const PrivateKeyModal = ({ open, onClose, onImport }: PrivateKeyModalProps): JSX.Element | null => {
  const [secret, setSecret] = useState('');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-xl rounded-lg border border-red-700 bg-slate-900 p-6">
        <h2 className="text-lg font-semibold text-red-300">Advanced / risky: Import Private Key</h2>
        <p className="mt-2 text-sm text-slate-300">
          Never share this key. It is kept only in memory for this tab session and is never persisted.
        </p>
        <textarea
          className="mt-3 h-36 w-full rounded border border-slate-700 bg-slate-800 text-sm text-slate-100"
          placeholder="Base58 secret key or JSON array"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button className="rounded bg-slate-700 px-3 py-2" onClick={onClose}>
            Cancel
          </button>
          <button
            className="rounded bg-red-600 px-3 py-2 font-semibold"
            onClick={() => {
              onImport(secret);
              setSecret('');
            }}
          >
            Import Key
          </button>
        </div>
      </div>
    </div>
  );
};
