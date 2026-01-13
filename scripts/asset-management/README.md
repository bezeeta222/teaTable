# Enterprise Asset Management System

A comprehensive asset management solution built on Teable, supporting full lifecycle tracking for IT equipment, office furniture, and software licenses.

## Quick Start

### Option A: Automated Setup (API)

1. **Get API Token**
   - Go to: `https://teable.theraw.com.my/setting/personal-access-token`
   - Create a new token with full access

2. **Configure**
   ```bash
   cd scripts/asset-management

   # Edit config.ts with your credentials:
   # - apiToken: Your API token
   # - spaceId: Your space ID (from URL when viewing space)
   ```

3. **Run**
   ```bash
   npx ts-node create-schema.ts
   ```

### Option B: Manual Setup (UI)

Follow the step-by-step guide below to create tables manually.

---

## Manual Setup Guide

### Step 1: Create a New Base

1. Go to your Teable instance
2. Click **+ New Base**
3. Name it: `Asset Management System`

---

### Step 2: Create Tables (in order)

#### Table 1: Categories

| Field Name | Type | Configuration |
|------------|------|---------------|
| Category Name | Single Line Text | Required |
| Description | Long Text | - |
| Depreciation Method | Single Select | Options: `Straight Line`, `Declining Balance`, `No Depreciation` |
| Depreciation Rate (%) | Number | Decimal: 2 |
| Useful Life (Years) | Number | Integer |
| Approval Threshold ($) | Number | Decimal: 2, Currency |
| Active | Checkbox | Default: checked |
| Created Date | Created Time | Auto |

**Sample Data:**
```
| Category Name    | Depreciation Method | Rate  | Useful Life |
|------------------|---------------------|-------|-------------|
| IT Equipment     | Straight Line       | 25.00 | 4           |
| Office Furniture | Straight Line       | 10.00 | 10          |
| Software License | No Depreciation     | 0.00  | 0           |
```

---

#### Table 2: Vendors

| Field Name | Type | Configuration |
|------------|------|---------------|
| Vendor Name | Single Line Text | Required |
| Vendor Type | Multiple Select | Options: `Hardware Supplier`, `Software Vendor`, `Furniture Supplier`, `Maintenance Provider` |
| Primary Contact | Single Line Text | - |
| Contact Email | Single Line Text | - |
| Contact Phone | Single Line Text | - |
| Address | Long Text | - |
| Website | Single Line Text | URL |
| Payment Terms | Single Select | Options: `Net 15`, `Net 30`, `Net 45`, `Net 60`, `Prepaid` |
| Contract Status | Single Select | Options: `Active`, `Under Review`, `Expired`, `Terminated` |
| Contract Expiry Date | Date | - |
| Rating | Rating | Max: 5 |
| Notes | Long Text | - |

---

#### Table 3: Employees

| Field Name | Type | Configuration |
|------------|------|---------------|
| Employee ID | Single Line Text | Required, Unique |
| Full Name | Single Line Text | Required |
| First Name | Single Line Text | - |
| Last Name | Single Line Text | - |
| Email | Single Line Text | Required |
| Phone | Single Line Text | - |
| Department | Single Select | Options: `Engineering`, `Product`, `Design`, `Marketing`, `Sales`, `Finance`, `HR`, `Operations`, `IT`, `Legal`, `Executive` |
| Job Title | Single Line Text | - |
| Location | Single Select | Options: `HQ - Singapore`, `Office - KL`, `Office - Jakarta`, `Remote` |
| Building/Floor | Single Line Text | - |
| Employment Status | Single Select | Options: `Active`, `On Leave`, `Terminated`, `Contractor`, `Intern` |
| Start Date | Date | - |
| End Date | Date | - |
| Can Approve Requests | Checkbox | - |
| Approval Limit ($) | Number | Currency |
| Manager | Link | → Employees (self-reference) |
| Profile Photo | Attachment | - |

**Views to Create:**
- Grid: All Employees
- Grid: Active Employees (filter: Employment Status = Active)
- Kanban: By Department
- Grid: Approvers (filter: Can Approve Requests = checked)
- Gallery: Employee Directory

---

#### Table 4: Assets (Main Table)

