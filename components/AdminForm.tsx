'use client';

import { useState } from 'react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { Upload, PlusCircle, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/utils/supabaseClient';
import { Origin, Condition, Product } from '@/types';

interface AdminFormProps {
  onAdded: (product: Product) => void;
}

const initialForm = {
  name: '',
  make: '',
  model: '',
  year: '',
  origin: 'Japanese' as Origin,
  condition: 'New' as Condition,
  retailPrice: '',
  floorPrice: '',
};

const inputCls =
  'w-full rounded-lg border border-ink-700 bg-ink-800 px-3 py-2.5 text-sm text-white placeholder:text-ink-500 outline-none focus:border-gold-500/60';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-ink-400">
        {label}
      </span>
      {children}
    </label>
  );
}

export default function AdminForm({ onAdded }: AdminFormProps) {
  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set =
    (key: keyof typeof initialForm) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
    };

  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('Please choose a .jpg, .png or .webp image.');
      e.target.value = '';
      return;
    }

    setError('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const retailPrice = Number(form.retailPrice);
    const floorPrice = Number(form.floorPrice);

    if (!form.name || !form.make || !form.model || !form.year) {
      setError('Please fill in title, make, model and year.');
      return;
    }
    if (!retailPrice || !floorPrice) {
      setError('Retail price and floor price must both be greater than zero.');
      return;
    }
    if (floorPrice > retailPrice) {
      setError('Floor price cannot be higher than the retail price.');
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl: string | null = null;

      if (imageFile) {
        const path = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
        const { error: uploadError } = await supabase.storage
          .from('spare-parts')
          .upload(path, imageFile, { upsert: false });

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage.from('spare-parts').getPublicUrl(path);
        imageUrl = publicUrlData.publicUrl;
      }

      const { data, error: insertError } = await supabase
        .from('products')
        .insert({
          name: form.name,
          make: form.make,
          model: form.model,
          year: Number(form.year),
          origin: form.origin,
          condition: form.condition,
          retail_price: retailPrice,
          floor_price: floorPrice,
          image_url: imageUrl,
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      onAdded(data as Product);
      setForm(initialForm);
      setImageFile(null);
      setImagePreview('');
      e.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add this part. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 rounded-xl border border-gold-500/30 bg-ink-900 p-5 sm:p-6"
    >
      <div className="mb-4 flex items-center gap-2 text-gold-400">
        <PlusCircle className="h-5 w-5" />
        <h3 className="font-display text-lg font-extrabold uppercase tracking-wide">Add New Part</h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Title">
          <input
            value={form.name}
            onChange={set('name')}
            placeholder="e.g. Toyota Corolla Headlight"
            className={inputCls}
            required
          />
        </Field>
        <Field label="Make">
          <input value={form.make} onChange={set('make')} placeholder="e.g. Toyota" className={inputCls} required />
        </Field>
        <Field label="Model">
          <input value={form.model} onChange={set('model')} placeholder="e.g. Corolla" className={inputCls} required />
        </Field>
        <Field label="Year">
          <input
            type="number"
            value={form.year}
            onChange={set('year')}
            placeholder="e.g. 2018"
            className={inputCls}
            required
          />
        </Field>
        <Field label="Vehicle Origin">
          <select value={form.origin} onChange={set('origin')} className={inputCls}>
            <option value="Japanese">Japanese</option>
            <option value="Korean">Korean</option>
          </select>
        </Field>
        <Field label="Condition">
          <select value={form.condition} onChange={set('condition')} className={inputCls}>
            <option value="New">New</option>
            <option value="Used">Used</option>
          </select>
        </Field>
        <Field label="Part Image">
          <label className="flex h-[42px] cursor-pointer items-center gap-2 rounded-lg border border-ink-700 bg-ink-800 px-3 text-sm text-ink-300 hover:border-gold-500/50">
            <Upload className="h-4 w-4 shrink-0" />
            <span className="truncate">{imageFile ? imageFile.name : 'Choose image…'}</span>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={handleFile}
              className="hidden"
            />
          </label>
        </Field>
        <div />
        <Field label="Public Retail Price (GH₵)">
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.retailPrice}
            onChange={set('retailPrice')}
            placeholder="e.g. 250"
            className={inputCls}
            required
          />
        </Field>
        <Field label="Minimum Floor Price (GH₵)">
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.floorPrice}
            onChange={set('floorPrice')}
            placeholder="e.g. 200"
            className={inputCls}
            required
          />
        </Field>
      </div>

      {imagePreview && (
        <div className="mt-4 flex items-center gap-3">
          <img src={imagePreview} alt="Preview" className="h-16 w-16 rounded-lg object-cover ring-1 ring-ink-700" />
          <span className="text-xs text-ink-400">Image preview</span>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-danger-500/30 bg-danger-500/10 p-3 text-xs font-medium text-danger-400">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gold-500 px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-ink-950 transition hover:bg-gold-400 disabled:opacity-60 cursor-pointer"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
        {submitting ? 'Adding…' : 'Add Part'}
      </button>
    </form>
  );
}
