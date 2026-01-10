'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Skeleton } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';

interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
}

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/categories`
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

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Page Header */}
      <section className="bg-[var(--bg-secondary)] px-[var(--spacing-lg)] py-[var(--spacing-2xl)]">
        <div className="mx-auto max-w-[1200px]">
          <h1 className="mb-[var(--spacing-md)] text-[length:var(--font-size-3xl)] font-[var(--font-weight-bold)] text-[var(--text-primary)]">
            {en.categories.allCategories}
          </h1>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="px-[var(--spacing-lg)] py-[var(--spacing-2xl)]">
        <div className="mx-auto max-w-[1200px]">
          {loading ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[var(--spacing-xl)]">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="p-[var(--spacing-xl)]">
                  <Skeleton className="mb-[var(--spacing-sm)] h-[24px] w-[120px]" />
                  <Skeleton className="h-[16px] w-full" />
                </Card>
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[var(--spacing-xl)]">
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
    </div>
  );
}
