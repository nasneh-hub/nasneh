'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Skeleton } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';
import { Search } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
}

export default function HomePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/categories`
      );
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="flex min-h-[60vh] flex-col items-center justify-center gap-[var(--spacing-2xl)] bg-[var(--bg-secondary)] px-[var(--spacing-lg)] py-[var(--spacing-3xl)] text-center">
        <div className="flex max-w-[800px] flex-col gap-[var(--spacing-xl)]">
          <h1 className="m-0 text-[length:var(--font-size-4xl)] font-[var(--font-weight-bold)] leading-[1.2] text-[var(--text-primary)]">
            {en.categories.allCategories}
          </h1>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mx-auto flex w-full max-w-[600px] gap-[var(--spacing-md)]">
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-[var(--spacing-md)] top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
              />
              <input
                type="text"
                placeholder={en.ui.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-[var(--radius-standard)] border border-[var(--border-primary)] bg-[var(--bg-primary)] py-[var(--spacing-md)] pl-[var(--spacing-3xl)] pr-[var(--spacing-md)] text-[length:var(--font-size-base)] text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)]"
              />
            </div>
            <Button type="submit" variant="default" size="lg">
              {en.ui.search}
            </Button>
          </form>

          <div>
            <Button
              variant="default"
              size="lg"
              onClick={() => router.push('/categories')}
            >
              {en.ui.browse}
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="bg-[var(--bg-primary)] px-[var(--spacing-lg)] py-[var(--spacing-3xl)]">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="mb-[var(--spacing-2xl)] text-center text-[length:var(--font-size-2xl)] font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            {en.ui.featuredNasneh}
          </h2>

          {loading ? (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-[var(--spacing-xl)]">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="p-[var(--spacing-xl)]">
                  <Skeleton className="mb-[var(--spacing-sm)] h-[24px] w-[120px]" />
                  <Skeleton className="h-[16px] w-full" />
                </Card>
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-[var(--spacing-xl)]">
              {categories.map((category) => (
                <Card
                  key={category.id}
                  onClick={() => router.push(`/category/${category.slug}`)}
                  className="cursor-pointer p-[var(--spacing-xl)] transition-transform duration-200 hover:-translate-y-1"
                >
                  <h3 className="mb-[var(--spacing-sm)] text-[length:var(--font-size-lg)] font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="m-0 text-[length:var(--font-size-sm)] text-[var(--text-secondary)]">
                      {category.description}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-[var(--spacing-md)] py-[var(--spacing-3xl)] text-center">
              <p className="text-[length:var(--font-size-base)] text-[var(--text-secondary)]">
                {en.settings.comingSoon}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
