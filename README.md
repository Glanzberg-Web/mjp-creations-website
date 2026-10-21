# MJP Creations

**Your Vision. Our Creation. Together We Grow.**

This is the website for MJP Creations, a family-run creative marketing, branded merchandise, and strategic solutions company established in 2018.

The site puts MJP's creative services and client relationships first while retaining direct links to its established promotional-products catalog.

## What's included

- Responsive homepage with a brand-led introduction, service overviews, illustrated merchandise categories, company story, approach, and inquiry form
- Detailed [services](services.html) page covering branded products, creative marketing, graphic design, and strategic solutions
- Dedicated [about](about.html) page with the company's history, mission, and approach
- Catalog links for apparel, bags, drinkware, eco-friendly products, technology, office supplies, and the full existing catalog
- Accessible mobile navigation, reduced-motion support, and basic SEO metadata
- Contact form powered by a server-side Vercel function and Resend

All merchandising visuals are original website illustrations rather than photographs of actual MJP client projects. No unverified client testimonials, customer logos, or project results are shown.

## Launch checklist

### 1. Keep the existing promotional-product catalog live

The current catalog and its product search live on **www.mjpcreations.com**. Replacing the website at that hostname without a catalog migration would break those links.

Before switching the primary domain to this new site:

1. Ask the existing catalog provider to preserve the catalog on a separate hostname, such as **catalog.mjpcreations.com**, or obtain its independently hosted catalog URL.
2. Configure the necessary DNS records with the existing catalog provider.
3. Open the catalog directly and verify product search, category pages, product detail pages, and any existing quote/order workflow.
4. Change the **MJP_CATALOG_BASE** value in [catalog-config.js](catalog-config.js) to the verified HTTPS catalog address. Retain the trailing slash.
5. Test every merchandise-category card and the full-catalog link on both desktop and mobile.

The current configuration continues linking to the live site during preview. **It is not safe to go live at www.mjpcreations.com without completing this step.**

The legacy promotional-products blog is also hosted by the existing platform. Decide whether the provider will keep those URLs accessible with the catalog, or whether selected articles should be migrated with their existing URLs and redirects before cutover.

### 2. Activate the inquiry form

The contact form posts to **/api/contact**. Email delivery happens entirely server-side using the **client-owned Resend account**.

On the Vercel project, set these environment variables:

| Name | Value |
| --- | --- |
| RESEND_API_KEY | The client's Resend API key |
| MJP_CONTACT_TO | The verified email inbox that should receive inquiries |
| MJP_CONTACT_FROM | A sender identity verified in the client's Resend account, e.g. website@a-verified-client-domain |

The deployment should use Node.js 18 or newer. Redeploy after setting environment variables. The form is intentionally not considered active until these values are configured. No email addresses or API credentials are stored in the repository.

Send a real test message and verify it arrives in the designated inbox, that the Reply-To address matches the visitor, and that the success message displays. Test failures as well.

### 3. Review branding and business details

- Confirm the illustrated blue, plum, gold, and cream identity aligns with MJP's preferred branding, or provide final high-resolution logo assets to replace the adapted header wordmark.
- Review the about copy and service descriptions for accuracy. The content is based on the company's original published website.
- Provide an approved privacy notice and any legally required business/contact details for the final site.
- Confirm whether newsletter subscriptions, blog archives, or other functionality from the original provider must remain accessible; these are not silently replicated.
- Verify preferred contact inbox and any phone, social, and location details before displaying them. No unconfirmed details have been inserted.

### 4. Preview and publish

The site uses plain HTML, CSS, and JavaScript; no framework or build is needed. For Vercel, connect this repository, select **Other** as the framework preset, and leave the build command empty. The root directory is the site itself, and the **api/contact.js** function should deploy automatically.

For a simple local preview, run a local static web server from the project folder (for example, **python3 -m http.server 8000**). The form endpoint will not work on that static-only server; it needs a Vercel-compatible serverless environment.

Check responsive layout, navigation, forms, merchandise catalog paths, and every link before assigning the live domain. Keep a rollback path to the current website until the catalog migration is verified.

## Project files

- **index.html** — homepage
- **services.html** — complete service descriptions
- **about.html** — company story
- **styles.css** — layouts, typography, and visual design
- **script.js** — navigation, catalog-link wiring, and form behavior
- **catalog-config.js** — location of existing merchandise catalog
- **api/contact.js** — secure email handling through Resend
- **vercel.json** — basic response-security headers
- **favicon.svg** — brand-inspired favicon

**MJP Creations — creating connections that help brands grow.**
