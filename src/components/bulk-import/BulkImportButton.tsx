'use client';

/**
 * Bulk Import Button Component
 * Trigger button that opens the bulk import modal
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { BulkImportModal } from './BulkImportModal';
import type { BulkImportResponse } from '@/lib/client/bulkImportClient';

type BulkImportButtonProps = {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  module?: 'dorks' | 'categories' | 'locations';
  onSuccess?: (result: BulkImportResponse) => void;
};

export function BulkImportButton({
  variant = 'default',
  size = 'default',
  className,
  module,
  onSuccess,
}: BulkImportButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleSuccess = (result: BulkImportResponse) => {
    // Call parent callback if provided
    if (onSuccess) {
      onSuccess(result);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setModalOpen(true)}
      >
        <Upload className="mr-2 h-4 w-4" />
        Bulk Import
      </Button>

      <BulkImportModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultModule={module}
        onSuccess={handleSuccess}
      />
    </>
  );
}
