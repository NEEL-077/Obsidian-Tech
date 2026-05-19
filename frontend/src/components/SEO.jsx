import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

const BASE_URL = 'http://localhost:5000';
const DEFAULT_IMAGE = '';
const SITE_NAME = 'OBSIDIAN TECH';

/**
 * Reusable SEO component — inject <head> meta tags per page.
 *
 * Props:
 *   title       string  — page title (appended with " | OBSIDIAN TECH" unless standalone)
 *   description string  — meta description (≤ 160 chars)
 *   image       string  — Open Graph image URL (absolute)
 *   url         string  — canonical page path (e.g. "/products")
 *   type        string  — og:type ("website" | "product" | "article")
 *   noIndex     bool    — true → noindex, nofollow (cart, auth, etc.)
 *   jsonLd      object  — optional JSON-LD structured data object
 */
const SEO = ({
    title,
    description,
    image,
    url = '/',
    type = 'website',
    noIndex = false,
    jsonLd = null,
}) => {
    // Direct DOM override for robots meta — Helmet can't override static index.html tags
    useEffect(() => {
        const robotsMeta = document.querySelector('meta[name="robots"]');
        if (robotsMeta) {
            robotsMeta.setAttribute('content', noIndex ? 'noindex, nofollow' : 'index, follow');
        }
        return () => {
            // Restore on unmount
            const meta = document.querySelector('meta[name="robots"]');
            if (meta) meta.setAttribute('content', 'index, follow');
        };
    }, [noIndex]);

    const fullTitle = title
        ? `${title} | ${SITE_NAME}`
        : `${SITE_NAME} — Latest Smartphones & Best Prices in India`;

    const metaDescription =
        description ||
        'Shop the latest iPhones, Samsung Galaxy, OnePlus, Google Pixel and more. AI-powered recommendations, 500+ phones, free shipping on orders above ₹50,000.';

    const canonicalUrl = `${BASE_URL}${url}`;
    const ogImage = image ? (image.startsWith('http') ? image : `${BASE_URL}${image}`) : DEFAULT_IMAGE;

    return (
        <Helmet prioritizeSeoTags>
            {/* Primary */}
            <title>{fullTitle}</title>
            <meta name="description" content={metaDescription} />
            <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph */}
            <meta property="og:type" content={type === 'product' ? 'product' : 'website'} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:site_name" content={SITE_NAME} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={ogImage} />

            {/* JSON-LD Structured Data */}
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
        </Helmet>
    );
};

export default SEO;