| Field Name | Type | Configuration |
|------------|------|---------------|
| Asset Tag | Single Line Text | Required, Unique (format: AST-XXXXXX) |
| Asset Name | Single Line Text | Required |
| Category | Link | → Categories |
| Asset Type | Single Select | Options: `Laptop`, `Desktop`, `Monitor`, `Keyboard`, `Mouse`, `Headset`, `Mobile Phone`, `Tablet`, `Server`, `Network Equipment`, `Printer`, `Desk`, `Chair`, `Storage Cabinet`, `Conference Equipment`, `Other` |
| Brand | Single Line Text | - |
| Model | Single Line Text | - |
| Serial Number | Single Line Text | Unique |
| Status | Single Select | Options: `Available` (green), `Assigned` (blue), `In Maintenance` (yellow), `Reserved` (purple), `Lost` (red), `Stolen` (red), `Disposed` (gray), `Retired` (gray) |
| Condition | Single Select | Options: `New`, `Excellent`, `Good`, `Fair`, `Poor`, `Non-Functional` |
| Purchase Date | Date | - |
| Purchase Price ($) | Number | Currency |
| Vendor | Link | → Vendors |
| PO Number | Single Line Text | - |
| Invoice Number | Single Line Text | - |
| Warranty Start Date | Date | - |
| Warranty Expiry Date | Date | - |
| Current Assignee | Link | → Employees |
| Location | Single Select | Options: `HQ - Singapore`, `Office - KL`, `Office - Jakarta`, `Storage - HQ`, `Remote - Employee`, `In Transit` |
| Physical Location | Single Line Text | Building, floor, room |
| Specifications | Long Text | Technical specs |
| Configuration Notes | Long Text | Software, settings |
| Notes | Long Text | - |
| Photos | Attachment | Max 5 |
| Documents | Attachment | Receipts, warranties |
| Disposal Date | Date | - |
| Disposal Method | Single Select | Options: `Sold`, `Donated`, `Recycled`, `Scrapped`, `Returned to Vendor`, `Trade-In` |
| Disposal Value ($) | Number | Currency |

**Views to Create:**
- Grid: All Assets
- Grid: Available Assets (filter: Status = Available)
- Grid: Assigned Assets (filter: Status = Assigned)
- Kanban: By Status
- Kanban: By Type
- Grid: In Maintenance
- Grid: Warranty Expiring (filter: Warranty Expiry Date < 30 days from now)
- Gallery: Asset Gallery

---

#### Table 5: Asset Assignments

| Field Name | Type | Configuration |
|------------|------|---------------|
| Asset | Link | → Assets |
| Employee | Link | → Employees |
| Assignment Type | Single Select | Options: `Permanent`, `Temporary`, `Project-Based`, `Loaner` |
| Status | Single Select | Options: `Active`, `Returned`, `Overdue`, `Lost` |
| Assigned Date | Date | Include time |
| Expected Return Date | Date | For temporary |
| Actual Return Date | Date | Include time |
| Condition at Checkout | Single Select | Options: `New`, `Excellent`, `Good`, `Fair`, `Poor` |
| Condition at Return | Single Select | Options: `Excellent`, `Good`, `Fair`, `Poor`, `Damaged` |
| Approved By | Link | → Employees |
| Checkout Location | Single Line Text | - |
| Return Location | Single Line Text | - |
| Checkout Notes | Long Text | - |
| Return Notes | Long Text | - |
| Checkout Photos | Attachment | - |
| Return Photos | Attachment | - |

**Views to Create:**
- Grid: Active Assignments (filter: Status = Active)
- Grid: Overdue Returns (filter: Status = Overdue OR Expected Return Date < Today AND Actual Return Date is empty)
- Kanban: By Status
- Grid: Assignment History

---

#### Table 6: Asset Requests

