# Website Revision Checklist
**Source:** Exec team review document + email from Stephenie Wheeler, April 26, 2026
**Status key:** ✅ Verified correct | ⚠️ See note | ❌ Not done / needs fix

---

## GLOBAL (all pages)

- [ ] ✅ **P.O. Box** — Footer address reads "P.O. Box 51, Cottage Grove, OR 97424"
- [ ] ✅ **"Subscribe for updates" CTAs** — All "Subscribe" or "Stay connected" buttons link to `/forms/membership/index.html`, not a standalone email form
- [ ] ✅ **"Contact us" CTAs** — All "Contact us" buttons link to `index_working5.html#contact` (opens the contact modal on the home page)
- [ ] ✅ **Montserrat hero headlines** — All page hero `h1` headings use Montserrat font, not Inter. Applies to: News, Donate, Docs, Accessibility, and all form subpages

---

## HOME PAGE (`index_working5.html`)

- [ ] ✅ **Donation stat** — Hero metrics area reads **"$7K in 2025"** (no "Nearly")
- [ ] ✅ **Membership card CTA** — "Join today" card link points to `membership/index.html` (the informational page, not the form directly)

---

## ABOUT PAGE (`about/index.html`)

- [ ] ✅ **$7,000 stat** — Stat reads **"$7,000 in 2025"** (no "Nearly")
- [ ] ✅ **Pool access stat** — "70+ years" stat reads **"of community pool access at WDAC"** (not "swim access")
- [ ] ✅ **Impact callout** — "Why it matters" callout includes the phrase **"often with few other exercise options"**
- [ ] ✅ **Photo caption 1** — Gallery caption reads **"Adult exercise class"** (not "Adult water class")
- [ ] ✅ **Photo credits format** — All 4 gallery photo captions follow two-line format:
  - Line 1 (bold): descriptive label (e.g. "Adult exercise class")
  - Line 2: "Photo credit: [Name]"
- [ ] ✅ **Sponsor bullet** — BYB background section mentions **"South Lane Clinic at 1275 S. River Road in Cottage Grove"**
- [ ] ✅ **Subscribe CTA** — "Subscribe for updates" button → `../forms/membership/index.html`
- [ ] ✅ **Contact CTA** — "Contact us" button → `../index_working5.html#contact`

---

## HISTORY PAGE (`history/index.html`)

### City + School District partnership bullets
- [ ] ✅ **Bullet 1** — Reads: *"Prior to 2019, the city paid SLSD $50,000 each year for adult lap swim, recreation, and summer programs."*
- [ ] ✅ **Bullet 2** — Reads: *"Since the 2019 WDAC renovation, the city's annual $75,000 contribution helps underwrite community programs in both the WDAC's lap pool and newly built therapy pool, which replaced the outdated therapy pool the city had maintained in a separate facility."*
  (This merged the original redundant bullets 2 + 3)
- [ ] ✅ **Bullet 3** — Reads: *"Patrons also contribute to SLSD through WDAC member dues and per-visit user fees and/or insurance payments."*
  (Changed from "Users also contribute...")

### Timeline entries
- [ ] ✅ **1953-54** — Year shows "1953-54" (not "1953") with category **Funding**
- [ ] ✅ **1955** — Category shows **Milestone** (not Management); description mentions Wally Ciochetti and Coach Ron Pupke
- [ ] ✅ **1999-2000** — Description mentions Donna and Doyle Shepherd's $250,000 donation with the understanding the therapy pool would be preserved
- [ ] ✅ **2018-2019 entry exists** — A Milestone entry for 2018-2019 reads: *"The current aquatic center is renovated, featuring an enlarged lap pool and a new 42-person capacity therapy pool."*

---

## MEMBERSHIP PAGE (`membership/index.html`)

- [ ] ✅ **"Who are our members?" paragraph** — Paragraph includes:
  - "swim and water polo athletics program" (not just "swim program")
  - Final sentence beginning: *"Finally, Friends include anyone who recognizes the value of the aquatic center to our community, and would like to support it."*
- [ ] ✅ **Subscribe CTA** — Links to `../forms/membership/index.html`

---

## MEMBERSHIP FORM (`forms/membership/index.html`)

- [ ] ✅ **Participation fieldset legend** — Reads: *"How would you like to participate? (check all that apply; include details in the Comment Box)"*
- [ ] ✅ **Participation checkbox options** — Four checkboxes:
  1. "Stay informed on WDAC advocacy updates via email"
  2. "Volunteer at events, meetings, or outreach (specify interests in comment box)"
  3. "Offer expertise or leadership support (note your skills and/or leadership interests in comment box)"
  4. "Make a planned or legacy gift (please also complete the Legacy / Planned Giving form)"
- [ ] ✅ **"How do you use or relate to the WDAC?" section** — New fieldset with 7 checkboxes:
  - Exercise classes
  - Swim lessons (me)
  - Swim lessons (family)
  - Donor
  - Rec/Family Swim
  - Independent exerciser / swimmer
  - Alumni
- [ ] ✅ **Alumni graduation year field** — Text input labeled "Alumni graduation year (if applicable)" appears below the WDAC-relation checkboxes
- [ ] ✅ **Donation intent dropdown** — Three options:
  1. "No donation at this time"
  2. "I will donate electronically via Give Butter"
  3. "I will send a check in the mail."

