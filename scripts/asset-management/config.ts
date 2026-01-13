/**
 * Asset Management System - Configuration
 *
 * Configure your Teable instance connection here.
 * Get your API token from: https://your-teable-instance/settings/personal-access-token
 */

export const CONFIG = {
  // Teable API base URL
  baseUrl: process.env.TEABLE_API_URL || 'https://teable.theraw.com.my',

  // API Access Token (create at /settings/personal-access-token)
  apiToken: process.env.TEABLE_API_TOKEN || 'YOUR_API_TOKEN_HERE',

  // Space ID where the base will be created
  // Get this from the URL when viewing your space: /space/{spaceId}
  spaceId: process.env.TEABLE_SPACE_ID || 'YOUR_SPACE_ID_HERE',

  // Base name for the Asset Management system
  baseName: 'Asset Management System',

  // Optional: Existing base ID if you want to add tables to existing base
  existingBaseId: process.env.TEABLE_BASE_ID || null,
};

// API Headers
export const getHeaders = () => ({
  'Authorization': `Bearer ${CONFIG.apiToken}`,
  'Content-Type': 'application/json',
});

// API Endpoints
export const ENDPOINTS = {
  // Base operations
  createBase: '/api/base',
  getBase: (baseId: string) => `/api/base/${baseId}`,

  // Table operations
  createTable: (baseId: string) => `/api/base/${baseId}/table`,
  getTable: (tableId: string) => `/api/table/${tableId}`,
  getTables: (baseId: string) => `/api/base/${baseId}/table`,

  // Field operations
  createField: (tableId: string) => `/api/table/${tableId}/field`,
  getFields: (tableId: string) => `/api/table/${tableId}/field`,
  updateField: (tableId: string, fieldId: string) => `/api/table/${tableId}/field/${fieldId}`,

  // View operations
  createView: (tableId: string) => `/api/table/${tableId}/view`,
  getViews: (tableId: string) => `/api/table/${tableId}/view`,

  // Record operations
  createRecords: (tableId: string) => `/api/table/${tableId}/record`,
  getRecords: (tableId: string) => `/api/table/${tableId}/record`,
  updateRecords: (tableId: string) => `/api/table/${tableId}/record`,

  // Access token
  createAccessToken: '/api/access-token',
};

// Field Types
export const FieldType = {
  SingleLineText: 'singleLineText',
  LongText: 'longText',
  Number: 'number',
  SingleSelect: 'singleSelect',
  MultipleSelect: 'multipleSelect',
  Date: 'date',
  Checkbox: 'checkbox',
  Rating: 'rating',
  Attachment: 'attachment',
  User: 'user',
  Link: 'link',
  Formula: 'formula',
  Rollup: 'rollup',
  Lookup: 'lookup',
  AutoNumber: 'autoNumber',
  CreatedTime: 'createdTime',
  LastModifiedTime: 'lastModifiedTime',
  CreatedBy: 'createdBy',
  LastModifiedBy: 'lastModifiedBy',
  Button: 'button',
} as const;

// View Types
export const ViewType = {
  Grid: 'grid',
  Kanban: 'kanban',
  Form: 'form',
  Calendar: 'calendar',
  Gallery: 'gallery',
} as const;
