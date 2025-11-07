/**
 * Inngest API Route
 * Serves the Inngest API for background job processing
 */

import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest/client';
import { executeQuery } from '@/lib/inngest/functions';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    executeQuery,
  ],
});
