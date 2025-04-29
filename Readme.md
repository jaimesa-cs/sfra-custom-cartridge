
# 📦 app_custom_nemo Cartridge Documentation

## Introduction

**Salesforce Commerce Cloud** (SFRA) cartridges are modular packages of code that extend and customize the base functionality of SFRA storefronts. Each cartridge can contain controllers, scripts, templates, and configuration files that tailor the site experience.

The `app_custom_nemo` cartridge demonstrates how to integrate Contentstack CMS content into an SFRA storefront while providing utility enhancements and Visual Builder support.

> This cartridge is designed as a **reference implementation** and **starting point** for Contentstack integrations and ISML simplifications.

---

## Folder Structure

```
cartridges/
└── app_custom_nemo/
    ├── cartridge/
    │   ├── app_custom_neemo.properties
    │   ├── controllers/
    │   ├── scripts/
    │   │   ├── helpers/
    │   │   └── lib/
    │   ├── services/
    │   └── templates/
    │       └── default/
```

**Key Areas:**
- `controllers/`: Defines storefront routes and controller logic.
- `scripts/`: Utilities and service logic.
- `services/`: Integration with external systems (Contentstack).
- `templates/`: ISML files for storefront rendering.

---

## Controllers

The following controllers have been created or customized:

| Controller | Purpose |
|:-----------|:--------|
| `Lytics.js` | Manages integration with Lytics personalization platform (via Visual Builder). |
| `Contentstack.js` | Fetches CMS content from Contentstack APIs and exposes it to templates. |
| `CorsTest.js` | Provides a test endpoint to validate CORS configurations. |
| `Product.js` | Extends the default Product controller to inject CMS-driven content into product pages. |

---

## Scripts

Scripts created under `scripts/` are utility-focused:

| Script | Purpose |
|:-------|:--------|
| `lib/custom-utils.js` | General utility functions for data manipulation and conversions. |
| `lib/contentstack-utils.js` | Helper utilities specifically for working with Contentstack data. |
| `helpers/cmsHelper.js` | Business logic and convenience methods to simplify controller-to-template CMS integrations. |

---

## Templates

### Extending SFRA Templates

In SFRA, ISML templates can be **overridden** or **extended** by duplicating the path structure and selectively replacing components.  
The `app_custom_nemo` cartridge overrides and extends templates to integrate CMS content dynamically.

### ISML Overview

**ISML** (Intershop Markup Language) is the templating language used in SFRA, blending HTML and server-side scripting for dynamic storefront rendering.

---

### Templates Created/Overwritten

| Template | Purpose |
|:---------|:--------|
| `neemo/hello.isml` | Sample template displaying a simple CMS-connected message. |
| `product/productDetails.isml` | Customized product detail page to include dynamic CMS-driven content. |
| `product/components/details.isml` | Partial component handling product details display logic. |
| `product/components/description.isml` | Partial component for dynamic product descriptions. |
| `product/components/productTileName.isml` | Adjusted product tile rendering using CMS data. |
| `product/components/cms/imageCarousel.isml` | Renders image carousels sourced from CMS entries. |
| `product/components/cms/cmsAttributes.isml` | Renders additional CMS-provided attributes. |
| `product/components/cms/cmsProductDetails.isml` | Combines CMS product details into the product page. |
| `common/lytics.isml` | Integration point for Lytics personalization manifest rendering. |
| `common/scripts.isml` | Includes required client-side scripts for CMS and personalization. |
| `common/layout/page.isml` | Layout modifications to inject CMS-driven elements globally. |
| `common/cms/signup.isml` | Signup section dynamically populated by Contentstack. |
| `common/cms/banner.isml` | Dynamic CMS-driven banner component. |
| `common/cms/cards.isml` | Dynamic CMS-driven card component (Visual Builder support). |

---

## Business Manager Configuration

The following configurations must be completed for the cartridge to operate properly:

### 1. Custom Site Preferences

Create **Custom Preferences** to store API-related configuration values:

| Preference ID | Purpose |
|:--------------|:--------|
| `contentstack.apiKey` | API key to access Contentstack CMS. |
| `contentstack.deliveryToken` | Delivery token for authenticated CMS content retrieval. |
| `contentstack.environment` | Environment name (e.g., `development`, `production`). |
| `personalize.apiKey` | API key to retrieve personalization manifest from Lytics or another personalization service. |

### 2. Service Configuration

Create two services in **Business Manager > Administration > Services**:

| Service ID | Purpose |
|:-----------|:--------|
| `contentstack.http` | Connects to Contentstack's Content Delivery API for fetching CMS content. |
| `personalize.http` | Connects to the personalization API to retrieve user-specific experiences. |

Service profiles should configure authentication (if necessary), endpoints, and appropriate timeouts.

---

## ⚠️ Disclaimer

> This cartridge (`app_custom_nemo`) is **NOT intended for production use**.  
> It is provided as a **reference implementation** to demonstrate integration patterns with Contentstack CMS and Salesforce SFRA.  
> It serves as a **starting foundation** for developers building custom integrations or enhancing their storefronts with CMS-driven content.

---
