# Purchase Orders — Basic Operations Test Plan

## Scope

Explore and test only **Inventory Buying → Purchase Orders** at:

`/replenishment/purchase-orders?filters=source[eq]=conative`

The plan covers the Purchase Orders list, search and filters, viewing an order, creating and processing a purchase order, row selection, and importing purchase orders. It does not cover other application areas.

## Test setup and safety

- Sign in with the project’s configured test account and select the configured Conative organization.
- Start each scenario at the Purchase Orders URL above with the search cleared, no rows selected, and all dialogs closed.
- Use isolated test vendors, warehouses, products, and uniquely named purchase orders for scenarios that save data. Do not use production data.
- Keep credentials and uploaded test files out of source control. Clean up test records only when safe and authorized.
- Do not confirm delete, cancel, or import operations against real business records. Use an isolated test record/file and verify the confirmation or preview step before any irreversible action.

## Observed interface

- The list includes PO ID, PO Number, Vendor, Warehouse, Created Date, Expected Arrival Date, Status, Received Status, and Action columns.
- Search accepts purchase orders, vendors, or warehouses. A clear control is available.
- The filter panel includes Source, Status, Warehouse, Vendor, PO ID, PO Number, Created date, Expected arrival date, and Received status. Status options include Draft, Pending approval, Open, Partially Received, Received, Closed, Canceled, and Rejected.
- Selecting a row displays a selection count and a Delete action. Opening a row displays its details in a side panel.
- The create form has required PO Number, Vendor, and Warehouse fields; an optional Expected arrival date; product search by title or SKU; Note for PO; and Attachments. The attachment control lists PDF, DOCX, XLSX, PNG, and JPG with a 5 MB maximum.
- The import wizard has Upload file, Map columns, and Import steps. It accepts CSV/XLSX up to 10 MB and offers a template download.

## Test scenarios

### PO-01 — Load the Purchase Orders list

**Starting state:** Freshly loaded Purchase Orders page; no search or selection.

1. Open the Purchase Orders URL.
2. Wait for the table and result summary to finish loading.
3. Verify the table headers and inspect the first result batch.
4. If Next page is enabled, activate it once and wait for loading to finish.

**Expected results**

- The page title and table appear without an empty or perpetual loading state.
- The observed list columns are present.
- Result count and pagination controls reflect the loaded results; progressing to another batch does not duplicate or lose records.
- Selecting Next page is disabled or otherwise unavailable when no more results remain.

### PO-02 — Search by PO number, vendor, and warehouse

**Starting state:** Fresh list with no search term.

1. Enter a known PO number in **Search POs, vendors, or warehouses**.
2. Verify the matching result(s).
3. Replace the term with a known vendor name and verify the results.
4. Repeat with a known warehouse name.
5. Enter a term that should not match any result.
6. Use the clear control.

**Expected results**

- Each search narrows the list to matching records and updates the result summary.
- A non-matching term displays a clear empty/no-results state.
- Clearing the search restores the unfiltered results and removes the search parameter from the URL.

### PO-03 — Apply, combine, and clear filters

**Starting state:** Fresh list with the default source filter shown.

1. Open **Filter** and verify the available fields and status values.
2. Apply one status filter for which fixture records exist.
3. Verify every displayed row matches the selected status.
4. Add a warehouse or vendor filter and apply both.
5. Test a PO ID or PO Number criterion and a Created date or Expected arrival date criterion.
6. Test a Received status option.
7. Reopen the filter panel, use **Clear all**, and apply.

**Expected results**

- Filter selections are visible and reflected by the result count and URL.
- Combined filters return records satisfying all selected criteria.
- Clearing filters removes the selected criteria; verify the resulting URL and whether the default Source scope is retained.
- Empty matches display a usable no-results state rather than stale rows.

### PO-04 — View a purchase order

**Starting state:** Fresh list containing a known test purchase order.

1. Open a row.
2. Verify the side panel identifies the selected PO and displays its status.
3. Check the PO Number, Vendor, Warehouse, Expected arrival date, Created date, and Order Items area.
4. Close the panel and verify the list remains available.

**Expected results**

- The detail panel corresponds to the selected row and shows its current values.
- Closing the panel returns to the same list state without changing the record.

### PO-05 — Validate required fields in a new purchase order

**Starting state:** Fresh list; isolated test account has access to valid vendor, warehouse, and product fixtures.

1. Select **Create purchase order**.
2. Leave PO Number, Vendor, and Warehouse blank.
3. Inspect the required indicators and form actions.
4. Enter only one required value at a time and observe action availability.
5. Close the form without saving.

**Expected results**

- PO Number, Vendor, and Warehouse are marked required.
- Save as draft, Request approval, and Create PO cannot complete with required values missing.
- Closing an untouched form does not create a record.