| Field Name | Type | Configuration |
|------------|------|---------------|
| Request Title | Single Line Text | Required |
| Requester | Link | → Employees |
| Request Type | Single Select | Options: `New Asset`, `Replacement`, `Upgrade`, `Temporary/Loaner`, `Transfer`, `Return` |
| Priority | Single Select | Options: `Critical` (red), `High` (orange), `Medium` (yellow), `Low` (blue) |
| Requested Category | Link | → Categories |
| Requested Asset Type | Single Select | Same as Assets.Asset Type |
| Preferred Brand/Model | Single Line Text | - |
| Specifications Required | Long Text | - |
| Justification | Long Text | Required |
| Needed By Date | Date | - |
| Estimated Cost ($) | Number | Currency |
| Budget Code | Single Line Text | - |
| Status | Single Select | Options: `Draft`, `Submitted`, `Pending Manager Approval`, `Pending IT Review`, `Pending Finance Approval`, `Approved`, `Rejected`, `Ordered`, `Fulfilled`, `Cancelled` |
| Submitted Date | Date | Include time |
| Current Approver | Link | → Employees |
| Manager Approver | Link | → Employees |
| Manager Approval Date | Date | Include time |
| Manager Comments | Long Text | - |
| IT Reviewer | Link | → Employees |
| IT Review Date | Date | Include time |
| IT Comments | Long Text | - |
| IT Recommendation | Single Select | Options: `Approve as Requested`, `Approve with Changes`, `Use Existing Asset`, `Deny` |
| Finance Approver | Link | → Employees |
| Finance Approval Date | Date | Include time |
| Finance Comments | Long Text | - |
| Final Decision | Single Select | Options: `Approved`, `Partially Approved`, `Rejected` |
| Rejection Reason | Long Text | - |
| Assigned Asset | Link | → Assets |
| PO Number | Single Line Text | - |
| Fulfillment Date | Date | - |
| Fulfillment Notes | Long Text | - |
| Attachments | Attachment | Quotes, etc. |

**Views to Create:**
- Grid: All Requests
- Kanban: Pending Approval (by Status, exclude Fulfilled/Cancelled/Rejected)
- Grid: By Priority
- Form: Request Form (for employees to submit requests)

---

#### Table 7: Maintenance Records

| Field Name | Type | Configuration |
|------------|------|---------------|
| Asset | Link | → Assets |
| Maintenance Type | Single Select | Options: `Repair`, `Preventive`, `Upgrade`, `Inspection`, `Cleaning`, `Software Update`, `Calibration` |
| Priority | Single Select | Options: `Critical`, `High`, `Medium`, `Low` |
| Issue Description | Long Text | Required |
| Reported By | Link | → Employees |
| Reported Date | Date | Include time |
| Status | Single Select | Options: `Reported`, `Acknowledged`, `Diagnosed`, `Parts Ordered`, `In Progress`, `Pending Vendor`, `Testing`, `Completed`, `Cannot Repair`, `Cancelled` |
| Assigned Technician | Link | → Employees |
| External Vendor | Link | → Vendors |
| Diagnosis | Long Text | - |
| Resolution | Long Text | - |
| Parts Used | Long Text | - |
| Work Started Date | Date | Include time |
| Completion Date | Date | Include time |
| Labor Hours | Number | Decimal: 2 |
| Labor Cost ($) | Number | Currency |
| Parts Cost ($) | Number | Currency |
| External Service Cost ($) | Number | Currency |
| Covered Under Warranty | Checkbox | - |
| Warranty Claim Number | Single Line Text | - |
| Helpdesk Ticket | Single Line Text | - |
| Root Cause | Single Select | Options: `Normal Wear`, `User Error`, `Manufacturing Defect`, `Software Issue`, `Power/Electrical`, `Physical Damage`, `Environmental`, `Unknown` |
| Asset Condition After | Single Select | Options: `Excellent`, `Good`, `Fair`, `Poor`, `Non-Functional` |
| Follow-up Required | Checkbox | - |
| Follow-up Date | Date | - |
| Follow-up Notes | Long Text | - |
| Photos Before | Attachment | - |
| Photos After | Attachment | - |
| Documents | Attachment | Service reports, invoices |

**Views to Create:**
- Kanban: Open Issues (by Status, exclude Completed/Cannot Repair/Cancelled)
- Grid: By Priority
- Grid: Warranty Claims (filter: Covered Under Warranty = checked)
- Grid: Completed
- Calendar: Maintenance Calendar (by Follow-up Date)

---

#### Table 8: Software Licenses

