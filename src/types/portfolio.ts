export type MediaType = "image" | "video";

export interface PortfolioItem {
  id: string;
  filename: string;
  src: string;
  type: MediaType;
  title: string;
  scope: string;
  mainCategory: string;
  subCategory?: string | string[];
  size: "small" | "regular" | "wide" | "tall" | "large";
  additionalFiles?: string[];
}
