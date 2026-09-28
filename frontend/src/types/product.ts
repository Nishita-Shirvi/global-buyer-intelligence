export interface Product {
  /** URL-safe key, e.g. "coffee". */
  id: string
  name: string
  /** Only verified HS codes. null until a code is confirmed from a reliable source. */
  hsCode: string | null
  description: string
}

/**
 * Products the business trades. Configuration, not trade data.
 * Coffee's broad heading 0901 is verified (ITC Trade Map). No HS code is set for
 * confectionery, or for Arabica / Robusta / instant coffee, until verified.
 */
export const PRODUCTS: Product[] = [
  { id: 'coffee', name: 'Coffee', hsCode: '0901', description: 'Coffee, whether or not roasted or decaffeinated. Initial proof of concept.' },
  { id: 'confectionery', name: 'Confectionery', hsCode: null, description: 'Confectionery products. HS classification to be confirmed.' },
]

export const findProduct = (name: string | null | undefined) =>
  PRODUCTS.find((p) => p.name.toLowerCase() === (name ?? '').toLowerCase()) ?? null