| Field Name | Type | Configuration |
|------------|------|---------------|
| Software Name | Single Line Text | Required |
| Vendor | Link | → Vendors |
| License Type | Single Select | Options: `SaaS Subscription`, `Perpetual`, `Annual Subscription`, `Monthly Subscription`, `Floating/Concurrent`, `Site License`, `Per-Device`, `Open Source`, `Freeware` |
| License Model | Single Select | Options: `Per User`, `Per Device`, `Concurrent Users`, `Enterprise/Unlimited`, `Tiered` |
| Category | Single Select | Options: `Productivity`, `Development Tools`, `Design`, `Communication`, `Security`, `Database`, `Analytics`, `Infrastructure`, `HR/Finance`, `Other` |
| Version | Single Line Text | - |
| License Key | Single Line Text | Sensitive |
| Status | Single Select | Options: `Active`, `Expiring Soon`, `Expired`, `Cancelled`, `Pending Renewal`, `Trial` |
| Total Seats | Number | Integer (0 = Unlimited) |
| Used Seats | Number | Integer |
| Purchase Date | Date | - |
| Start Date | Date | Required |
| Expiry Date | Date | - |
| Renewal Date | Date | - |
| Billing Cycle | Single Select | Options: `Monthly`, `Quarterly`, `Annual`, `Multi-Year`, `One-Time` |
| Cost Per Seat ($) | Number | Currency |
| Annual Cost ($) | Number | Currency |
| Contract Number | Single Line Text | - |
| PO Number | Single Line Text | - |
| License Owner | Link | → Employees |
| Primary Admin | Link | → Employees |
| Departments | Multiple Select | Department list |
| SSO Enabled | Checkbox | - |
| Access URL | Single Line Text | URL |
| Support Contact | Single Line Text | - |
| Notes | Long Text | - |
| Contract Documents | Attachment | - |

**Views to Create:**
- Grid: All Licenses
- Grid: Active Licenses (filter: Status = Active)
- Grid: Expiring Soon (filter: Expiry Date < 60 days from now)
- Kanban: By Category
- Calendar: Renewal Calendar (by Renewal Date)

---

#### Table 9: License Assignments

| Field Name | Type | Configuration |
|------------|------|---------------|
| License | Link | → Software Licenses |
| Employee | Link | → Employees |
| Status | Single Select | Options: `Active`, `Pending Activation`, `Suspended`, `Revoked` |
| Assignment Date | Date | Required |
| Revocation Date | Date | - |
| License Role | Single Select | Options: `User`, `Admin`, `Viewer`, `Power User` |
| Assigned By | Link | → Employees |
| Last Login | Date | Include time |
| Usage Notes | Long Text | - |

**Views to Create:**
- Grid: Active Assignments (filter: Status = Active)
- Grid: By License (grouped by License)
- Grid: By Employee (grouped by Employee)
- Grid: Pending Activation (filter: Status = Pending Activation)

---

## Approval Workflow Setup

### Workflow Logic

```
Request Submitted
      ↓
[Estimated Cost Check]
      ↓
< $500 ────────────────→ Auto-Approve → Fulfill
      ↓
$500 - $2000 ──────────→ Manager Approval → Fulfill
      ↓
$2000 - $5000 ─────────→ Manager → IT Review → Fulfill
      ↓
> $5000 ───────────────→ Manager → IT Review → Finance → Fulfill
```

### Manual Workflow (Using Status Field)

1. **Employee submits request** → Status: `Submitted`
2. **System routes to manager** → Status: `Pending Manager Approval`
3. **Manager approves** → Status: `Pending IT Review` (if > $2000) or `Approved`
4. **IT reviews** → Status: `Pending Finance Approval` (if > $5000) or `Approved`
5. **Finance approves** → Status: `Approved`
6. **Asset assigned** → Status: `Fulfilled`

### Automation Tips

- Use **Button Fields** to trigger status changes
- Create **Form View** for request submission
- Set up **Views** filtered by Current Approver = Current User
- Use **Webhooks** for email notifications (if available)

---

## Formula Fields (Add After Setup)

Add these formula fields to enhance tracking:

### Assets Table

