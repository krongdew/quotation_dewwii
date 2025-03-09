//quotation-system/src/app/components/quotation/hooks/useSignatures.tsx
import { useState, useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Quotation, CompanyProfile } from '../types';
// @ts-ignore
// eslint-disable-next-line
export const useSignatures = (initialData?: Quotation, selectedCompany?: CompanyProfile | null) => {
  const [isSigningCustomer, setIsSigningCustomer] = useState(false);
  const [isSigningSeller, setIsSigningSeller] = useState(false);
  const [useCompanySignature, setUseCompanySignature] = useState(true);
  
  // เพิ่ม state สำหรับเก็บลายเซ็นที่จะถูกบันทึก
  const [customerSignature, setCustomerSignature] = useState<string | null>(initialData?.customerSignature || null);
  const [sellerSignature, setSellerSignature] = useState<string | null>(initialData?.sellerSignature || null);
  
  const customerSigCanvas = useRef<SignatureCanvas>(null);
  const sellerSigCanvas = useRef<SignatureCanvas>(null);
  
  // Effect เมื่อ initialData เปลี่ยน ให้อัพเดทลายเซ็น
  useEffect(() => {
    if (initialData) {
      setCustomerSignature(initialData.customerSignature || null);
      setSellerSignature(initialData.sellerSignature || null);
    }
  }, [initialData]);
  
  // Effect เมื่อ selectedCompany เปลี่ยน ให้อัพเดท useCompanySignature
  useEffect(() => {
    if (selectedCompany?.signature) {
      setUseCompanySignature(true);
    }
  }, [selectedCompany]);
  
  // Handle signature actions
  const handleSignatureActions = {
    startSigning: (type: 'customer' | 'seller') => {
      if (type === 'customer') {
        setIsSigningCustomer(true);
      } else {
        setIsSigningSeller(true);
      }
    },
    
    finishSigning: (type: 'customer' | 'seller') => {
      if (type === 'customer') {
        if (customerSigCanvas.current && !customerSigCanvas.current.isEmpty()) {
          setCustomerSignature(customerSigCanvas.current.toDataURL());
        }
        setIsSigningCustomer(false);
      } else {
        if (sellerSigCanvas.current && !sellerSigCanvas.current.isEmpty()) {
          setSellerSignature(sellerSigCanvas.current.toDataURL());
        }
        setIsSigningSeller(false);
      }
    },
    
    clearSignature: (type: 'customer' | 'seller') => {
      if (type === 'customer') {
        if (customerSigCanvas.current) {
          customerSigCanvas.current.clear();
        }
      } else if (type === 'seller') {
        if (sellerSigCanvas.current) {
          sellerSigCanvas.current.clear();
        }
      }
    },
    
    // เพิ่มฟังก์ชันสำหรับล้างลายเซ็นที่บันทึกแล้ว
    clearSavedSignature: (type: 'customer' | 'seller') => {
      if (type === 'customer') {
        setCustomerSignature(null);
      } else {
        setSellerSignature(null);
      }
    },
    
    toggleCompanySignature: (useCompany: boolean) => {
      setUseCompanySignature(useCompany);
    }
  };
  
  return {
    customerSigCanvas,
    sellerSigCanvas,
    useCompanySignature,
    isSigningCustomer,
    isSigningSeller,
    customerSignature,
    sellerSignature,
    handleSignatureActions
  };
};