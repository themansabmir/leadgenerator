/**
 * CSV Template Generator
 * Utility functions to generate CSV templates for bulk import
 */

type ModuleName = 'dorks' | 'categories' | 'locations';

type TemplateConfig = {
  headers: string[];
  sampleData: string[][];
};

/**
 * Get template configuration for each module
 */
const getTemplateConfig = (module: ModuleName): TemplateConfig => {
  switch (module) {
    case 'dorks':
      return {
        headers: ['query'],
        sampleData: [
          ['site:example.com inurl:contact'],
          ['intitle:"index of" password'],
          ['filetype:pdf confidential'],
        ],
      };

    case 'categories':
      return {
        headers: ['name', 'slug'],
        sampleData: [
          ['Restaurant', 'restaurant'],
          ['Technology', 'technology'],
          ['Healthcare', 'healthcare'],
        ],
      };

    case 'locations':
      return {
        headers: ['name', 'slug'],
        sampleData: [
          ['New York', 'new-york'],
          ['Los Angeles', 'los-angeles'],
          ['Chicago', 'chicago'],
        ],
      };
  }
};

/**
 * Convert array data to CSV string
 */
const arrayToCSV = (data: string[][]): string => {
  return data
    .map((row) =>
      row
        .map((cell) => {
          // Escape quotes and wrap in quotes if contains comma or quote
          if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        })
        .join(',')
    )
    .join('\n');
};

/**
 * Generate CSV template for a module
 */
export const generateCSVTemplate = (module: ModuleName): string => {
  const config = getTemplateConfig(module);
  const csvData = [config.headers, ...config.sampleData];
  return arrayToCSV(csvData);
};

/**
 * Download CSV template as a file
 */
export const downloadCSVTemplate = (module: ModuleName): void => {
  const csv = generateCSVTemplate(module);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${module}-template.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

/**
 * Get module display name
 */
export const getModuleDisplayName = (module: ModuleName): string => {
  const names: Record<ModuleName, string> = {
    dorks: 'Dorks',
    categories: 'Categories',
    locations: 'Locations',
  };
  return names[module];
};