### PO-06 — Save a purchase order as a draft

**Starting state:** Fresh list; an isolated test PO number and valid vendor, warehouse, and product fixtures are available.

1. Open **Create purchase order**.
2. Enter a unique PO Number and select a Vendor and Warehouse.
3. Optionally set an Expected arrival date and enter a note.
4. Search for a fixture product by title or SKU and add it to Order Items.
5. Verify the selected product and quantity/line details before saving.
6. Select **Save as draft**.
7. Find the new PO in the list and open it.

**Expected results**

- A successful save creates exactly one PO with Draft status.
- The PO appears in the list with the entered header values.
- Reopening it shows the saved item and optional values.

### PO-07 — Request approval for a draft

**Starting state:** Fresh list; a complete isolated draft PO exists and the user has approval-request permission.

1. Open the draft PO.
2. Verify the PO is complete and in Draft status.
3. Select **Request approval** and confirm only if a confirmation step is shown and the test record is isolated.
4. Return to the list and reopen the PO.

**Expected results**

- The request is accepted only for a complete eligible draft.
- The PO transitions to the configured pending-approval state and is not duplicated.
- If permission or required data is missing, the app displays a clear explanation and leaves the PO unchanged.

### PO-08 — Create a purchase order from a complete draft

**Starting state:** Fresh list; a complete isolated draft PO exists.

1. Open the draft PO and verify its number, vendor, warehouse, expected date, and items.
2. Select **Create PO**.
3. Confirm the action only if the confirmation clearly names the isolated test PO.
4. Reopen the PO from the list.

**Expected results**

- The PO is created once and moves to the expected post-creation status.
- Its vendor, warehouse, date, and item quantities remain unchanged.
- Ineligible drafts cannot be created and show actionable validation feedback.

### PO-09 — Validate and run a purchase order import

**Starting state:** Fresh list; isolated import fixture file is available.

1. Select **Import purchase orders**.
2. Verify the three steps: Upload file, Map columns, and Import.
3. With no file selected, verify **Map columns** is unavailable.
4. Test an unsupported file type and a file larger than 10 MB; verify each is rejected with feedback.
5. Upload a valid, small CSV or XLSX fixture and proceed to Map columns.
6. Verify the mapping/preview identifies the expected fields and reports missing or invalid values.
7. Cancel before importing, then repeat with a valid fixture and complete the import only in the isolated test organization.
8. Verify the imported PO records in the list.

**Expected results**

- Upload restrictions and the template download are clear.
- Invalid files or invalid rows are reported and do not create partial, unexplained records.
- A valid import advances through mapping and import, and creates only the expected records.
- Canceling before the final import leaves the list unchanged.

### PO-10 — Select rows and verify bulk-delete safeguards

**Starting state:** Fresh list with at least one isolated test PO.

1. Select one row and verify the selection count and Delete action appear.
2. Select another row, then deselect one row.
3. Use Select all and clear the selection.
4. Select only an isolated test PO and activate Delete to inspect the confirmation.
5. Cancel the confirmation; do not confirm deletion unless specifically authorized for isolated test data.

**Expected results**

- The selection count accurately follows row selection and deselection.
- Bulk actions apply only to selected records.
- Canceling the delete confirmation leaves all records unchanged.

### PO-11 — Cancel an isolated purchase order

**Starting state:** Fresh list; an isolated PO in a status eligible for cancellation exists.

1. Open the isolated PO and verify its identity and current status.
2. Select **Cancel PO**.
3. Review any confirmation or reason prompt; cancel it once to verify the record remains unchanged.
4. Repeat only with explicit authorization for the isolated test PO and verify its final status.

**Expected results**

- Canceling the prompt makes no change.
- A confirmed cancellation changes only the intended PO and displays Canceled status.
- Ineligible statuses cannot be canceled and explain why.

### PO-12 — Validate purchase order attachments

**Starting state:** Fresh list; isolated test files are available.

1. Open **Create purchase order**.
2. Attach a supported file smaller than 5 MB.
3. Verify the selected file is shown and can be removed before saving.
4. Try an unsupported extension and a supported file larger than 5 MB.
5. Close the form without saving.

**Expected results**

- The listed PDF, DOCX, XLSX, PNG, and JPG formats are accepted within the size limit.
- Unsupported formats and oversized files are rejected with clear feedback.
- Removing an attachment clears it from the form, and closing without saving creates no PO or attachment.

## Execution notes

- Use fresh fixtures and start states so scenarios can run independently.
- Do not assert fixed record counts; the list is data-dependent and may load results in batches.
- During exploration, Sentry telemetry requests returned HTTP 403 errors, while the Purchase Orders interface remained usable. Treat these as environment noise unless they affect application behavior.
