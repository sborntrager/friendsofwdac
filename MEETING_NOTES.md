# Meeting Notes

## April 8, 2026

### Key Outcomes

- Shannon will gain access to GiveButter to evaluate API integration possibilities for streamlining the donation and membership payment process.
- Two online forms will be built (membership and general donation) with data securely stored in Cloudflare and accessible through a password-protected admin page.
- GiveButter operates at 0% platform fee when donors are given the option to tip, though payment processing fees still apply by method.

### Decisions Made

- Form structure: Only two forms will have online payment integration, membership ("Become a Friend") and general donation.
- Payment flow: Users must submit form data first, then continue to GiveButter for payment to prevent data loss.
- Check payments excluded: Online forms will not include check payment options; check users should be directed to PDF forms instead.
- Data security: Form submissions will be stored in a Cloudflare database rather than email.
- Data export: The admin page will include CSV download functionality for Excel compatibility.
- Payment methods: Credit card, debit card, and bank transfer are recommended. Zelle is unavailable due to Banner Bank restrictions for non-individual accounts.

### Technical Implementation

#### Form Development

- Shannon will replicate PDF form fields into HTML format.
- Build an admin page with username/password access for viewing and downloading submissions.
- Present submissions in spreadsheet format with fields for membership type, donation status, volunteer interest, and contact details.
- Add upload support for an existing member spreadsheet as a backup capability.

#### GiveButter Integration

- GiveButter supports payment entry via share link, QR code, and website embedding.
- Shannon will investigate API connections to reduce or eliminate double data entry.
- Platform supports both recurring and one-time payments with multiple payment method options.

#### Security and Access

- Use Cloudflare Worker database storage for secure handling of personal information.
- Shannon will be set up with read-only GiveButter access (no admin privileges).
- The same admin login will also allow website text edits.

### Pending Confirmation

- Samantha to send (or resend) GiveButter invitations to Joyce and Shannon with correct access levels.
- Shannon to review GiveButter developer documentation and confirm API feasibility.
- Team to choose the best form-to-payment connection method (link, QR code, embed, or text-to-donate) after Shannon's review.
- Stephanie to create the initial membership form in GiveButter for team review.

### Action Items

- Samantha: Resend GiveButter invitations to Joyce and Shannon with appropriate access levels.
- Shannon: Review GiveButter platform capabilities, API documentation, and embedding options.
- Shannon: Build two online forms (membership and general donation) based on current PDF field structure.
- Shannon: Set up Cloudflare database storage with admin page access and CSV export.
- Shannon: Replace the existing photo release form with the updated child photo release version.
- Shannon: Continue desktop display optimization for the home page.
- Stephanie: Create initial GiveButter membership form for team review.
- Stephanie: Send Warren Dougherty's photo file to Shannon.
- Stephanie: Review payment method configurations with Joyce after Shannon's GiveButter assessment.

### Open Questions

- Payment method selection: Which specific options (PayPal, Venmo, ACH, credit/debit) should be enabled in GiveButter after cost and user preference review.
- Text-to-donate: Whether this feature has additional costs and whether it should be implemented.
- SEO settings: Whether search optimization is needed for payment pages if traffic is primarily direct/routed.

### Website Development Status

- Initial design review completed between Shannon and Stephanie.
- Site is approaching readiness for executive committee review.
- Home page desktop display still requires additional optimization.
- Content volume is substantial but progressing well.
