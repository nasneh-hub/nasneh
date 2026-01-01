/**
 * Services CRUD Tests - Nasneh API
 * Unit tests for services module
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createServiceSchema,
  updateServiceSchema,
  serviceQuerySchema,
  ServiceType,
} from '../../types/service.types';

// ===========================================
// Schema Validation Tests
// ===========================================

describe('Service Schemas', () => {
  describe('createServiceSchema', () => {
    describe('APPOINTMENT type', () => {
      it('should accept valid appointment service', () => {
        const input = {
          name: 'Haircut',
          nameAr: 'قص شعر',
          description: 'Professional haircut service',
          price: 10.5,
          serviceType: 'APPOINTMENT',
          durationMinutes: 30,
          images: ['https://example.com/image.jpg'],
          isAvailable: true,
        };

        const result = createServiceSchema.safeParse(input);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.serviceType).toBe('APPOINTMENT');
          expect(result.data.durationMinutes).toBe(30);
        }
      });

      it('should reject appointment service without durationMinutes', () => {
        const input = {
          name: 'Haircut',
          price: 10.5,
          serviceType: 'APPOINTMENT',
          // Missing durationMinutes
        };

        const result = createServiceSchema.safeParse(input);
        expect(result.success).toBe(false);
      });

      it('should reject durationMinutes less than 15', () => {
        const input = {
          name: 'Quick Service',
          price: 5,
          serviceType: 'APPOINTMENT',
          durationMinutes: 10, // Too short
        };

        const result = createServiceSchema.safeParse(input);
        expect(result.success).toBe(false);
      });

      it('should reject durationMinutes more than 480', () => {
        const input = {
          name: 'Long Service',
          price: 100,
          serviceType: 'APPOINTMENT',
          durationMinutes: 500, // Too long (8+ hours)
        };

        const result = createServiceSchema.safeParse(input);
        expect(result.success).toBe(false);
      });
    });

    describe('DELIVERY_DATE type', () => {
      it('should accept valid delivery date service', () => {
        const input = {
          name: 'Custom Cake',
          price: 25,
          serviceType: 'DELIVERY_DATE',
          preparationDays: 3,
        };

        const result = createServiceSchema.safeParse(input);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.serviceType).toBe('DELIVERY_DATE');
          expect(result.data.preparationDays).toBe(3);
        }
      });

      it('should reject delivery date service without preparationDays', () => {
        const input = {
          name: 'Custom Cake',
          price: 25,
          serviceType: 'DELIVERY_DATE',
          // Missing preparationDays
        };

        const result = createServiceSchema.safeParse(input);
        expect(result.success).toBe(false);
      });

      it('should accept preparationDays of 0 (same day)', () => {
        const input = {
          name: 'Express Service',
          price: 50,
          serviceType: 'DELIVERY_DATE',
          preparationDays: 0,
        };

        const result = createServiceSchema.safeParse(input);
        expect(result.success).toBe(true);
      });
    });

    describe('PICKUP_DROPOFF type', () => {
      it('should accept valid pickup/dropoff service', () => {
        const input = {
          name: 'Dry Cleaning',
          price: 15,
          serviceType: 'PICKUP_DROPOFF',
        };

        const result = createServiceSchema.safeParse(input);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.serviceType).toBe('PICKUP_DROPOFF');
        }
      });

      it('should accept optional preparationDays for pickup/dropoff', () => {
        const input = {
          name: 'Dry Cleaning',
          price: 15,
          serviceType: 'PICKUP_DROPOFF',
          preparationDays: 2,
        };

        const result = createServiceSchema.safeParse(input);
        expect(result.success).toBe(true);
      });
    });

    describe('Common validations', () => {
      it('should reject empty name', () => {
        const input = {
          name: '',
          price: 10,
          serviceType: 'APPOINTMENT',
          durationMinutes: 30,
        };

        const result = createServiceSchema.safeParse(input);
        expect(result.success).toBe(false);
      });

      it('should reject name too short', () => {
        const input = {
          name: 'A',
          price: 10,
          serviceType: 'APPOINTMENT',
          durationMinutes: 30,
        };

        const result = createServiceSchema.safeParse(input);
        expect(result.success).toBe(false);
      });

      it('should reject negative price', () => {
        const input = {
          name: 'Test Service',
          price: -5,
          serviceType: 'APPOINTMENT',
          durationMinutes: 30,
        };

        const result = createServiceSchema.safeParse(input);
        expect(result.success).toBe(false);
      });

      it('should reject price exceeding max', () => {
        const input = {
          name: 'Expensive Service',
          price: 100000,
          serviceType: 'APPOINTMENT',
          durationMinutes: 30,
        };

        const result = createServiceSchema.safeParse(input);
        expect(result.success).toBe(false);
      });

      it('should reject more than 10 images', () => {
        const input = {
          name: 'Service',
          price: 10,
          serviceType: 'APPOINTMENT',
          durationMinutes: 30,
          images: Array(11).fill('https://example.com/image.jpg'),
        };

        const result = createServiceSchema.safeParse(input);
        expect(result.success).toBe(false);
      });

      it('should reject invalid image URLs', () => {
        const input = {
          name: 'Service',
          price: 10,
          serviceType: 'APPOINTMENT',
          durationMinutes: 30,
          images: ['not-a-url'],
        };

        const result = createServiceSchema.safeParse(input);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('updateServiceSchema', () => {
    it('should accept partial updates', () => {
      const input = {
        name: 'Updated Name',
      };

      const result = updateServiceSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept price update only', () => {
      const input = {
        price: 20.5,
      };

      const result = updateServiceSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept availability toggle', () => {
      const input = {
        isAvailable: false,
      };

      const result = updateServiceSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept empty object (no changes)', () => {
      const input = {};

      const result = updateServiceSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject invalid price in update', () => {
      const input = {
        price: -10,
      };

      const result = updateServiceSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('serviceQuerySchema', () => {
    it('should accept valid query with all params', () => {
      const query = {
        page: '2',
        limit: '10',
        serviceType: 'APPOINTMENT',
        minPrice: '5',
        maxPrice: '100',
        isAvailable: 'true',
        search: 'haircut',
      };

      const result = serviceQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(10);
        expect(result.data.serviceType).toBe('APPOINTMENT');
        expect(result.data.minPrice).toBe(5);
        expect(result.data.maxPrice).toBe(100);
        expect(result.data.isAvailable).toBe(true);
        expect(result.data.search).toBe('haircut');
      }
    });

    it('should use defaults for missing params', () => {
      const query = {};

      const result = serviceQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it('should reject invalid page number', () => {
      const query = {
        page: '0',
      };

      const result = serviceQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });

    it('should reject limit exceeding max', () => {
      const query = {
        limit: '200',
      };

      const result = serviceQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });

    it('should reject invalid serviceType', () => {
      const query = {
        serviceType: 'INVALID_TYPE',
      };

      const result = serviceQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });
  });
});

// ===========================================
// Service Type Constants Tests
// ===========================================

describe('ServiceType Constants', () => {
  it('should have all expected service types', () => {
    expect(ServiceType.APPOINTMENT).toBe('APPOINTMENT');
    expect(ServiceType.DELIVERY_DATE).toBe('DELIVERY_DATE');
    expect(ServiceType.PICKUP_DROPOFF).toBe('PICKUP_DROPOFF');
  });

  it('should have exactly 3 service types', () => {
    const types = Object.keys(ServiceType);
    expect(types).toHaveLength(3);
  });
});

// ===========================================
// Service Business Logic Tests
// ===========================================

describe('Service Business Logic', () => {
  describe('Service Type Field Requirements', () => {
    it('APPOINTMENT requires durationMinutes', () => {
      // This is enforced by Zod schema
      const appointmentWithDuration = {
        name: 'Test',
        price: 10,
        serviceType: 'APPOINTMENT',
        durationMinutes: 30,
      };
      expect(createServiceSchema.safeParse(appointmentWithDuration).success).toBe(true);

      const appointmentWithoutDuration = {
        name: 'Test',
        price: 10,
        serviceType: 'APPOINTMENT',
      };
      expect(createServiceSchema.safeParse(appointmentWithoutDuration).success).toBe(false);
    });

    it('DELIVERY_DATE requires preparationDays', () => {
      const deliveryWithPrep = {
        name: 'Test',
        price: 10,
        serviceType: 'DELIVERY_DATE',
        preparationDays: 2,
      };
      expect(createServiceSchema.safeParse(deliveryWithPrep).success).toBe(true);

      const deliveryWithoutPrep = {
        name: 'Test',
        price: 10,
        serviceType: 'DELIVERY_DATE',
      };
      expect(createServiceSchema.safeParse(deliveryWithoutPrep).success).toBe(false);
    });

    it('PICKUP_DROPOFF has optional preparationDays', () => {
      const pickupWithPrep = {
        name: 'Test',
        price: 10,
        serviceType: 'PICKUP_DROPOFF',
        preparationDays: 1,
      };
      expect(createServiceSchema.safeParse(pickupWithPrep).success).toBe(true);

      const pickupWithoutPrep = {
        name: 'Test',
        price: 10,
        serviceType: 'PICKUP_DROPOFF',
      };
      expect(createServiceSchema.safeParse(pickupWithoutPrep).success).toBe(true);
    });
  });
});
