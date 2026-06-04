console.log('🔍 LoxaApi.ts loaded');
export interface LoxaInsurance {
  code: string;
  name: string;
  pricing_type: string;
  inclusive_insurance: boolean;
  insurance_price: number;
  insurance_term: string;
  default_selected: boolean;
  html_content: string;
  insurance_content: {
    title: string;
    learn_more: string;
    description: string;
    opt_out_description?: string;
    opt_in_link?: string;
    sidebar_content: {
      header: string;
      subheading: string;
      legal_disclaimer: string;
      terms: {
        heading: string;
        lines: (string | { links: Record<string, string> })[];
      };
      footer_pill?: string;
    };
  };
  is_base_insurance_product: boolean;
  extension: boolean;
  base_insurance_product_code: string | null;
}

export interface LoxaInsuranceResponse {
  sku: string;
  product_price: number;
  product_title: string;
  insurable: boolean;
  active: boolean;
  integration_type: string;
  insurance_category: string;
  insurances: LoxaInsurance[];
}

export const LoxaApi = {
  getInsuranceInfo: async (
    sku: string,
    price: number,
    title: string,
  ): Promise<LoxaInsuranceResponse | null> => {
    try {
      const params = new URLSearchParams({
        sku,
        price: price.toString(),
        title,
      });
      console.log('🔍 Loxa request:', { sku, price, title });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/loxa/insurance?${params.toString()}`,
      );
      console.log('📡 Loxa response status:', res.status);

      if (!res.ok) return null;

      const data = await res.json();
      console.log('✅ Loxa response data:', data);

      if (!data.insurable) return null;

      return data as LoxaInsuranceResponse;
    } catch {
      return null;
    }
  },
};