---

## NEWS PAGE (`news/index.html`)

- [ ] ✅ **Timeline arrows removed** — No right-pointing arrows (›) appear at the end of each timeline entry. The `news-update__arrow` elements have been removed.
- [ ] ✅ **Bud Taylor entry** — Text reads: *"Friends **continue to support** alumni efforts to honor Coach Bud Taylor..."* (not "Friends continue alumni efforts")
- [ ] ✅ **Mar-Apr 2026 entry exists** — New entry:
  - Date: "Mar-Apr 2026"
  - Category tag: "WDAC operations"
  - Heading: "Staffing support"
  - Text: *"Funded professional development attendance for WDAC supervisory and operations staff."*
- [ ] ⚠️ **"Nearly $7,000" in summary chips** — The highlights chip at the top of the news section still reads **"Nearly $7,000 in equipment support"**. The "Nearly" qualifier was removed from the home and about page stats, but the news page chip was not in the original revision list. Flagged for your review — update if you'd like it to be consistent.

---

## DONATE PAGE (`donate/index.html`)

- [ ] ✅ **Funding priorities intro** — Reads: *"These are mission-aligned areas we hope to support as funding allows."* (not "we may support")
- [ ] ✅ **General Donation card copy** — Reads: *"Donate to support the priorities noted above. You may designate funds for a specific project or purpose by indicating your wishes on the form."*
- [ ] ✅ **Payment note** — Reads: *"Complete the donation form first, then use GiveButter to complete payment electronically."* ("electronically" added)
- [ ] ✅ **Mail-in label** — Reads **"Check/Money Order Payable to:"** (not just "Payable to:")
- [ ] ✅ **T-shirt copy** — Reads: *"Help build awareness among Cottage Grove residents and civic leaders by wearing our 'I love my community pool' T-shirt to events and other gatherings. T-shirts come in a variety of sizes for children and adults. Order yours today! We'll get more made once enough T-shirt requests come in."*
- [ ] ✅ **T-shirt image** — Image source is `../T-shirt_Design.png` (transparent background PNG, not the old JPG)
- [ ] ✅ **Subscribe CTA** — Links to `../forms/membership/index.html`
- [ ] ✅ **Contact CTA** — Links to `../index_working5.html#contact`

---

## DONATION FORM (`forms/donation/index.html`)

- [ ] ✅ **Mailing address field** — Form includes a field labeled "Mailing address" (for street)
- [ ] ✅ **City field** — Form includes a "City" field
- [ ] ✅ **State field** — Form includes a "State" field
- [ ] ✅ **Field placement** — Address fields appear below the email/phone row

---

## DOCS PAGE (`docs/index.html`)

- [ ] ✅ **Membership: dual links** — Two entries in the Forms list:
  1. "Membership / Become a Friend" → Online form (`../forms/membership/index.html`)
  2. "Membership / Become a Friend" → Fillable PDF (`../assets/docs/FRM_WDAC_Friends_Membership_FILLABLE.pdf`)
- [ ] ✅ **General Donation: dual links** — Two entries in the Forms list:
  1. "General donation" → Online form (`../forms/donation/index.html`)
  2. "General donation" → Fillable PDF (`../assets/docs/FRM_WDAC_Friends_General-Donation_FILLABLE.pdf`)
- [ ] ✅ **Stay connected CTA** — "Stay connected" button → `../forms/membership/index.html`

---

## CSS / TYPOGRAPHY

- [ ] ✅ **News page** (`assets/news-page.css`) — `.news-page .news-hero h1` uses `font-family: Montserrat, Inter, system-ui, sans-serif`
- [ ] ✅ **Donate page** (`assets/donate-page.css`) — `.donate-page .donate-hero h1` uses `font-family: Montserrat, Inter, system-ui, sans-serif`
- [ ] ✅ **Docs page** (`assets/docs-page.css`) — `.docs-page .docs-hero h1` uses `font-family: Montserrat, Inter, system-ui, sans-serif`
- [ ] ✅ **Subpage template** (`assets/subpage-page.css`) — `.subpage-page .subpage-hero h1` uses `font-family: Montserrat, Inter, system-ui, sans-serif`
  *(Applies to: Accessibility, Privacy, Terms, and all form pages)*
- [ ] ✅ **News arrows CSS removed** (`assets/news-page.css`) — `.news-update__arrow` rule no longer exists in the stylesheet

---

## JAVASCRIPT (`js/site.js`)

- [ ] ✅ **Shared footer subscribe link** — The subpage footer template "Subscribe for updates" button href uses `${root}/forms/membership/index.html`

---

## PENDING / NOT IN SCOPE

- [ ] ⚠️ **Funding Priorities content** — Per Stephenie's email: *"It's possible that my other team members may choose to either alter one of the Funding Priorities or Add one in the next day or two."* Confirm with exec team before final launch.
- [ ] ❌ **Logo** — Logo readability critique is out of scope for this revision pass (handled separately).
- [ ] ⚠️ **Zoho email access** — Stephenie requested that Andrew, Gail, and Joyce be sent invitations to access `contacts@friendsofWDAC.org` via Zoho. This is an account admin task, not a website change.
