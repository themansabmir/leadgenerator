/**
 * Location Bulk Service
 * Service layer for bulk insert operations on Location module
 * Follows functional programming and single responsibility principles
 */

import { Location } from '@/db/models';
import { connectDB } from '@/db/mongodb';
import type { BulkInsertResult } from '../excel/types';

/**
 * Location input type for bulk insert
 */
export type LocationBulkInput = {
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
 * Validate single location data
 * Pure function that validates location structure
 */
export const validateLocationData = (
  data: LocationBulkInput
): { success: boolean; data?: LocationBulkInput; error?: { issues: Array<{ message: string }> } } => {
  const errors: Array<{ message: string }> = [];

  // Validate name field
  if (!data.name || typeof data.name !== 'string') {
    errors.push({ message: 'Name is required and must be a string' });
  } else if (data.name.trim().length === 0) {
    errors.push({ message: 'Name cannot be empty' });
  } else if (data.name.trim().length > 100) {
    errors.push({ message: 'Name cannot exceed 100 characters' });
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
 * Bulk insert locations into database
 * Handles duplicates gracefully and returns detailed results
 */
export const bulkInsertLocations = async (
  data: LocationBulkInput[]
): Promise<BulkInsertResult<LocationBulkInput>> => {
  await connectDB();

  const inserted: LocationBulkInput[] = [];
  const failed: Array<{
    data: LocationBulkInput;
    error: string;
    rowNumber: number;
  }> = [];

  // Process each location individually to handle duplicates
  for (let i = 0; i < data.length; i++) {
    const locationData = data[i];
    try {
      // Check if location already exists by name or slug
      const existing = await Location.findOne({
        $or: [
          { name: locationData.name },
          { slug: locationData.slug },
        ],
      });

      if (existing) {
        failed.push({
          data: locationData,
          error: 'Location with this name or slug already exists',
          rowNumber: i + 1,
        });
        continue;
      }

      // Insert new location
      await Location.create(locationData);
      inserted.push(locationData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      failed.push({
        data: locationData,
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
 * Get expected CSV headers for Location module
 */
export const getLocationHeaders = (): string[] => {
  return ['name'];
};

/**
 * Get header mapping for Location module
 * Maps CSV headers to database field names
 */
export const getLocationHeaderMapping = (): Record<string, string> => {
  return {
    name: 'name',
    Name: 'name',
    NAME: 'name',
    'Location Name': 'name',
    'location name': 'name',
    slug: 'slug',
    Slug: 'slug',
    SLUG: 'slug',
  };
};
