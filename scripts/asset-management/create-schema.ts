/**
 * Asset Management System - Schema Creation Script
 *
 * This script creates all 9 tables for the Enterprise Asset Management System
 * using Teable's REST API.
 *
 * Usage:
 *   1. Configure config.ts with your API token and space ID
 *   2. Run: npx ts-node create-schema.ts
 *
 * Tables created (in order):
 *   1. Categories
 *   2. Vendors
 *   3. Employees
 *   4. Assets
 *   5. Asset Assignments
 *   6. Asset Requests
 *   7. Maintenance Records
 *   8. Software Licenses
 *   9. Software License Assignments
 */

import { CONFIG, getHeaders, ENDPOINTS, FieldType, ViewType } from './config';

// Store created table IDs for linking
const tableIds: Record<string, string> = {};
const fieldIds: Record<string, Record<string, string>> = {};

// HTTP client
async function apiRequest(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  endpoint: string,
  body?: unknown
): Promise<unknown> {
  const url = `${CONFIG.baseUrl}${endpoint}`;

  const response = await fetch(url, {
    method,
    headers: getHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error ${response.status}: ${error}`);
  }

  return response.json();
}

// Delay helper
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================================
// TABLE DEFINITIONS
// ============================================================================

/**
 * 1. Categories Table
 */
const categoriesSchema = {
  name: 'Categories',
  fields: [
    {
      name: 'Category Name',
      type: FieldType.SingleLineText,
      options: {},
    },
    {
      name: 'Description',
      type: FieldType.LongText,
    },
    {
      name: 'Depreciation Method',
      type: FieldType.SingleSelect,
      options: {
        choices: [
          { name: 'Straight Line', color: 'blue' },
          { name: 'Declining Balance', color: 'green' },
          { name: 'No Depreciation', color: 'gray' },
        ],
      },
    },
    {
      name: 'Depreciation Rate (%)',
      type: FieldType.Number,
      options: {
        precision: 2,
      },
    },
    {
      name: 'Useful Life (Years)',
      type: FieldType.Number,
      options: {
        precision: 0,
      },
    },
    {
      name: 'Approval Threshold ($)',
      type: FieldType.Number,
      options: {
        precision: 2,
        formatting: { type: 'currency', symbol: '$' },
      },
    },
    {
      name: 'Active',
      type: FieldType.Checkbox,
    },
    {
      name: 'Created Date',
      type: FieldType.CreatedTime,
    },
  ],
  views: [
    { name: 'All Categories', type: ViewType.Grid },
    { name: 'Active Categories', type: ViewType.Grid },
  ],
};

/**
 * 2. Vendors Table
 */
const vendorsSchema = {
  name: 'Vendors',
  fields: [
    {
      name: 'Vendor Name',
      type: FieldType.SingleLineText,
    },
    {
      name: 'Vendor Type',
      type: FieldType.MultipleSelect,
      options: {
        choices: [
          { name: 'Hardware Supplier', color: 'blue' },
          { name: 'Software Vendor', color: 'purple' },
          { name: 'Furniture Supplier', color: 'brown' },
          { name: 'Maintenance Provider', color: 'orange' },
          { name: 'Reseller', color: 'teal' },
        ],
      },
    },
    {
      name: 'Primary Contact',
      type: FieldType.SingleLineText,
    },
    {
      name: 'Contact Email',
      type: FieldType.SingleLineText,
    },
    {
      name: 'Contact Phone',
      type: FieldType.SingleLineText,
    },
    {
      name: 'Address',
      type: FieldType.LongText,
    },
    {
      name: 'Website',
      type: FieldType.SingleLineText,
    },
    {
      name: 'Payment Terms',
      type: FieldType.SingleSelect,
      options: {
        choices: [
          { name: 'Net 15', color: 'green' },
          { name: 'Net 30', color: 'blue' },
          { name: 'Net 45', color: 'yellow' },
          { name: 'Net 60', color: 'orange' },
          { name: 'Prepaid', color: 'red' },
        ],
      },
    },
    {
      name: 'Contract Status',
      type: FieldType.SingleSelect,
      options: {
        choices: [
          { name: 'Active', color: 'green' },
          { name: 'Under Review', color: 'yellow' },
          { name: 'Expired', color: 'red' },
          { name: 'Terminated', color: 'gray' },
        ],
      },
    },
    {
      name: 'Contract Expiry Date',
      type: FieldType.Date,
    },
    {
      name: 'Rating',
      type: FieldType.Rating,
      options: {
        max: 5,
      },
    },
    {
      name: 'Notes',
      type: FieldType.LongText,
    },
    {
      name: 'Created Date',
      type: FieldType.CreatedTime,
    },
    {
      name: 'Last Modified',
      type: FieldType.LastModifiedTime,
    },
  ],
  views: [
    { name: 'All Vendors', type: ViewType.Grid },
    { name: 'Active Contracts', type: ViewType.Grid },
    { name: 'By Type', type: ViewType.Kanban },
  ],
};

/**
 * 3. Employees Table
 */
const employeesSchema = {
  name: 'Employees',
  fields: [
    {
      name: 'Employee ID',
      type: FieldType.SingleLineText,
    },
    {
      name: 'Full Name',
      type: FieldType.SingleLineText,
    },
    {
      name: 'First Name',
      type: FieldType.SingleLineText,
    },
    {
      name: 'Last Name',
      type: FieldType.SingleLineText,
    },
    {
      name: 'Email',
      type: FieldType.SingleLineText,
    },
    {
      name: 'Phone',
      type: FieldType.SingleLineText,
    },
    {
      name: 'Department',
      type: FieldType.SingleSelect,
      options: {
        choices: [
          { name: 'Engineering', color: 'blue' },
          { name: 'Product', color: 'purple' },
          { name: 'Design', color: 'pink' },
          { name: 'Marketing', color: 'orange' },
          { name: 'Sales', color: 'green' },
          { name: 'Finance', color: 'yellow' },
          { name: 'HR', color: 'teal' },
          { name: 'Operations', color: 'gray' },
          { name: 'IT', color: 'cyan' },
          { name: 'Legal', color: 'brown' },
          { name: 'Executive', color: 'red' },
        ],
      },
    },
    {
      name: 'Job Title',
      type: FieldType.SingleLineText,
    },
    {
      name: 'Location',
      type: FieldType.SingleSelect,
      options: {
        choices: [
          { name: 'HQ - Singapore', color: 'blue' },
          { name: 'Office - KL', color: 'green' },
          { name: 'Office - Jakarta', color: 'purple' },
          { name: 'Remote', color: 'gray' },
        ],
      },
    },
    {
      name: 'Building/Floor',
      type: FieldType.SingleLineText,
    },
    {
      name: 'Employment Status',
      type: FieldType.SingleSelect,
      options: {
        choices: [
          { name: 'Active', color: 'green' },
          { name: 'On Leave', color: 'yellow' },
          { name: 'Terminated', color: 'red' },
          { name: 'Contractor', color: 'blue' },
          { name: 'Intern', color: 'purple' },
        ],
      },
    },
    {
      name: 'Start Date',
      type: FieldType.Date,
    },
    {
      name: 'End Date',
      type: FieldType.Date,
    },
    {
      name: 'Can Approve Requests',
      type: FieldType.Checkbox,
    },
    {
      name: 'Approval Limit ($)',
      type: FieldType.Number,
      options: {
        precision: 2,
        formatting: { type: 'currency', symbol: '$' },
      },
    },
    {
      name: 'Profile Photo',
      type: FieldType.Attachment,
    },
    {
      name: 'Created Date',
      type: FieldType.CreatedTime,
    },
    {
      name: 'Last Modified',
      type: FieldType.LastModifiedTime,
    },
  ],
  views: [
    { name: 'All Employees', type: ViewType.Grid },
    { name: 'Active Employees', type: ViewType.Grid },
    { name: 'By Department', type: ViewType.Kanban },
    { name: 'Approvers', type: ViewType.Grid },
    { name: 'Employee Directory', type: ViewType.Gallery },
  ],
};

/**
 * 4. Assets Table (Main)
 */
const assetsSchema = {
  name: 'Assets',
  fields: [
    {
      name: 'Asset Tag',
      type: FieldType.SingleLineText,
    },
    {
      name: 'Asset Name',
      type: FieldType.SingleLineText,
    },
    {
      name: 'Asset Type',
      type: FieldType.SingleSelect,
      options: {
        choices: [
          { name: 'Laptop', color: 'blue' },
          { name: 'Desktop', color: 'blue' },
          { name: 'Monitor', color: 'cyan' },
          { name: 'Keyboard', color: 'gray' },
          { name: 'Mouse', color: 'gray' },
          { name: 'Headset', color: 'purple' },
          { name: 'Mobile Phone', color: 'green' },
          { name: 'Tablet', color: 'teal' },
          { name: 'Server', color: 'red' },
          { name: 'Network Equipment', color: 'orange' },
          { name: 'Printer', color: 'brown' },
          { name: 'Desk', color: 'yellow' },
          { name: 'Chair', color: 'yellow' },
          { name: 'Storage Cabinet', color: 'yellow' },
          { name: 'Conference Equipment', color: 'pink' },
          { name: 'Other', color: 'gray' },
        ],
      },
    },
    {
      name: 'Brand',
      type: FieldType.SingleLineText,
    },
    {
      name: 'Model',
      type: FieldType.SingleLineText,
    },
    {
      name: 'Serial Number',
      type: FieldType.SingleLineText,
    },
    {
      name: 'Status',
      type: FieldType.SingleSelect,
      options: {
        choices: [
          { name: 'Available', color: 'green' },
          { name: 'Assigned', color: 'blue' },
          { name: 'In Maintenance', color: 'yellow' },
          { name: 'Reserved', color: 'purple' },
          { name: 'Lost', color: 'red' },
          { name: 'Stolen', color: 'red' },
          { name: 'Disposed', color: 'gray' },
          { name: 'Retired', color: 'gray' },
        ],
      },
    },
    {
      name: 'Condition',
      type: FieldType.SingleSelect,
      options: {
        choices: [
          { name: 'New', color: 'green' },
          { name: 'Excellent', color: 'teal' },
          { name: 'Good', color: 'blue' },
          { name: 'Fair', color: 'yellow' },
          { name: 'Poor', color: 'orange' },
          { name: 'Non-Functional', color: 'red' },
        ],
      },
    },
    {
      name: 'Purchase Date',
      type: FieldType.Date,
    },
    {
      name: 'Purchase Price ($)',
      type: FieldType.Number,
      options: {
        precision: 2,
        formatting: { type: 'currency', symbol: '$' },
      },
    },
    {
      name: 'PO Number',
      type: FieldType.SingleLineText,
    },
    {
      name: 'Invoice Number',
      type: FieldType.SingleLineText,
    },
    {
      name: 'Warranty Start Date',
      type: FieldType.Date,
    },
    {
      name: 'Warranty Expiry Date',
      type: FieldType.Date,
    },
    {
      name: 'Location',
      type: FieldType.SingleSelect,
      options: {
        choices: [
          { name: 'HQ - Singapore', color: 'blue' },
          { name: 'Office - KL', color: 'green' },
          { name: 'Office - Jakarta', color: 'purple' },
          { name: 'Storage - HQ', color: 'yellow' },
          { name: 'Remote - Employee', color: 'gray' },
          { name: 'In Transit', color: 'cyan' },
        ],
      },
    },
    {
      name: 'Physical Location',
      type: FieldType.SingleLineText,
    },
    {
      name: 'Specifications',
      type: FieldType.LongText,
    },
    {
      name: 'Configuration Notes',
      type: FieldType.LongText,
    },
    {
      name: 'Notes',
      type: FieldType.LongText,
    },
    {
      name: 'Photos',
      type: FieldType.Attachment,
    },
    {
      name: 'Documents',
      type: FieldType.Attachment,
    },
    {
      name: 'Disposal Date',
      type: FieldType.Date,
    },
    {
      name: 'Disposal Method',
      type: FieldType.SingleSelect,
      options: {
        choices: [
          { name: 'Sold', color: 'green' },
          { name: 'Donated', color: 'blue' },
          { name: 'Recycled', color: 'teal' },
          { name: 'Scrapped', color: 'gray' },
          { name: 'Returned to Vendor', color: 'purple' },
          { name: 'Trade-In', color: 'orange' },
        ],
      },
    },
    {
      name: 'Disposal Value ($)',
      type: FieldType.Number,
      options: {
        precision: 2,
        formatting: { type: 'currency', symbol: '$' },
      },
    },
    {
      name: 'Created By',
      type: FieldType.CreatedBy,
    },
    {
      name: 'Created Date',
      type: FieldType.CreatedTime,
    },
    {
      name: 'Last Modified By',
      type: FieldType.LastModifiedBy,
    },
    {
      name: 'Last Modified',
      type: FieldType.LastModifiedTime,
    },
  ],
  views: [
    { name: 'All Assets', type: ViewType.Grid },
    { name: 'Available Assets', type: ViewType.Grid },
    { name: 'Assigned Assets', type: ViewType.Grid },
    { name: 'By Status', type: ViewType.Kanban },
    { name: 'By Type', type: ViewType.Kanban },
    { name: 'In Maintenance', type: ViewType.Grid },
    { name: 'Warranty Expiring', type: ViewType.Grid },
    { name: 'Asset Gallery', type: ViewType.Gallery },
  ],
};

/**
 * 5. Asset Assignments Table
 */
const assetAssignmentsSchema = {
  name: 'Asset Assignments',
  fields: [
    {
      name: 'Assignment Type',
      type: FieldType.SingleSelect,
      options: {
        choices: [
          { name: 'Permanent', color: 'blue' },
          { name: 'Temporary', color: 'yellow' },
          { name: 'Project-Based', color: 'purple' },
          { name: 'Loaner', color: 'orange' },
        ],
      },
    },
    {
      name: 'Status',
      type: FieldType.SingleSelect,
      options: {
        choices: [
          { name: 'Active', color: 'green' },
          { name: 'Returned', color: 'blue' },
          { name: 'Overdue', color: 'red' },
          { name: 'Lost', color: 'gray' },
        ],
      },
    },
    {
      name: 'Assigned Date',
      type: FieldType.Date,
      options: {
        time: { format: 'HH:mm' },
      },
    },
    {
      name: 'Expected Return Date',
      type: FieldType.Date,
    },
    {
      name: 'Actual Return Date',
      type: FieldType.Date,
      options: {
        time: { format: 'HH:mm' },
      },
    },
    {
      name: 'Condition at Checkout',
      type: FieldType.SingleSelect,
      options: {
        choices: [
          { name: 'New', color: 'green' },
          { name: 'Excellent', color: 'teal' },
          { name: 'Good', color: 'blue' },
          { name: 'Fair', color: 'yellow' },
          { name: 'Poor', color: 'orange' },
        ],
      },
    },
    {
      name: 'Condition at Return',
      type: FieldType.SingleSelect,
      options: {
        choices: [
          { name: 'Excellent', color: 'teal' },
          { name: 'Good', color: 'blue' },
          { name: 'Fair', color: 'yellow' },
          { name: 'Poor', color: 'orange' },
          { name: 'Damaged', color: 'red' },
        ],
      },
    },
    {
      name: 'Checkout Location',
      type: FieldType.SingleLineText,
    },
    {
      name: 'Return Location',
      type: FieldType.SingleLineText,
    },
    {
      name: 'Checkout Notes',
      type: FieldType.LongText,
    },
    {
      name: 'Return Notes',
      type: FieldType.LongText,
    },
    {
      name: 'Checkout Photos',
      type: FieldType.Attachment,
    },
    {
      name: 'Return Photos',
      type: FieldType.Attachment,
    },
    {
      name: 'Created Date',
      type: FieldType.CreatedTime,
    },
    {
      name: 'Last Modified',
      type: FieldType.LastModifiedTime,
    },
  ],
  views: [
    { name: 'Active Assignments', type: ViewType.Grid },
    { name: 'Overdue Returns', type: ViewType.Grid },
    { name: 'Assignment History', type: ViewType.Grid },
    { name: 'By Status', type: ViewType.Kanban },
  ],
};

/**
 * 6. Asset Requests Table
 */
const assetRequestsSchema = {
  name: 'Asset Requests',
  fields: [
    {
      name: 'Request Title',
      type: FieldType.SingleLineText,
    },
    {
      name: 'Request Type',
      type: FieldType.SingleSelect,
      options: {
        choices: [
          { name: 'New Asset', color: 'green' },
          { name: 'Replacement', color: 'blue' },
          { name: 'Upgrade', color: 'purple' },
          { name: 'Temporary/Loaner', color: 'yellow' },
          { name: 'Transfer', color: 'orange' },
          { name: 'Return', color: 'gray' },
        ],
      },
    },
    {
      name: 'Priority',
      type: FieldType.SingleSelect,
      options: {
        choices: [
          { name: 'Critical', color: 'red' },
          { name: 'High', color: 'orange' },
          { name: 'Medium', color: 'yellow' },
          { name: 'Low', color: 'blue' },
        ],
      },
    },
    {
      name: 'Requested Asset Type',
      type: FieldType.SingleSelect,
      options: {
        choices: [
          { name: 'Laptop', color: 'blue' },
          { name: 'Desktop', color: 'blue' },
          { name: 'Monitor', color: 'cyan' },
          { name: 'Keyboard/Mouse', color: 'gray' },
          { name: 'Headset', color: 'purple' },
          { name: 'Mobile Phone', color: 'green' },
          { name: 'Tablet', color: 'teal' },
          { name: 'Desk', color: 'yellow' },
          { name: 'Chair', color: 'yellow' },
          { name: 'Software License', color: 'pink' },
          { name: 'Other', color: 'gray' },
        ],
      },
    },
    {
      name: 'Preferred Brand/Model',
      type: FieldType.SingleLineText,
    },
    {
      name: 'Specifications Required',
      type: FieldType.LongText,
    },
    {
      name: 'Justification',
      type: FieldType.LongText,
    },
    {
      name: 'Needed By Date',
      type: FieldType.Date,
    },
    {
      name: 'Estimated Cost ($)',
      type: FieldType.Number,
      options: {
        precision: 2,
        formatting: { type: 'currency', symbol: '$' },
      },
    },
    {
      name: 'Budget Code',
      type: FieldType.SingleLineText,
    },
    {
      name: 'Status',
      type: FieldType.SingleSelect,
      options: {
        choices: [
          { name: 'Draft', color: 'gray' },
          { name: 'Submitted', color: 'blue' },
          { name: 'Pending Manager Approval', color: 'yellow' },
          { name: 'Pending IT Review', color: 'orange' },
          { name: 'Pending Finance Approval', color: 'purple' },
          { name: 'Approved', color: 'green' },
          { name: 'Rejected', color: 'red' },
          { name: 'Ordered', color: 'cyan' },
          { name: 'Fulfilled', color: 'teal' },
          { name: 'Cancelled', color: 'gray' },
        ],
      },
    },
    {
      name: 'Submitted Date',
      type: FieldType.Date,
      options: {
        time: { format: 'HH:mm' },
      },
    },
    {
      name: 'Manager Approval Date',
      type: FieldType.Date,
      options: {
        time: { format: 'HH:mm' },
      },
    },
    {
      name: 'Manager Comments',
      type: FieldType.LongText,
    },
    {
      name: 'IT Review Date',
      type: FieldType.Date,
      options: {
        time: { format: 'HH:mm' },
      },
    },
    {
      name: 'IT Comments',
      type: FieldType.LongText,
    },
    {
      name: 'IT Recommendation',
      type: FieldType.SingleSelect,
      options: {
        choices: [
          { name: 'Approve as Requested', color: 'green' },
          { name: 'Approve with Changes', color: 'yellow' },
          { name: 'Use Existing Asset', color: 'blue' },
          { name: 'Deny', color: 'red' },
        ],
      },
    },
    {
      name: 'Finance Approval Date',
      type: FieldType.Date,
      options: {
        time: { format: 'HH:mm' },
      },
    },
    {
      name: 'Finance Comments',
      type: FieldType.LongText,
    },
    {
      name: 'Final Decision',
      type: FieldType.SingleSelect,
      options: {
        choices: [
          { name: 'Approved', color: 'green' },
          { name: 'Partially Approved', color: 'yellow' },
          { name: 'Rejected', color: 'red' },
        ],
      },
    },
    {
      name: 'Rejection Reason',
      type: FieldType.LongText,
    },
    {
      name: 'PO Number',
      type: FieldType.SingleLineText,
    },
    {
      name: 'Fulfillment Date',
      type: FieldType.Date,
    },
    {
      name: 'Fulfillment Notes',
      type: FieldType.LongText,
    },
    {
      name: 'Attachments',
      type: FieldType.Attachment,
    },
    {
      name: 'Created By',
      type: FieldType.CreatedBy,
    },
    {
      name: 'Created Date',
      type: FieldType.CreatedTime,
    },
    {
      name: 'Last Modified',
      type: FieldType.LastModifiedTime,
    },
  ],
  views: [
    { name: 'All Requests', type: ViewType.Grid },
    { name: 'My Requests', type: ViewType.Grid },
    { name: 'Pending Approval', type: ViewType.Kanban },
    { name: 'By Priority', type: ViewType.Grid },
    { name: 'Request Form', type: ViewType.Form },
  ],
};

/**
 * 7. Maintenance Records Table
 */
const maintenanceRecordsSchema = {
  name: 'Maintenance Records',
  fields: [
    {
      name: 'Maintenance Type',
      type: FieldType.SingleSelect,
      options: {
        choices: [
          { name: 'Repair', color: 'red' },
          { name: 'Preventive', color: 'green' },
          { name: 'Upgrade', color: 'blue' },
          { name: 'Inspection', color: 'yellow' },
          { name: 'Cleaning', color: 'gray' },
          { name: 'Software Update', color: 'purple' },
          { name: 'Calibration', color: 'orange' },
        ],
      },
    },
    {
      name: 'Priority',
      type: FieldType.SingleSelect,
      options: {
        choices: [
          { name: 'Critical', color: 'red' },
          { name: 'High', color: 'orange' },
          { name: 'Medium', color: 'yellow' },
          { name: 'Low', color: 'blue' },
        ],
      },
    },
    {
      name: 'Issue Description',
      type: FieldType.LongText,
    },
    {
      name: 'Reported Date',
      type: FieldType.Date,
      options: {
        time: { format: 'HH:mm' },
      },
    },
    {
      name: 'Status',
      type: FieldType.SingleSelect,
      options: {
        choices: [
          { name: 'Reported', color: 'gray' },
          { name: 'Acknowledged', color: 'blue' },
          { name: 'Diagnosed', color: 'yellow' },
          { name: 'Parts Ordered', color: 'purple' },
          { name: 'In Progress', color: 'orange' },
          { name: 'Pending Vendor', color: 'cyan' },
          { name: 'Testing', color: 'teal' },
          { name: 'Completed', color: 'green' },
          { name: 'Cannot Repair', color: 'red' },
          { name: 'Cancelled', color: 'gray' },
        ],
      },
    },
    {
      name: 'Diagnosis',
      type: FieldType.LongText,
    },
    {
      name: 'Resolution',
      type: FieldType.LongText,
    },
    {
      name: 'Parts Used',
      type: FieldType.LongText,
    },
    {
      name: 'Work Started Date',
      type: FieldType.Date,
      options: {
        time: { format: 'HH:mm' },
      },
    },
    {
      name: 'Completion Date',
      type: FieldType.Date,
      options: {
        time: { format: 'HH:mm' },
      },
    },
    {
      name: 'Labor Hours',
      type: FieldType.Number,
      options: {
        precision: 2,
      },
    },
    {
      name: 'Labor Cost ($)',
      type: FieldType.Number,
      options: {
        precision: 2,
        formatting: { type: 'currency', symbol: '$' },
      },
    },
    {
      name: 'Parts Cost ($)',
      type: FieldType.Number,
      options: {
        precision: 2,
        formatting: { type: 'currency', symbol: '$' },
      },
    },
    {
      name: 'External Service Cost ($)',
      type: FieldType.Number,
      options: {
        precision: 2,
        formatting: { type: 'currency', symbol: '$' },
      },
    },
    {
      name: 'Covered Under Warranty',
      type: FieldType.Checkbox,
    },
    {
      name: 'Warranty Claim Number',
      type: FieldType.SingleLineText,
    },
    {
      name: 'Helpdesk Ticket',
      type: FieldType.SingleLineText,
    },
    {
      name: 'Root Cause',
      type: FieldType.SingleSelect,
      options: {
        choices: [
          { name: 'Normal Wear', color: 'gray' },
          { name: 'User Error', color: 'yellow' },
          { name: 'Manufacturing Defect', color: 'red' },
          { name: 'Software Issue', color: 'purple' },
          { name: 'Power/Electrical', color: 'orange' },
          { name: 'Physical Damage', color: 'brown' },
          { name: 'Environmental', color: 'teal' },
          { name: 'Unknown', color: 'gray' },
        ],
      },
    },
    {
      name: 'Asset Condition After',
      type: FieldType.SingleSelect,
      options: {
        choices: [
          { name: 'Excellent', color: 'green' },
          { name: 'Good', color: 'blue' },
          { name: 'Fair', color: 'yellow' },
          { name: 'Poor', color: 'orange' },
          { name: 'Non-Functional', color: 'red' },
        ],
      },
    },
    {
      name: 'Follow-up Required',
      type: FieldType.Checkbox,
    },
    {
      name: 'Follow-up Date',
      type: FieldType.Date,
    },
    {
      name: 'Follow-up Notes',
      type: FieldType.LongText,
    },
    {
      name: 'Photos Before',
      type: FieldType.Attachment,
    },
    {
      name: 'Photos After',
      type: FieldType.Attachment,
    },
    {
      name: 'Documents',
      type: FieldType.Attachment,
    },
    {
      name: 'Created Date',
      type: FieldType.CreatedTime,
    },
    {
      name: 'Last Modified',
      type: FieldType.LastModifiedTime,
    },
  ],
  views: [
    { name: 'All Maintenance', type: ViewType.Grid },
    { name: 'Open Issues', type: ViewType.Kanban },
    { name: 'By Priority', type: ViewType.Grid },
    { name: 'Warranty Claims', type: ViewType.Grid },
    { name: 'Completed', type: ViewType.Grid },
    { name: 'Maintenance Calendar', type: ViewType.Calendar },
  ],
};

/**
 * 8. Software Licenses Table
 */
const softwareLicensesSchema = {
  name: 'Software Licenses',
  fields: [
    {
      name: 'Software Name',
      type: FieldType.SingleLineText,
    },
    {
      name: 'License Type',
      type: FieldType.SingleSelect,
      options: {
        choices: [
          { name: 'SaaS Subscription', color: 'blue' },
          { name: 'Perpetual', color: 'green' },
          { name: 'Annual Subscription', color: 'purple' },
          { name: 'Monthly Subscription', color: 'cyan' },
          { name: 'Floating/Concurrent', color: 'orange' },
          { name: 'Site License', color: 'teal' },
          { name: 'Per-Device', color: 'yellow' },
          { name: 'Open Source', color: 'gray' },
          { name: 'Freeware', color: 'gray' },
        ],
      },
    },
    {
      name: 'License Model',
      type: FieldType.SingleSelect,
      options: {
        choices: [
          { name: 'Per User', color: 'blue' },
          { name: 'Per Device', color: 'green' },
          { name: 'Concurrent Users', color: 'purple' },
          { name: 'Enterprise/Unlimited', color: 'orange' },
          { name: 'Tiered', color: 'yellow' },
        ],
      },
    },
    {
      name: 'Category',
      type: FieldType.SingleSelect,
      options: {
        choices: [
          { name: 'Productivity', color: 'blue' },
          { name: 'Development Tools', color: 'purple' },
          { name: 'Design', color: 'pink' },
          { name: 'Communication', color: 'green' },
          { name: 'Security', color: 'red' },
          { name: 'Database', color: 'orange' },
          { name: 'Analytics', color: 'teal' },
          { name: 'Infrastructure', color: 'gray' },
          { name: 'HR/Finance', color: 'yellow' },
          { name: 'Other', color: 'gray' },
        ],
      },
    },
    {
      name: 'Version',
      type: FieldType.SingleLineText,
    },
    {
      name: 'License Key',
      type: FieldType.SingleLineText,
    },
    {
      name: 'Status',
      type: FieldType.SingleSelect,
      options: {
        choices: [
          { name: 'Active', color: 'green' },
          { name: 'Expiring Soon', color: 'yellow' },
          { name: 'Expired', color: 'red' },
          { name: 'Cancelled', color: 'gray' },
          { name: 'Pending Renewal', color: 'orange' },
          { name: 'Trial', color: 'purple' },
        ],
      },
    },
    {
      name: 'Total Seats',
      type: FieldType.Number,
      options: {
        precision: 0,
      },
    },
    {
      name: 'Used Seats',
      type: FieldType.Number,
      options: {
        precision: 0,
      },
    },
    {
      name: 'Purchase Date',
      type: FieldType.Date,
    },
    {
      name: 'Start Date',
      type: FieldType.Date,
    },
    {
      name: 'Expiry Date',
      type: FieldType.Date,
    },
    {
      name: 'Renewal Date',
      type: FieldType.Date,
    },
    {
      name: 'Billing Cycle',
      type: FieldType.SingleSelect,
      options: {
        choices: [
          { name: 'Monthly', color: 'blue' },
          { name: 'Quarterly', color: 'cyan' },
          { name: 'Annual', color: 'green' },
          { name: 'Multi-Year', color: 'purple' },
          { name: 'One-Time', color: 'gray' },
        ],
      },
    },
    {
      name: 'Cost Per Seat ($)',
      type: FieldType.Number,
      options: {
        precision: 2,
        formatting: { type: 'currency', symbol: '$' },
      },
    },
    {
      name: 'Annual Cost ($)',
      type: FieldType.Number,
      options: {
        precision: 2,
        formatting: { type: 'currency', symbol: '$' },
      },
    },
    {
      name: 'Contract Number',
      type: FieldType.SingleLineText,
    },
    {
      name: 'PO Number',
      type: FieldType.SingleLineText,
    },
    {
      name: 'Departments',
      type: FieldType.MultipleSelect,
      options: {
        choices: [
          { name: 'All Departments', color: 'gray' },
          { name: 'Engineering', color: 'blue' },
          { name: 'Product', color: 'purple' },
          { name: 'Design', color: 'pink' },
          { name: 'Marketing', color: 'orange' },
          { name: 'Sales', color: 'green' },
          { name: 'Finance', color: 'yellow' },
          { name: 'HR', color: 'teal' },
          { name: 'IT', color: 'cyan' },
        ],
      },
    },
    {
      name: 'SSO Enabled',
      type: FieldType.Checkbox,
    },
    {
      name: 'Access URL',
      type: FieldType.SingleLineText,
    },
    {
      name: 'Support Contact',
      type: FieldType.SingleLineText,
    },
    {
      name: 'Notes',
      type: FieldType.LongText,
    },
    {
      name: 'Contract Documents',
      type: FieldType.Attachment,
    },
    {
      name: 'Created Date',
      type: FieldType.CreatedTime,
    },
    {
      name: 'Last Modified',
      type: FieldType.LastModifiedTime,
    },
  ],
  views: [
    { name: 'All Licenses', type: ViewType.Grid },
    { name: 'Active Licenses', type: ViewType.Grid },
    { name: 'Expiring Soon', type: ViewType.Grid },
    { name: 'By Category', type: ViewType.Kanban },
    { name: 'Low Seats', type: ViewType.Grid },
    { name: 'Renewal Calendar', type: ViewType.Calendar },
  ],
};

/**
 * 9. Software License Assignments Table
 */
const licenseAssignmentsSchema = {
  name: 'License Assignments',
  fields: [
    {
      name: 'Status',
      type: FieldType.SingleSelect,
      options: {
        choices: [
          { name: 'Active', color: 'green' },
          { name: 'Pending Activation', color: 'yellow' },
          { name: 'Suspended', color: 'orange' },
          { name: 'Revoked', color: 'red' },
        ],
      },
    },
    {
      name: 'Assignment Date',
      type: FieldType.Date,
    },
    {
      name: 'Revocation Date',
      type: FieldType.Date,
    },
    {
      name: 'License Role',
      type: FieldType.SingleSelect,
      options: {
        choices: [
          { name: 'User', color: 'blue' },
          { name: 'Admin', color: 'purple' },
          { name: 'Viewer', color: 'gray' },
          { name: 'Power User', color: 'green' },
        ],
      },
    },
    {
      name: 'Last Login',
      type: FieldType.Date,
      options: {
        time: { format: 'HH:mm' },
      },
    },
    {
      name: 'Usage Notes',
      type: FieldType.LongText,
    },
    {
      name: 'Created Date',
      type: FieldType.CreatedTime,
    },
    {
      name: 'Last Modified',
      type: FieldType.LastModifiedTime,
    },
  ],
  views: [
    { name: 'Active Assignments', type: ViewType.Grid },
    { name: 'By License', type: ViewType.Grid },
    { name: 'By Employee', type: ViewType.Grid },
    { name: 'Pending Activation', type: ViewType.Grid },
  ],
};

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function createTable(
  baseId: string,
  schema: { name: string; fields: unknown[]; views?: unknown[] }
) {
  console.log(`Creating table: ${schema.name}...`);

  const payload = {
    name: schema.name,
    fields: schema.fields,
    fieldKeyType: 'name',
  };

  const result = (await apiRequest('POST', ENDPOINTS.createTable(baseId), payload)) as {
    id: string;
    fields: { id: string; name: string }[];
  };

  tableIds[schema.name] = result.id;
  fieldIds[schema.name] = {};

  // Store field IDs
  result.fields.forEach((field: { id: string; name: string }) => {
    fieldIds[schema.name][field.name] = field.id;
  });

  console.log(`  ✓ Created table ${schema.name} (${result.id})`);

  // Create additional views
  if (schema.views && schema.views.length > 1) {
    for (const view of schema.views.slice(1)) {
      // Skip first view (created by default)
      await delay(200);
      await apiRequest('POST', ENDPOINTS.createView(result.id), view);
      console.log(`  ✓ Created view: ${(view as { name: string }).name}`);
    }
  }

  return result;
}

async function createLinkField(
  sourceTableName: string,
  targetTableName: string,
  fieldName: string,
  relationship: 'oneOne' | 'oneMany' | 'manyOne' | 'manyMany' = 'manyOne'
) {
  const sourceTableId = tableIds[sourceTableName];
  const targetTableId = tableIds[targetTableName];

  if (!sourceTableId || !targetTableId) {
    console.error(`  ✗ Cannot create link: Missing table ID for ${sourceTableName} or ${targetTableName}`);
    return;
  }

  const payload = {
    name: fieldName,
    type: FieldType.Link,
    options: {
      relationship,
      foreignTableId: targetTableId,
    },
  };

  try {
    const result = (await apiRequest('POST', ENDPOINTS.createField(sourceTableId), payload)) as {
      id: string;
    };
    fieldIds[sourceTableName][fieldName] = result.id;
    console.log(`  ✓ Created link field: ${sourceTableName}.${fieldName} → ${targetTableName}`);
  } catch (error) {
    console.error(`  ✗ Failed to create link field: ${sourceTableName}.${fieldName}`, error);
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Asset Management System - Schema Creation');
  console.log('='.repeat(60));
  console.log('');

  // Validate configuration
  if (CONFIG.apiToken === 'YOUR_API_TOKEN_HERE') {
    console.error('ERROR: Please configure your API token in config.ts');
    process.exit(1);
  }

  if (CONFIG.spaceId === 'YOUR_SPACE_ID_HERE' && !CONFIG.existingBaseId) {
    console.error('ERROR: Please configure your space ID in config.ts');
    process.exit(1);
  }

  let baseId = CONFIG.existingBaseId;

  // Create or use existing base
  if (!baseId) {
    console.log('Creating new base...');
    const base = (await apiRequest('POST', ENDPOINTS.createBase, {
      name: CONFIG.baseName,
      spaceId: CONFIG.spaceId,
    })) as { id: string };
    baseId = base.id;
    console.log(`✓ Created base: ${CONFIG.baseName} (${baseId})`);
  } else {
    console.log(`Using existing base: ${baseId}`);
  }

  console.log('');
  console.log('Creating tables...');
  console.log('-'.repeat(60));

  // Create tables in dependency order
  const schemas = [
    categoriesSchema,
    vendorsSchema,
    employeesSchema,
    assetsSchema,
    assetAssignmentsSchema,
    assetRequestsSchema,
    maintenanceRecordsSchema,
    softwareLicensesSchema,
    licenseAssignmentsSchema,
  ];

  for (const schema of schemas) {
    await createTable(baseId, schema);
    await delay(500); // Rate limiting
  }

  console.log('');
  console.log('Creating relationships (link fields)...');
  console.log('-'.repeat(60));

  // Create link fields for relationships
  await delay(500);

  // Assets → Category
  await createLinkField('Assets', 'Categories', 'Category', 'manyOne');
  await delay(300);

  // Assets → Vendor
  await createLinkField('Assets', 'Vendors', 'Vendor', 'manyOne');
  await delay(300);

  // Assets → Employee (Current Assignee)
  await createLinkField('Assets', 'Employees', 'Current Assignee', 'manyOne');
  await delay(300);

  // Asset Assignments → Asset
  await createLinkField('Asset Assignments', 'Assets', 'Asset', 'manyOne');
  await delay(300);

  // Asset Assignments → Employee
  await createLinkField('Asset Assignments', 'Employees', 'Employee', 'manyOne');
  await delay(300);

  // Asset Assignments → Employee (Approved By)
  await createLinkField('Asset Assignments', 'Employees', 'Approved By', 'manyOne');
  await delay(300);

  // Asset Requests → Employee (Requester)
  await createLinkField('Asset Requests', 'Employees', 'Requester', 'manyOne');
  await delay(300);

  // Asset Requests → Category
  await createLinkField('Asset Requests', 'Categories', 'Requested Category', 'manyOne');
  await delay(300);

  // Asset Requests → Employee (Current Approver)
  await createLinkField('Asset Requests', 'Employees', 'Current Approver', 'manyOne');
  await delay(300);

  // Asset Requests → Employee (Manager Approver)
  await createLinkField('Asset Requests', 'Employees', 'Manager Approver', 'manyOne');
  await delay(300);

  // Asset Requests → Assets (Assigned Asset)
  await createLinkField('Asset Requests', 'Assets', 'Assigned Asset', 'manyOne');
  await delay(300);

  // Maintenance Records → Asset
  await createLinkField('Maintenance Records', 'Assets', 'Asset', 'manyOne');
  await delay(300);

  // Maintenance Records → Employee (Reported By)
  await createLinkField('Maintenance Records', 'Employees', 'Reported By', 'manyOne');
  await delay(300);

  // Maintenance Records → Employee (Assigned Technician)
  await createLinkField('Maintenance Records', 'Employees', 'Assigned Technician', 'manyOne');
  await delay(300);

  // Maintenance Records → Vendor (External Vendor)
  await createLinkField('Maintenance Records', 'Vendors', 'External Vendor', 'manyOne');
  await delay(300);

  // Software Licenses → Vendor
  await createLinkField('Software Licenses', 'Vendors', 'Vendor', 'manyOne');
  await delay(300);

  // Software Licenses → Employee (License Owner)
  await createLinkField('Software Licenses', 'Employees', 'License Owner', 'manyOne');
  await delay(300);

  // License Assignments → Software License
  await createLinkField('License Assignments', 'Software Licenses', 'License', 'manyOne');
  await delay(300);

  // License Assignments → Employee
  await createLinkField('License Assignments', 'Employees', 'Employee', 'manyOne');
  await delay(300);

  // Employees → Employee (Manager - self-referential)
  await createLinkField('Employees', 'Employees', 'Manager', 'manyOne');

  console.log('');
  console.log('='.repeat(60));
  console.log('Schema creation complete!');
  console.log('='.repeat(60));
  console.log('');
  console.log('Summary:');
  console.log(`  Base ID: ${baseId}`);
  console.log(`  Tables created: ${Object.keys(tableIds).length}`);
  console.log('');
  console.log('Access your Asset Management System at:');
  console.log(`  ${CONFIG.baseUrl}/base/${baseId}`);
  console.log('');
  console.log('Table IDs:');
  Object.entries(tableIds).forEach(([name, id]) => {
    console.log(`  ${name}: ${id}`);
  });
}

// Run
main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
