// Locale configuration to handle missing './en' module error
export const localeConfig = {
  defaultLocale: 'es',
  locales: ['es', 'en'],
  fallbackLocale: 'es'
};

// Export a default locale object to satisfy any library that expects it
export const en = {
  // Add any English translations if needed
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success'
  }
};

// Default export for libraries that import './en'
export default en; 