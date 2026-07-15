import { Car } from 'lucide-react';

interface PartThumbProps {
  imageUrl?: string | null;
  name: string;
}

export default function PartThumb({ imageUrl, name }: PartThumbProps) {
  if (imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={imageUrl} alt={name} className="h-full w-full object-cover" loading="lazy" />;
  }
  return (
    <div className="grid h-full w-full place-items-center bg-ink-800">
      <Car className="h-12 w-12 text-gold-500/70" strokeWidth={1.5} />
    </div>
  );
}
