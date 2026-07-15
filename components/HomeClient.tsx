'use client';

import { useState } from 'react';
import { PublicProduct, Origin, Condition } from '@/types';
import Hero from './Hero';
import Categories, { QuickFilter } from './Categories';
import Inventory from './Inventory';
import BrandStrip from './BrandStrip';
import Services from './Services';
import About from './About';
import Contact from './Contact';

interface HomeClientProps {
  initialProducts: PublicProduct[];
}

export default function HomeClient({ initialProducts }: HomeClientProps) {
  const [search, setSearch] = useState('');
  const [origin, setOrigin] = useState<Origin | ''>('');
  const [condition, setCondition] = useState<Condition | ''>('');

  const handleQuickFilter = (filter: QuickFilter) => {
    setOrigin(filter.origin ?? '');
    setCondition(filter.condition ?? '');
    document.getElementById('inventory')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <Hero />
      <Categories onSelect={handleQuickFilter} />
      <Inventory
        products={initialProducts}
        loading={false}
        search={search}
        origin={origin}
        condition={condition}
        onSearchChange={setSearch}
        onOriginChange={setOrigin}
        onConditionChange={setCondition}
      />
      <BrandStrip />
      <Services />
      <About />
      <Contact />
    </>
  );
}
