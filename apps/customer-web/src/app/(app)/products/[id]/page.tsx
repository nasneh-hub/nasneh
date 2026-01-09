'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { en } from '@nasneh/ui/copy';
import { Button, Skeleton } from '@nasneh/ui';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { ImageGallery } from '@/components/product/image-gallery';
import { ProductInfo } from '@/components/product/product-info';
import { RelatedProducts } from '@/components/product/related-products';
import { ReviewsSummary } from '@/components/reviews/reviews-summary';
import { ReviewList } from '@/components/reviews/review-list';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  stock?: number;
  status?: string;
  vendor?: {
    id: string;
    name: string;
    avatar?: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [reviewsData, setReviewsData] = useState<{
    averageRating: number;
    totalReviews: number;
  }>({ averageRating: 0, totalReviews: 0 });
  
  useEffect(() => {
    async function fetchProduct() {
      try {
        setIsLoading(true);
        setNotFound(false);
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`
        );
        
        if (!response.ok) {
          if (response.status === 404) {
            setNotFound(true);
            return;
          }
          throw new Error('Failed to fetch product');
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          setProduct(data.data);
          
          // Fetch related products if category exists
          if (data.data.category?.slug) {
            fetchRelatedProducts(data.data.category.slug, productId);
          }
          
          // Fetch reviews summary
          fetchReviewsSummary(productId);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchProduct();
  }, [productId]);
  
  async function fetchReviewsSummary(itemId: string) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reviews?itemType=product&itemId=${itemId}&limit=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.total) {
          // Calculate average from all reviews (simplified - in production would come from API)
          setReviewsData({
            averageRating: data.averageRating || 0,
            totalReviews: data.total || 0,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching reviews summary:', error);
    }
  }
  
  async function fetchRelatedProducts(categorySlug: string, excludeId: string) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products?category=${categorySlug}&limit=6`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Exclude current product
          const related = data.data.filter((p: Product) => p.id !== excludeId);
          setRelatedProducts(related.slice(0, 6));
        }
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  }
  
  async function handleAddToCart() {
    if (!product) return;
    
    try {
      setIsAddingToCart(true);
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/cart/items`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: product.id,
            quantity: 1,
          }),
        }
      );
      
      if (response.ok) {
        // TODO: Show success toast
        // TODO: Update cart count
      } else if (response.status === 401) {
        // Redirect to login
        router.push('/login');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  }
  
  // Loading State
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-6 w-64 mb-8" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="w-full aspect-square rounded-xl" />
          
          <div className="flex flex-col gap-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }
  
  // Not Found State
  if (notFound || !product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">📦</div>
            <h1 className="text-2xl font-bold text-mono-12 mb-2">
              {en.product.notFound}
            </h1>
            <p className="text-mono-11">
              {en.product.notFoundDescription}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="secondary"
              onClick={() => router.push('/products')}
            >
              {en.product.backToProducts}
            </Button>
            <Button onClick={() => router.push('/categories')}>
              {en.listing.browseCategories}
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Success State
  const breadcrumbItems = [
    { label: en.navigation.home, href: '/' },
    { label: en.listing.allProducts, href: '/products' },
    { label: product.name },
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-8">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      
      {/* Product Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Image Gallery */}
        <ImageGallery
          images={product.images || []}
          alt={product.name}
        />
        
        {/* Product Info */}
        <ProductInfo
          product={product}
          onAddToCart={handleAddToCart}
          isAddingToCart={isAddingToCart}
        />
      </div>
      
      {/* Reviews Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-mono-12 mb-6">
          {en.reviews.title}
        </h2>
        
        <div className="space-y-6">
          <ReviewsSummary
            averageRating={reviewsData.averageRating}
            totalReviews={reviewsData.totalReviews}
          />
          
          <ReviewList itemType="product" itemId={productId} />
        </div>
      </div>
      
      {/* Related Products */}
      <RelatedProducts products={relatedProducts} />
    </div>
  );
}
