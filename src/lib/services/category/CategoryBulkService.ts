/**
 * Category Bulk Service
 * Service layer for bulk insert operations on Category module
 * Follows functional programming and single responsibility principles
 */

import { Category } from '@/db/models';
import { connectDB } from '@/db/mongodb';
import type { BulkInsertResult } from '../excel/types';

/**
 * Category input type for bulk insert
 */
export type CategoryBulkInput = {
  name: string;
  slug?: string;
};

/**
 * Generate slug from name
 * Pure function that creates URL-friendly slug
 */
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Validate single category data
 * Pure function that validates category structure
 */
export const validateCategoryData = (
  data: CategoryBulkInput
): { success: boolean; data?: CategoryBulkInput; error?: { issues: Array<{ message: string }> } } => {
  const errors: Array<{ message: string }> = [];

  // Validate name field
  if (!data.name || typeof data.name !== 'string') {
    errors.push({ message: 'Name is required and must be a string' });
  } else if (data.name.trim().length === 0) {
    errors.push({ message: 'Name cannot be empty' });
  } else if (data.name.trim().length > 50) {
    errors.push({ message: 'Name cannot exceed 50 characters' });
  }

  // Validate slug if provided
  if (data.slug) {
    if (typeof data.slug !== 'string') {
      errors.push({ message: 'Slug must be a string' });
    } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
      errors.push({ message: 'Slug can only contain lowercase letters, numbers, and hyphens' });
    }
  }

  if (errors.length > 0) {
    return { success: false, error: { issues: errors } };
  }

  // Auto-generate slug if not provided
  const slug = data.slug?.trim() || generateSlug(data.name);

  return {
    success: true,
    data: {
      name: data.name.trim(),
      slug,
    },
  };
};

/**
 * Bulk insert categories into database
 * Handles duplicates gracefully and returns detailed results
 */
export const bulkInsertCategories = async (
  data: CategoryBulkInput[]
): Promise<BulkInsertResult<CategoryBulkInput>> => {
  await connectDB();

  const inserted: CategoryBulkInput[] = [];
  const failed: Array<{
    data: CategoryBulkInput;
    error: string;
    rowNumber: number;
  }> = [];

  // Process each category individually to handle duplicates
  for (let i = 0; i < data.length; i++) {
    const categoryData = data[i];
    try {
      // Check if category already exists by name or slug
      const existing = await Category.findOne({
        $or: [
          { name: categoryData.name },
          { slug: categoryData.slug },
        ],
      });

      if (existing) {
        failed.push({
          data: categoryData,
          error: 'Category with this name or slug already exists',
          rowNumber: i + 1,
        });
        continue;
      }

      // Insert new category
      await Category.create(categoryData);
      inserted.push(categoryData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      failed.push({
        data: categoryData,
        error: errorMessage,
        rowNumber: i + 1,
      });
    }
  }

  return {
    success: inserted.length > 0,
    inserted,
    failed,
    totalProcessed: data.length,
    successCount: inserted.length,
    failureCount: failed.length,
  };
};

/**
 * Get expected CSV headers for Category module
 * Only 'name' is required; 'slug' is optional
 */
export const getCategoryHeaders = (): string[] => {
  return ['name'];
};

/**
 * Get header mapping for Category module
 * Maps CSV headers to database field names
 */
export const getCategoryHeaderMapping = (): Record<string, string> => {
  return {
    name: 'name',
    Name: 'name',
    NAME: 'name',
    'Category Name': 'name',
    'category name': 'name',
    slug: 'slug',
    Slug: 'slug',
    SLUG: 'slug',
  };
};
