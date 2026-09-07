export type Origin = 'Japanese' | 'Korean';
export type Condition = 'New' | 'Used';
export type Role = 'admin' | 'customer';

/** Row shape as seen by admins (full access, includes floor_price). */
export interface Product {
  id: string;
  name: string;
  origin: Origin;
  make: string;
  model: string;
  year: number;
  condition: Condition;
  retail_price: number;
  floor_price: number;
  image_url: string | null;
  created_at: string;
}

/** Row shape as seen by the public storefront — floor_price never included. */
export type PublicProduct = Omit<Product, 'floor_price'>;

export interface Profile {
  id: string;
  email: string;
  role: Role;
  created_at: string;
}

export type FulfillmentType = 'pickup' | 'delivery';

export interface Order {
  id: string;
  product_id: string | null;
  buyer_name: string;
  buyer_phone: string;
  amount_paid: number;
  status: 'paid' | 'failed' | 'pending';
  fulfillment_type: FulfillmentType;
  is_in_kumasi: boolean | null;
  delivery_address: string | null;
  created_at: string;
}
