'use client';

import { useState } from 'react';
import { Trash2, Loader2, Tag } from 'lucide-react';
import { supabase } from '@/utils/supabaseClient';
import { Product } from '@/types';
import { BUSINESS } from '@/utils/data';
import PartThumb from './PartThumb';

interface AdminInventoryProps {
  products: Product[];
  onDeleted: (id: string) => void;
}

/** Public Storage URLs look like `.../storage/v1/object/public/spare-parts/<path>`. */
function storagePathFromPublicUrl(url: string | null): string | null {
  if (!url) return null;
  const marker = '/spare-parts/';
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

export default function AdminInventory({ products, onDeleted }: AdminInventoryProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleDelete = async (part: Product) => {
    if (!window.confirm(`Delete "${part.name}" from the inventory? This cannot be undone.`)) return;

    setError('');
    setDeletingId(part.id);
    try {
      const { error: deleteError } = await supabase.from('products').delete().eq('id', part.id);
      if (deleteError) throw new Error(deleteError.message);

      const storagePath = storagePathFromPublicUrl(part.image_url);
      if (storagePath) {
        // Best-effort: the DB row is already gone, so don't block on this —
        // an orphaned file is a minor cleanup issue, a failed delete isn't.
        const { error: storageError } = await supabase.storage.from('spare-parts').remove([storagePath]);
        if (storageError) console.error('[AdminInventory] failed to remove storage file:', storageError.message);
      }

      onDeleted(part.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete this part. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (products.length === 0) {
    return (
      <div className="border border-dashed border-[color:var(--color-divider)] py-16 text-center">
        <p className="text-sm font-semibold text-ink-700">No parts in inventory yet.</p>
        <p className="text-sm text-ink-500">Add your first part using the form above.</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <p className="mb-4 border-l-2 border-danger-500 bg-[color:color-mix(in_srgb,var(--color-danger-500)_8%,transparent)] p-3 text-xs font-medium text-danger-600">
          {error}
        </p>
      )}
      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {products.map((part) => (
          <div key={part.id} className="relative flex flex-col border border-[color:var(--color-divider)] bg-panel">
            <button
              onClick={() => handleDelete(part)}
              disabled={deletingId === part.id}
              className="absolute right-2 top-2 z-10 flex items-center gap-1.5 bg-danger-500 px-2.5 py-1.5 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-danger-600 disabled:opacity-60 cursor-pointer"
            >
              {deletingId === part.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Delete
            </button>

            <div className="aspect-[4/3] w-full overflow-hidden bg-ink-100">
              <PartThumb imageUrl={part.image_url} name={part.name} />
            </div>

            <div className="flex flex-1 flex-col p-4">
              <span className="text-[11px] uppercase tracking-wide text-accent">{part.origin}</span>
              <h3 className="mt-1 text-sm font-bold leading-snug text-ink-900">{part.name}</h3>
              <p className="mt-0.5 text-xs text-ink-600">
                {part.make} {part.model} · {part.year}
              </p>

              <span className={`tag mt-2 w-fit gap-1 ${part.condition === 'New' ? 'tag-accent' : 'tag-neutral'}`}>
                <Tag className="h-3 w-3" /> {part.condition}
              </span>

              <div className="mt-3 flex items-center justify-between text-sm">
                <div>
                  <span className="block text-[10px] uppercase tracking-wide text-ink-500">Retail</span>
                  <span className="font-bold">{BUSINESS.currency} {Number(part.retail_price).toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] uppercase tracking-wide text-ink-500">Floor</span>
                  <span className="font-bold text-accent">{BUSINESS.currency} {Number(part.floor_price).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
