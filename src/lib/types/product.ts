interface ProductVariant {
  id?: string;
  price?: number;
  size?: string;
  color?: string;
  stock?: number;
}

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
