/** Plain, serializable content shapes used by the front end. */

export interface Link {
  sys: { type: "Link"; linkType: "Entry" | "Asset"; id: string };
}

export interface SiteEntry {
  id: string;
  type: string;
  updatedAt: string;
  fields: Record<string, unknown>;
}

export interface SiteAsset {
  id: string;
  /** https URL on images.ctfassets.net */
  url: string;
  contentType: string;
  width?: number;
  height?: number;
  /** The asset title holds the alt text. */
  alt: string;
}

export interface BrandGraphData {
  brand: SiteEntry;
  entries: SiteEntry[];
  assets: SiteAsset[];
}

export interface BrandSummary {
  slug: string;
  name: string;
  vertical: string;
  shortDescription: string;
  tagline?: string;
  logo?: SiteAsset;
  colorBrand: string;
  colorBackground: string;
}
