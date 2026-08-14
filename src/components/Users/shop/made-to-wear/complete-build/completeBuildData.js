// ---------------------------------------------------
// MOCK DATA — replace with backend/admin-panel data later.
// Kept in its own file so index.jsx stays focused on logic.
// ---------------------------------------------------

export const BASE_PRICE = 900;

export const DEFAULT_PRODUCT_INFO = {
  description: {
    paragraphs: [
      "Most shirts ask you to choose - formal or casual, structured or relaxed. This one refuses that compromise. It carries a clean, balanced silhouette that works across settings without ever feeling out of place.",
      "The fabric is chosen for balance - enough substance to drape cleanly and hold its shape, but never rigid. Built to be the piece you reach for without thinking, and rely on without question.",
    ],
  },
  design: {
    intro: "Standard features are listed below. Customised to suit your build.",
    rows: [
      { label: "Collar", value: "As selected in your build" },
      { label: "Button", value: "As selected in your build" },
      { label: "Pocket", value: "As selected in your build" },
      { label: "Sleeve", value: "As selected in your build" },
      { label: "Front Style", value: "Standard Placket" },
      { label: "Hem", value: "Standard Width Hem" },
      { label: "Seams", value: "Double Stitched Outseams" },
    ],
  },
  fabricAndCare: {
    rows: [
      { label: "Fabric", value: "Midweight Cotton Twill" },
      { label: "Composition", value: "100% Cotton" },
      { label: "Weave", value: "Twill" },
      { label: "Construction/Threadcount", value: "30s x 10s, 152 x 60" },
      { label: "Weight", value: "9 Oz" },
      { label: "Origin", value: "India" },
      { label: "Fabric Treatment", value: "Brushed, Enzyme Softener Wash" },
      {
        label: "Care",
        value: [
          "Machine wash cold",
          "Wash with similar colors to prevent color bleeding",
          "Hang to dry",
        ],
      },
      {
        label: "Shrinkage",
        value: "Pre-washed to minimise shrinkage. Allowance applied during construction.",
      },
    ],
  },
  sustainability: {
    rows: [
      { label: "Sourcing", value: "Fabric sourced from certified mills" },
      { label: "Dyeing", value: "Low-impact, water-conscious dye process" },
      { label: "Packaging", value: "Recyclable, plastic-free packaging" },
    ],
  },
  shippingAndReturns: {
    rows: [
      { label: "Production Time", value: "7-10 business days (made-to-order)" },
      { label: "Shipping", value: "3-5 business days after production" },
      { label: "Returns", value: "Not eligible — custom-made to your build" },
      { label: "Exchanges", value: "Size exchange available within 7 days" },
    ],
  },
  reviews: {
    rating: 4.9,
    count: 20,
  },
};

// Example of how per-product overrides will look once backend
// is wired up — keyed by fabric id. Uncomment and use once
// /api/products/:id/info exists:
//
// export const PRODUCT_INFO_BY_ID = {
//   f2: { ...DEFAULT_PRODUCT_INFO, description: { paragraphs: [...] } },
// };

export const ACCORDION_ITEMS = [
  { key: "design", label: "Design" },
  { key: "fabric", label: "Fabric & Care" },
  { key: "sustainability", label: "Sustainability & Transparency" },
  { key: "shipping", label: "Shipping & Returns" },
  { key: "reviews", label: "Reviews" },
];