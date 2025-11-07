/**
 * Inngest Client
 * Centralized client for background job processing
 */

import { Inngest } from 'inngest';

export const inngest = new Inngest({ 
  id: 'lead-harvester',
  name: 'Lead Harvester'
});
