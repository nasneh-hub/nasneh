/**
 * Services CRUD & Listing Tests - Nasneh API
 * Unit tests for services module
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createServiceSchema,
  updateServiceSchema,
  serviceQuerySchema,
  providerServiceQuerySchema,
  ServiceType,
  ServiceSortBy,
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

  // ===========================================
  // Service Query Schema Tests (Public Listing)
  // ===========================================

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
        sortBy: 'price_asc',
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
        expect(result.data.sortBy).toBe('price_asc');
      }
    });

    it('should use defaults for missing params', () => {
      const query = {};

      const result = serviceQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
        expect(result.data.sortBy).toBe('newest');
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

    it('should accept providerId filter', () => {
      const query = {
        providerId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = serviceQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.providerId).toBe('123e4567-e89b-12d3-a456-426614174000');
      }
    });

    it('should accept categoryId filter', () => {
      const query = {
        categoryId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = serviceQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.categoryId).toBe('123e4567-e89b-12d3-a456-426614174000');
      }
    });

    it('should accept all sortBy options', () => {
      const sortOptions = ['newest', 'oldest', 'price_asc', 'price_desc', 'name_asc', 'name_desc'];
      
      for (const sortBy of sortOptions) {
        const result = serviceQuerySchema.safeParse({ sortBy });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.sortBy).toBe(sortBy);
        }
      }
    });

    it('should reject invalid sortBy option', () => {
      const query = {
        sortBy: 'invalid_sort',
      };

      const result = serviceQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });

    it('should parse price range correctly', () => {
      const query = {
        minPrice: '10.50',
        maxPrice: '99.99',
      };

      const result = serviceQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.minPrice).toBe(10.5);
        expect(result.data.maxPrice).toBe(99.99);
      }
    });

    it('should reject negative prices', () => {
      const query = {
        minPrice: '-5',
      };

      const result = serviceQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });
  });

  // ===========================================
  // Provider Service Query Schema Tests
  // ===========================================

  describe('providerServiceQuerySchema', () => {
    it('should accept status filter for provider view', () => {
      const query = {
        status: 'ACTIVE',
      };

      const result = providerServiceQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('ACTIVE');
      }
    });

    it('should accept includeDeleted flag', () => {
      const query = {
        includeDeleted: 'true',
      };

      const result = providerServiceQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.includeDeleted).toBe(true);
      }
    });

    it('should default includeDeleted to false', () => {
      const query = {};

      const result = providerServiceQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.includeDeleted).toBe(false);
      }
    });

    it('should accept all status options', () => {
      const statusOptions = ['ACTIVE', 'INACTIVE', 'DELETED'];
      
      for (const status of statusOptions) {
        const result = providerServiceQuerySchema.safeParse({ status });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.status).toBe(status);
        }
      }
    });

    it('should reject invalid status', () => {
      const query = {
        status: 'INVALID_STATUS',
      };

      const result = providerServiceQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });

    it('should accept combined filters', () => {
      const query = {
        page: '1',
        limit: '50',
        serviceType: 'APPOINTMENT',
        status: 'ACTIVE',
        minPrice: '10',
        maxPrice: '100',
        isAvailable: 'true',
        search: 'massage',
        sortBy: 'price_desc',
        includeDeleted: 'false',
      };

      const result = providerServiceQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(50);
        expect(result.data.serviceType).toBe('APPOINTMENT');
        expect(result.data.status).toBe('ACTIVE');
        expect(result.data.minPrice).toBe(10);
        expect(result.data.maxPrice).toBe(100);
        expect(result.data.isAvailable).toBe(true);
        expect(result.data.search).toBe('massage');
        expect(result.data.sortBy).toBe('price_desc');
        expect(result.data.includeDeleted).toBe(false);
      }
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
// Service Sort Constants Tests
// ===========================================

describe('ServiceSortBy Constants', () => {
  it('should have all expected sort options', () => {
    expect(ServiceSortBy.NEWEST).toBe('newest');
    expect(ServiceSortBy.OLDEST).toBe('oldest');
    expect(ServiceSortBy.PRICE_ASC).toBe('price_asc');
    expect(ServiceSortBy.PRICE_DESC).toBe('price_desc');
    expect(ServiceSortBy.NAME_ASC).toBe('name_asc');
    expect(ServiceSortBy.NAME_DESC).toBe('name_desc');
  });

  it('should have exactly 6 sort options', () => {
    const options = Object.keys(ServiceSortBy);
    expect(options).toHaveLength(6);
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

  describe('Pagination Edge Cases', () => {
    it('should accept page 1 as minimum', () => {
      const result = serviceQuerySchema.safeParse({ page: '1' });
      expect(result.success).toBe(true);
    });

    it('should accept high page numbers', () => {
      const result = serviceQuerySchema.safeParse({ page: '1000' });
      expect(result.success).toBe(true);
    });

    it('should accept limit of 1', () => {
      const result = serviceQuerySchema.safeParse({ limit: '1' });
      expect(result.success).toBe(true);
    });

    it('should accept limit of 100 (max)', () => {
      const result = serviceQuerySchema.safeParse({ limit: '100' });
      expect(result.success).toBe(true);
    });

    it('should reject limit of 101 (over max)', () => {
      const result = serviceQuerySchema.safeParse({ limit: '101' });
      expect(result.success).toBe(false);
    });
  });

  describe('Search Query Edge Cases', () => {
    it('should accept empty search string', () => {
      const result = serviceQuerySchema.safeParse({ search: '' });
      expect(result.success).toBe(true);
    });

    it('should accept search with special characters', () => {
      const result = serviceQuerySchema.safeParse({ search: 'hair & beauty' });
      expect(result.success).toBe(true);
    });

    it('should accept Arabic search terms', () => {
      const result = serviceQuerySchema.safeParse({ search: 'قص شعر' });
      expect(result.success).toBe(true);
    });

    it('should accept mixed language search', () => {
      const result = serviceQuerySchema.safeParse({ search: 'haircut قص' });
      expect(result.success).toBe(true);
    });
  });

  describe('Price Filter Edge Cases', () => {
    it('should accept minPrice of 0', () => {
      const result = serviceQuerySchema.safeParse({ minPrice: '0' });
      expect(result.success).toBe(true);
    });

    it('should accept very high maxPrice', () => {
      const result = serviceQuerySchema.safeParse({ maxPrice: '9999' });
      expect(result.success).toBe(true);
    });

    it('should accept minPrice equal to maxPrice', () => {
      const result = serviceQuerySchema.safeParse({ minPrice: '50', maxPrice: '50' });
      expect(result.success).toBe(true);
    });

    it('should accept decimal prices', () => {
      const result = serviceQuerySchema.safeParse({ minPrice: '10.500', maxPrice: '99.999' });
      expect(result.success).toBe(true);
    });
  });
});
