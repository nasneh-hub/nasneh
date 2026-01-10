'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card, Badge, Skeleton, Select } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  vendorName?: string;
  rating?: number;
}

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  providerName?: string;
  rating?: number;
  serviceType?: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
}

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchCategoryData();
  }, [slug, sortBy]);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      
      // Fetch category info
      const categoriesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/categories`
      );
      const categoriesData = await categoriesResponse.json();
      
      if (categoriesData.success) {
        const foundCategory = categoriesData.data.find(
          (cat: Category) => cat.slug === slug
        );
        setCategory(foundCategory || null);
      }

      // Fetch products
      const productsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products?category=${slug}&sort=${sortBy}`
      );
      const productsData = await productsResponse.json();
      
      if (productsData.success) {
        setProducts(productsData.data);
      }

      // Fetch services
      const servicesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/services?category=${slug}&sort=${sortBy}`
      );
      const servicesData = await servicesResponse.json();
      
      if (servicesData.success) {
        setServices(servicesData.data);
      }
    } catch (error) {
      console.error('Failed to fetch category data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  const handleServiceClick = (serviceId: string) => {
    router.push(`/services/${serviceId}`);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Category Header */}
      <section className="bg-[var(--bg-secondary)] px-[var(--spacing-lg)] py-[var(--spacing-2xl)]">
        <div className="mx-auto max-w-[1200px]">
          {loading ? (
            <>
              <Skeleton className="mb-[var(--spacing-md)] h-[32px] w-[200px]" />
              <Skeleton className="h-[20px] w-[400px]" />
            </>
          ) : category ? (
            <>
              <h1 className="mb-[var(--spacing-md)] text-[length:var(--font-size-3xl)] font-[var(--font-weight-bold)] text-[var(--text-primary)]">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-[length:var(--font-size-base)] text-[var(--text-secondary)]">
                  {category.description}
                </p>
              )}
            </>
          ) : (
            <h1 className="text-[length:var(--font-size-3xl)] font-[var(--font-weight-bold)] text-[var(--text-primary)]">
              {en.categories.allCategories}
            </h1>
          )}
        </div>
      </section>

      {/* Sorting Controls */}
      <section className="border-b border-[var(--border-primary)] bg-[var(--bg-primary)] px-[var(--spacing-lg)] py-[var(--spacing-md)]">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">
          <p className="text-[length:var(--font-size-sm)] text-[var(--text-secondary)]">
            {products.length + services.length}
          </p>
          <div className="flex items-center gap-[var(--spacing-md)]">
            <span className="text-[length:var(--font-size-sm)] text-[var(--text-secondary)]">
              {en.ui.sort}:
            </span>
            <Select
              value={sortBy}
              onChange={(value) => setSortBy(value as string)}
              options={[
                { value: 'newest', label: 'Newest' },
                { value: 'price_asc', label: 'Price: Low to High' },
                { value: 'price_desc', label: 'Price: High to Low' },
                { value: 'rating', label: 'Rating' },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Products & Services Grid */}
      <section className="px-[var(--spacing-lg)] py-[var(--spacing-2xl)]">
        <div className="mx-auto max-w-[1200px]">
          {loading ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[var(--spacing-xl)]">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="p-[var(--spacing-lg)]">
                  <Skeleton className="mb-[var(--spacing-md)] h-[200px] w-full" />
                  <Skeleton className="mb-[var(--spacing-sm)] h-[20px] w-full" />
                  <Skeleton className="mb-[var(--spacing-sm)] h-[16px] w-[80px]" />
                  <Skeleton className="h-[16px] w-[120px]" />
                </Card>
              ))}
            </div>
          ) : products.length === 0 && services.length === 0 ? (
            <div className="flex flex-col items-center gap-[var(--spacing-md)] py-[var(--spacing-3xl)] text-center">
              <p className="text-[length:var(--font-size-lg)] font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
                {en.orders.noOrders}
              </p>
              <p className="text-[length:var(--font-size-base)] text-[var(--text-secondary)]">
                {en.settings.comingSoon}
              </p>
              <Button onClick={() => router.push('/')}>
                {en.ui.back}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[var(--spacing-xl)]">
              {/* Products */}
              {products.map((product) => (
                <Card
                  key={product.id}
                  onClick={() => handleProductClick(product.id)}
                  className="cursor-pointer overflow-hidden transition-transform duration-200 hover:-translate-y-1"
                >
                  {product.image && (
                    <div className="h-[200px] w-full bg-[var(--bg-secondary)]" />
                  )}
                  <div className="p-[var(--spacing-lg)]">
                    <h3 className="mb-[var(--spacing-sm)] text-[length:var(--font-size-lg)] font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="mb-[var(--spacing-md)] line-clamp-2 text-[length:var(--font-size-sm)] text-[var(--text-secondary)]">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[length:var(--font-size-lg)] font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
                        {product.price} {en.currency.bhd}
                      </span>
                      {product.vendorName && (
                        <span className="text-[length:var(--font-size-sm)] text-[var(--text-secondary)]">
                          {product.vendorName}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              {/* Services */}
              {services.map((service) => (
                <Card
                  key={service.id}
                  onClick={() => handleServiceClick(service.id)}
                  className="cursor-pointer overflow-hidden transition-transform duration-200 hover:-translate-y-1"
                >
                  {service.image && (
                    <div className="h-[200px] w-full bg-[var(--bg-secondary)]" />
                  )}
                  <div className="p-[var(--spacing-lg)]">
                    <div className="mb-[var(--spacing-sm)] flex items-start justify-between">
                      <h3 className="text-[length:var(--font-size-lg)] font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
                        {service.name}
                      </h3>
                      {service.serviceType && (
                        <Badge variant="info">{service.serviceType}</Badge>
                      )}
                    </div>
                    {service.description && (
                      <p className="mb-[var(--spacing-md)] line-clamp-2 text-[length:var(--font-size-sm)] text-[var(--text-secondary)]">
                        {service.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[length:var(--font-size-lg)] font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
                        {service.price} {en.currency.bhd}
                      </span>
                      {service.providerName && (
                        <span className="text-[length:var(--font-size-sm)] text-[var(--text-secondary)]">
                          {service.providerName}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
