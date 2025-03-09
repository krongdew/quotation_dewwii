//quotation-system/src/app/components/quotation/hooks/useQuotationData.tsx
import { useState, useEffect } from 'react';
import { Form } from 'antd';
import dayjs from 'dayjs';
import { Customer, CompanyProfile, Quotation } from '../types';

export const useQuotationData = (
  form: any, 
  initialData?: Quotation
) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [companyProfiles, setCompanyProfiles] = useState<CompanyProfile[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CompanyProfile | null>(null);
  
  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch('/api/customers');
        if (!res.ok) throw new Error('Failed to fetch customers');
        const data = await res.json();
        setCustomers(data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };
    
    fetchCustomers();
  }, []);
  
  useEffect(() => {
    const fetchCompanyProfiles = async () => {
      try {
        const res = await fetch('/api/company-profile');
        if (!res.ok) throw new Error('Failed to fetch company profiles');
        
        const data = await res.json();
        setCompanyProfiles(data);
        
        // เลือกบริษัทเริ่มต้นเมื่อยังไม่มีการเลือก
        if (!selectedCompany && data && data.length > 0) {
          if (initialData?.companyId) {
            const company = data.find((c: CompanyProfile) => c.id === initialData.companyId);
            if (company) {
              setSelectedCompany(company);
              form.setFieldsValue({ companyId: company.id });
            }
          } else {
            const defaultProfile = data.find((profile: CompanyProfile) => profile.isDefault) || data[0];
            setSelectedCompany(defaultProfile);
            form.setFieldsValue({ companyId: defaultProfile.id });
          }
        }
      } catch (error) {
        console.error('Error fetching company profiles:', error);
      }
    };
    
    fetchCompanyProfiles();
  }, [form, initialData]); // ลบ selectedCompany ออกจาก dependency array
  
  // Update company when form value changes
  useEffect(() => {
    const companyId = form.getFieldValue('companyId');
    if (companyId && !selectedCompany) {
      const company = companyProfiles.find(c => c.id === companyId);
      if (company) {
        setSelectedCompany(company);
      }
    }
  }, [form, companyProfiles, selectedCompany]);
  
  // Initialize form with data if in edit or view mode
  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        ...initialData,
        issueDate: dayjs(initialData.issueDate),
      });
      
      // Find and set selected customer
      if (initialData.customerId && customers.length > 0) {
        const customer = customers.find(c => c.id === initialData.customerId);
        if (customer) setSelectedCustomer(customer);
      }
      
      // Find and set selected company
      if (initialData.companyId && companyProfiles.length > 0) {
        const company = companyProfiles.find(c => c.id === initialData.companyId);
        if (company) setSelectedCompany(company);
      }
    } else {
      // Initialize with default values for create mode
      form.setFieldsValue({
        quotationNumber: generateQuotationNumber(),
        issueDate: dayjs(),
        discount: 0,
        withholding: 0,
        includeVat: false,
      });
    }
  }, [initialData, form, customers, companyProfiles]);
  
  // Generate quotation number with format QT-YYYYMMDD-XXX
  const generateQuotationNumber = () => {
    const today = dayjs();
    const dateStr = today.format('YYYYMMDD');
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `QT-${dateStr}-${randomNum}`;
  };
  
  // Handle customer selection
  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
    }
  };
  
  // Handle company selection
  const handleCompanyChange = (companyId: string) => {
    if (!companyId) return;
    
    const company = companyProfiles.find(c => c.id === companyId);
    if (company) {
      setSelectedCompany(company);
    }
  };
  
  return {
    customers,
    companyProfiles,
    selectedCustomer,
    selectedCompany,
    handleCustomerChange,
    handleCompanyChange,
    generateQuotationNumber
  };
};