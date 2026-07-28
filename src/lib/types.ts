export type Role = "BUYER" | "AGENT" | "ADMIN";
export type PropertyType = "SINGLE_FAMILY" | "APARTMENT" | "CONDO" | "TOWNHOUSE" | "LAND";
export type PropertyStatus = "FOR_SALE" | "PENDING" | "SOLD";
export type InquiryStatus = "NEW" | "READ" | "RESPONDED";

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
  phone: string | null;
  avatar_seed: string | null;
  bio: string | null;
  created_at: string;
}

export type PublicUser = Omit<User, "password_hash">;

export interface Property {
  id: string;
  agent_id: string;
  title: string;
  description: string;
  price: number;
  property_type: PropertyType;
  status: PropertyStatus;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lot_size: number | null;
  year_built: number | null;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number | null;
  lng: number | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  position: number;
}

export interface PropertyWithExtras extends Property {
  images: PropertyImage[];
  agent_name: string;
  agent_email: string;
  agent_phone: string | null;
  is_favorited?: boolean;
}

export interface Favorite {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
}

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  criteria_json: string;
  created_at: string;
}

export interface Inquiry {
  id: string;
  property_id: string;
  agent_id: string;
  buyer_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: InquiryStatus;
  created_at: string;
}

export interface SearchCriteria {
  q?: string;
  city?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: PropertyType | "ANY";
  minBeds?: number;
  minBaths?: number;
  status?: PropertyStatus | "ANY";
  sort?: "newest" | "price_asc" | "price_desc" | "sqft_desc";
  page?: number;
  pageSize?: number;
}
