//quotation-system/src/app/components/quotation/types.ts
export interface Customer {
    id: string;
    companyName: string;
    address: string;
    phoneNumber: string;
    email: string;
    taxId: string;
    contactPerson: string;
  }
  
  export interface CompanyProfile {
    id: string;
    companyName: string;
    address: string;
    phoneNumber: string;
    email: string;
    taxId: string;
    contactPerson: string;
    signature?: string;
    isDefault: boolean;
  }
  
  export interface QuotationItem {
    key: string;
    description: string;
    unit: string;
    quantity: number;
    pricePerUnit: number;
    amount: number;
  }
  
  export interface Quotation {
    id?: string;
    quotationNumber: string;
    issueDate: string;
    customerId: string;
    customer?: Customer;  // เพิ่ม customer object
    companyId?: string;
    company?: CompanyProfile;  // เพิ่ม company object ด้วย
    items: QuotationItem[];
    subtotal: number;
    discount: number;
    afterDiscount: number;
    includeVat: boolean;
    vat: number;
    totalAmount: number;
    withholding: number;
    netTotal: number;
    customerSignature?: string;
    sellerSignature?: string;
    
  }
  
  export interface CalculatedValues {
    subtotal: number;
    discount: number;
    afterDiscount: number;
    vat: number;
    totalAmount: number;
    withholding: number;
    netTotal: number;
  }
  
  export type FormMode = 'create' | 'edit' | 'view';