```javascript
// Warranty Status
IF({Warranty Expiry Date} = '', 'No Warranty',
   IF({Warranty Expiry Date} < TODAY(), 'Expired',
      IF(DAYS_BETWEEN(TODAY(), {Warranty Expiry Date}) <= 30, 'Expiring Soon', 'Active')))

// Age in Months
MONTHS_BETWEEN({Purchase Date}, TODAY())

// Current Value (Straight Line Depreciation)
MAX(0, {Purchase Price ($)} - ({Purchase Price ($)} * 0.25 * ({Age in Months} / 12)))
```

### Asset Requests Table

```javascript
// Days in Queue
IF({Status} IN ('Draft', 'Submitted', 'Pending Manager Approval', 'Pending IT Review', 'Pending Finance Approval'),
   DAYS_BETWEEN({Submitted Date}, TODAY()), NULL)

// SLA Status
IF({Days in Queue} = NULL, 'N/A',
   IF({Days in Queue} <= 3, 'On Track',
      IF({Days in Queue} <= 5, 'At Risk', 'Overdue')))
```

### Software Licenses Table

```javascript
// Available Seats
IF({Total Seats} = 0, 'Unlimited', {Total Seats} - {Used Seats})

// Days Until Expiry
IF({Expiry Date}, DAYS_BETWEEN(TODAY(), {Expiry Date}), NULL)

// Renewal Reminder
IF({Days Until Expiry} = NULL, 'No Expiry',
   IF({Days Until Expiry} <= 0, 'EXPIRED',
      IF({Days Until Expiry} <= 30, 'Renew Now',
         IF({Days Until Expiry} <= 60, 'Renew Soon', 'OK'))))
```

---

## Sample Data Import

After creating tables, import sample data using CSV:

### Categories.csv
```csv
Category Name,Depreciation Method,Depreciation Rate (%),Useful Life (Years),Approval Threshold ($),Active
IT Equipment,Straight Line,25,4,500,true
Office Furniture,Straight Line,10,10,1000,true
Software Licenses,No Depreciation,0,0,200,true
Network Equipment,Straight Line,20,5,1000,true
Mobile Devices,Straight Line,33,3,300,true
```

### Employees.csv
```csv
Employee ID,Full Name,Email,Department,Job Title,Location,Employment Status,Can Approve Requests,Approval Limit ($)
EMP-001,John Smith,john@company.com,IT,IT Manager,HQ - Singapore,Active,true,10000
EMP-002,Sarah Lee,sarah@company.com,Engineering,Software Engineer,HQ - Singapore,Active,false,0
EMP-003,Mike Chen,mike@company.com,Finance,Finance Director,HQ - Singapore,Active,true,50000
```

---

## API Usage Examples

### Create an Asset

```bash
curl -X POST "https://teable.theraw.com.my/api/table/{tableId}/record" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "records": [{
      "fields": {
        "Asset Tag": "AST-000001",
        "Asset Name": "MacBook Pro 14\" M3",
        "Asset Type": "Laptop",
        "Brand": "Apple",
        "Model": "MacBook Pro 14 M3",
        "Serial Number": "C02XYZ12345",
        "Status": "Available",
        "Condition": "New",
        "Purchase Date": "2024-01-15",
        "Purchase Price ($)": 2499
      }
    }],
    "fieldKeyType": "name"
  }'
```

### Get Available Assets

```bash
curl -X GET "https://teable.theraw.com.my/api/table/{tableId}/record?filter=%7B%22field%22%3A%22Status%22%2C%22operator%22%3A%22%3D%22%2C%22value%22%3A%22Available%22%7D" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Asset Status

```bash
curl -X PATCH "https://teable.theraw.com.my/api/table/{tableId}/record" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "records": [{
      "id": "rec_XXXXXX",
      "fields": {
        "Status": "Assigned",
        "Current Assignee": ["rec_EMPLOYEE_ID"]
      }
    }],
    "fieldKeyType": "name"
  }'
```

---

## Support

- **Teable Documentation**: https://help.teable.io
- **API Reference**: https://teable.theraw.com.my/docs
- **ReDoc**: https://teable.theraw.com.my/redocs

---

## License

This asset management template is provided as-is for use with Teable.
