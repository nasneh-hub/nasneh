'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { en } from '@nasneh/ui/copy';
import { Button, Skeleton } from '@nasneh/ui';
import { formatCurrency } from '@/lib/utils/currency';
import { CheckCircle, XCircle, Package, MapPin, FileText } from 'lucide-react';
import { getPaymentProvider } from '@/lib/payment';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-staging.nasneh.com/api/v1';

// Types
interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface OrderData {
  id: string;
  orderId: string;
  status: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  address: {
    label: string;
    street: string;
    city: string;
    country: string;
  };
  notes?: string;
  createdAt: string;
}

export default function OrderConfirmationPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.id as string;

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Fetch order
  const fetchOrder = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setNotFound(false);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        // Unauthorized - redirect to login
        router.push(`/login?redirect=/orders/${orderId}/confirmation`);
        return;
      }

      if (response.status === 404) {
        setNotFound(true);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load order');
      }

      const data = await response.json();
      setOrder(data.data);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(en.ui.error);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, router]);

  // Process mock payment
  const processPayment = useCallback(async () => {
    if (!order) return;

    try {
      setIsProcessingPayment(true);
      setPaymentError(null);

      // Check if payment should fail (via query param)
      const shouldFail = searchParams.get('payment') === 'fail';
      const paymentProvider = getPaymentProvider(shouldFail);

      const result = await paymentProvider.processPayment(order.id, order.total);

      if (result.success) {
        setPaymentSuccess(true);
        setPaymentError(null);
      } else {
        setPaymentSuccess(false);
        setPaymentError(result.error || 'Payment failed');
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      setPaymentError(en.ui.error);
    } finally {
      setIsProcessingPayment(false);
    }
  }, [order, searchParams]);

  // Load order on mount
  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Auto-process payment after order loads
  useEffect(() => {
    if (order && !paymentSuccess && !paymentError && !isProcessingPayment) {
      processPayment();
    }
  }, [order, paymentSuccess, paymentError, isProcessingPayment, processPayment]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (notFound) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <XCircle className="w-16 h-16 text-mono-10 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-mono-12 mb-4">
            {en.order.notFound}
          </h1>
          <p className="text-mono-10 mb-6">{en.order.notFoundDescription}</p>
          <Button onClick={() => router.push('/orders')}>
            {en.order.backToOrders}
          </Button>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <XCircle className="w-16 h-16 text-mono-10 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-mono-12 mb-4">
            {en.ui.error}
          </h1>
          <p className="text-mono-10 mb-6">{error}</p>
          <Button onClick={fetchOrder}>
            {en.ui.tryAgain}
          </Button>
        </div>
      </div>
    );
  }

  // Order loaded - show confirmation
  if (!order) return null;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          {paymentSuccess ? (
            <>
              <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-mono-12 mb-2">
                {en.order.title}
              </h1>
              <p className="text-mono-10">
                {en.order.orderPlaced}
              </p>
            </>
          ) : isProcessingPayment ? (
            <>
              <div className="w-16 h-16 rounded-full border-4 border-mono-4 border-t-primary animate-spin mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-mono-12 mb-2">
                {en.payment.processing}
              </h1>
              <p className="text-mono-10">
                {en.payment.mockModeDescription}
              </p>
            </>
          ) : paymentError ? (
            <>
              <XCircle className="w-16 h-16 text-mono-10 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-mono-12 mb-2">
                {en.payment.paymentFailed}
              </h1>
              <p className="text-mono-10 mb-4">{paymentError}</p>
              <Button onClick={processPayment}>
                {en.ui.tryAgain}
              </Button>
            </>
          ) : null}
        </div>

        {/* Order Details */}
        {paymentSuccess && (
          <div className="space-y-6">
            {/* Order ID */}
            <div className="p-6 rounded-xl bg-mono-2">
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-5 h-5 text-mono-10" />
                <h2 className="text-lg font-semibold text-mono-12">
                  {en.order.orderDetails}
                </h2>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-mono-10">{en.order.orderNumber}</span>
                  <span className="font-medium text-mono-12">{order.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-mono-10">{en.order.orderStatus}</span>
                  <span className="font-medium text-mono-12">{order.status}</span>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="p-6 rounded-xl bg-mono-2">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-5 h-5 text-mono-10" />
                <h2 className="text-lg font-semibold text-mono-12">
                  {en.order.deliveryAddress}
                </h2>
              </div>
              <div className="text-mono-11">
                <p className="font-medium text-mono-12">{order.address.label}</p>
                <p>{order.address.street}</p>
                <p>{order.address.city}, {order.address.country}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-6 rounded-xl bg-mono-2">
              <h2 className="text-lg font-semibold text-mono-12 mb-4">
                {en.checkout.items}
              </h2>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <p className="font-medium text-mono-12">{item.name}</p>
                      <p className="text-sm text-mono-10">
                        {en.cart.quantity}: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium text-mono-12">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-6 border-t border-mono-4 space-y-2">
                <div className="flex justify-between text-mono-11">
                  <span>{en.cart.subtotal}</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-mono-11">
                  <span>{en.cart.deliveryFee}</span>
                  <span>
                    {order.deliveryFee === 0 ? (
                      <span className="text-primary">{en.cart.freeDelivery}</span>
                    ) : (
                      formatCurrency(order.deliveryFee)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold text-mono-12 pt-2">
                  <span>{en.cart.total}</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Order Notes */}
            {order.notes && (
              <div className="p-6 rounded-xl bg-mono-2">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-5 h-5 text-mono-10" />
                  <h2 className="text-lg font-semibold text-mono-12">
                    {en.checkout.orderNotes}
                  </h2>
                </div>
                <p className="text-mono-11">{order.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                onClick={() => router.push(`/orders/${order.id}`)}
                className="flex-1"
              >
                {en.order.viewOrder}
              </Button>
              <Button
                onClick={() => router.push('/products')}
                variant="secondary"
                className="flex-1"
              >
                {en.cart.continueShopping}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
