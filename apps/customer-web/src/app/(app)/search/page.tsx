'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button, Card, Badge, Skeleton } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  vendorName?: string;
}

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  providerName?: string;
  serviceType?: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      performSearch();
    } else {
      setLoading(false);
    }
  }, [query]);

  const performSearch = async () => {
    try {
      setLoading(true);

      // Search products
      const productsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/products?search=${encodeURIComponent(query)}`
      );
      const productsData = await productsResponse.json();
      
      if (productsData.success) {
        setProducts(productsData.data);
      }

      // Search services
      const servicesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/services?search=${encodeURIComponent(query)}`
      );
      const servicesData = await servicesResponse.json();
      
      if (servicesData.success) {
        setServices(servicesData.data);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalResults = products.length + services.length;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Search Header */}
      <section className="bg-[var(--bg-secondary)] px-[var(--spacing-lg)] py-[var(--spacing-2xl)]">
        <div className="mx-auto max-w-[1200px]">
          <h1 className="mb-[var(--spacing-md)] text-[length:var(--font-size-3xl)] font-[var(--font-weight-bold)] text-[var(--text-primary)]">
            {en.ui.search}
          </h1>
          {query && (
            <p className="text-[length:var(--font-size-base)] text-[var(--text-secondary)]">
              {totalResults}
            </p>
          )}
        </div>
      </section>

      {/* Search Results */}
      <section className="px-[var(--spacing-lg)] py-[var(--spacing-2xl)]">
        <div className="mx-auto max-w-[1200px]">
          {!query ? (
            <div className="flex flex-col items-center gap-[var(--spacing-md)] py-[var(--spacing-3xl)] text-center">
              <p className="text-[length:var(--font-size-base)] text-[var(--text-secondary)]">
                {en.ui.search}
              </p>
              <Button onClick={() => router.push('/')}>
                {en.ui.back}
              </Button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[var(--spacing-xl)]">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="p-[var(--spacing-lg)]">
                  <Skeleton className="mb-[var(--spacing-md)] h-[200px] w-full" />
                  <Skeleton className="mb-[var(--spacing-sm)] h-[20px] w-full" />
                  <Skeleton className="h-[16px] w-[80px]" />
                </Card>
              ))}
            </div>
          ) : totalResults === 0 ? (
            <div className="flex flex-col items-center gap-[var(--spacing-md)] py-[var(--spacing-3xl)] text-center">
              <p className="text-[length:var(--font-size-lg)] font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
                {en.orders.noOrders}
              </p>
              <p className="text-[length:var(--font-size-base)] text-[var(--text-secondary)]">
                {en.ui.tryAgain}
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
                  onClick={() => router.push(`/products/${product.id}`)}
                  className="cursor-pointer overflow-hidden transition-transform duration-200 hover:-translate-y-1"
                >
                  {product.image && (
                    <div className="h-[200px] w-full bg-[var(--bg-secondary)]" />
                  )}
                  <div className="p-[var(--spacing-lg)]">
                    <Badge variant="info" className="mb-[var(--spacing-sm)]">
                      {en.products.product}
                    </Badge>
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
                  onClick={() => router.push(`/services/${service.id}`)}
                  className="cursor-pointer overflow-hidden transition-transform duration-200 hover:-translate-y-1"
                >
                  {service.image && (
                    <div className="h-[200px] w-full bg-[var(--bg-secondary)]" />
                  )}
                  <div className="p-[var(--spacing-lg)]">
                    <Badge variant="info" className="mb-[var(--spacing-sm)]">
                      {en.products.service}
                    </Badge>
                    <h3 className="mb-[var(--spacing-sm)] text-[length:var(--font-size-lg)] font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
                      {service.name}
                    </h3>
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
