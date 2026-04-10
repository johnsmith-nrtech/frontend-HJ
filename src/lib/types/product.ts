interface ProductVariant {
  id?: string;
  price?: number;
  size?: string;
  color?: string;
  stock?: number;
}

// interface ProductVariant {
//   id?: string;
//   sku?: string;
//   price?: number;
//   compare_price?: number;
//   size?: string;
//   color?: string;
//   stock?: number;
//   weight_kg?: number;
//   delivery_time_days?: string;
//   assemble_charges?: number;
//   material?: string;
//   brand?: string;
//   featured?: boolean;
//   tags?: string;
//   warranty_info?: string;
//   dimensions?: Record<string, any>;
//   material_info?: Record<string, any>;
// }

interface ProductImage {
  url?: string;
}

export interface Product {
  id: string;
  name?: string;
  base_price: number;
  default_variant?: ProductVariant;
  main_image?: ProductImage;
}
