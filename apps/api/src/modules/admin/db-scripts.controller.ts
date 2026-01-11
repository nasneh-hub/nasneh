/**
 * Admin DB Scripts Controller - Nasneh API
 * Endpoints for running database scripts on staging
 */

import type { Request, Response } from 'express';
import { prisma } from '../../lib/db.js';
import { generateSlug } from '../../utils/slug.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Populate slugs for existing products and services
 */
export async function populateSlugs(req: Request, res: Response) {
  try {
    console.log('=== Starting populate-slugs ===');
    
    // Update products without slugs
    const productsWithoutSlugs = await prisma.product.findMany({
      where: { slug: '' },
      select: { id: true, name: true },
    });

    let productsUpdated = 0;
    for (const product of productsWithoutSlugs) {
      await prisma.product.update({
        where: { id: product.id },
        data: { slug: generateSlug(product.name) },
      });
      productsUpdated++;
    }

    // Update services without slugs
    const servicesWithoutSlugs = await prisma.service.findMany({
      where: { slug: '' },
      select: { id: true, name: true },
    });

    let servicesUpdated = 0;
    for (const service of servicesWithoutSlugs) {
      await prisma.service.update({
        where: { id: service.id },
        data: { slug: generateSlug(service.name) },
      });
      servicesUpdated++;
    }

    const result = {
      success: true,
      productsUpdated,
      servicesUpdated,
      message: `Updated ${productsUpdated} products and ${servicesUpdated} services`,
    };

    console.log('=== populate-slugs complete ===', result);
    res.json(result);
  } catch (error: any) {
    console.error('Error in populateSlugs:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Run seed:staging script
 */
export async function runSeed(req: Request, res: Response) {
  try {
    console.log('=== Starting seed:staging ===');
    
    const { stdout, stderr } = await execAsync(
      'cd /app/apps/api && APP_ENVIRONMENT=staging pnpm seed:staging',
      { timeout: 60000 }
    );

    console.log('Seed stdout:', stdout);
    if (stderr) console.error('Seed stderr:', stderr);

    res.json({
      success: true,
      message: 'Seed completed successfully',
      output: stdout,
    });
  } catch (error: any) {
    console.error('Error in runSeed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      output: error.stdout || '',
    });
  }
}

/**
 * Verify data counts and sample slugs
 */
export async function verifyData(req: Request, res: Response) {
  try {
    const [
      categoriesCount,
      productsCount,
      servicesCount,
      sampleProduct,
      sampleService,
      sampleProducts,
      sampleServices,
    ] = await Promise.all([
      prisma.category.count(),
      prisma.product.count(),
      prisma.service.count(),
      prisma.product.findFirst({
        select: { name: true, slug: true },
        where: { slug: { not: '' } },
      }),
      prisma.service.findFirst({
        select: { name: true, slug: true },
        where: { slug: { not: '' } },
      }),
      prisma.product.findMany({
        select: { name: true, slug: true },
        where: { slug: { not: '' } },
        take: 5,
      }),
      prisma.service.findMany({
        select: { name: true, slug: true },
        where: { slug: { not: '' } },
        take: 5,
      }),
    ]);

    res.json({
      success: true,
      counts: {
        categories: categoriesCount,
        products: productsCount,
        services: servicesCount,
      },
      samples: {
        product: sampleProduct,
        service: sampleService,
        products: sampleProducts,
        services: sampleServices,
      },
    });
  } catch (error: any) {
    console.error('Error in verifyData:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
