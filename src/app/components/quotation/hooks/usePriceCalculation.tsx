import { useState, useEffect } from 'react';
import { Form, message } from 'antd';
import { QuotationItem, CalculatedValues, Quotation } from '../types';

export const usePriceCalculation = (
  form: any,
  items: QuotationItem[],
  initialData?: Quotation
) => {
  const [includeVat, setIncludeVat] = useState(false);
  const [isCalculatorModalVisible, setIsCalculatorModalVisible] = useState(false);
  const [desiredAmount, setDesiredAmount] = useState<number | null>(null);
  const [calculatorResult, setCalculatorResult] = useState<number | null>(null);
  
  const [calculatedValues, setCalculatedValues] = useState<CalculatedValues>({
    subtotal: 0,
    discount: 0,
    afterDiscount: 0,
    vat: 0,
    totalAmount: 0,
    withholding: 0,
    netTotal: 0,
  });
  
  // Initialize VAT setting from initial data
  useEffect(() => {
    if (initialData) {
      setIncludeVat(initialData.includeVat || false);
      
      // Ensure all values are set from initial data
      setCalculatedValues({
        subtotal: initialData.subtotal || 0,
        discount: initialData.discount || 0,
        afterDiscount: initialData.afterDiscount || 0,
        vat: initialData.vat || 0,
        totalAmount: initialData.totalAmount || 0,
        withholding: initialData.withholding || 0,
        netTotal: initialData.netTotal || 0,
      });
    }
  }, [initialData]);
  
  // Recalculate totals when items or VAT setting changes
  useEffect(() => {
    calculateTotals(items, includeVat);
  }, [items, includeVat, form]);
  
  // Toggle VAT inclusion
  const handleVatToggle = (checked: boolean) => {
    setIncludeVat(checked);
    form.setFieldsValue({ includeVat: checked });
  };
  
  // Calculate all totals
  const calculateTotals = (currentItems: QuotationItem[], includeVat: boolean) => {
    const formValues = form.getFieldsValue();
    
    console.log('DEBUG: Before subtotal calculation');
    console.log('Current Items:', currentItems);
    
    const subtotal = currentItems.reduce((sum, item) => {
      const itemAmount = item.amount || (item.quantity * item.pricePerUnit);
      console.log('DEBUG: Item', item, 'Amount:', itemAmount);
      return sum + itemAmount;
    }, 0);
    
    console.log('DEBUG: Subtotal calculation result:', subtotal);
    console.log('DEBUG: Items length:', currentItems.length);
    
    // Debug log subtotal
    console.log('Subtotal:', subtotal);
    
    // Get discount from form or default to 0
    const discount = formValues.discount || 0;
    
    // Calculate after discount
    const afterDiscount = Math.max(0, subtotal - discount);
    
    // Calculate VAT based on setting
    const vat = includeVat ? Math.round(afterDiscount * 0.07 * 100) / 100 : 0;
    
    // Calculate total amount
    const totalAmount = Math.round((afterDiscount + vat) * 100) / 100;
    
    // Get withholding from form or default to 0
    const withholding = formValues.withholding || 0;
    
    // Calculate net total
    const netTotal = Math.round((totalAmount - withholding) * 100) / 100;
    
    // Prepare calculation values
    const calculationValues = {
      subtotal,
      discount,
      afterDiscount,
      vat,
      totalAmount,
      withholding,
      netTotal,
    };
    
    // Debug log calculation values
    console.log('Calculation Values:', calculationValues);
    
    // Update state
    setCalculatedValues(calculationValues);
    
    // Update form values for submission
    form.setFieldsValue(calculationValues);
    
    return calculationValues;
  };
  
  // Show calculator modal
  const showCalculatorModal = () => {
    setIsCalculatorModalVisible(true);
    setDesiredAmount(null);
    setCalculatorResult(null);
  };
  
  const handleCalculatorActions = {
    closeModal: () => setIsCalculatorModalVisible(false),
    
    setDesiredAmount: (amount: number | null) => setDesiredAmount(amount),
    
    calculate: () => {
      if (!desiredAmount || desiredAmount <= 0) {
        message.error('กรุณาระบุยอดที่ต้องการ');
        return;
      }
      
      // สูตรคำนวณย้อนกลับจากยอดที่ต้องการ
      // ถ้า x คือราคาก่อนหัก และ y คือราคาหลังหัก 3%
      // y = x - (x * 0.03)
      // y = x * 0.97
      // x = y / 0.97
      const priceBeforeWithholding = desiredAmount / 0.97;
      setCalculatorResult(priceBeforeWithholding);
    },
    
    applyResult: (onUpdateItems: (items: QuotationItem[]) => void) => {
      if (!calculatorResult) return;
      
      console.log('Applying calculator result:', calculatorResult);
      
      // คำนวณภาษีหัก ณ ที่จ่าย 3%
      const withholdingAmount = Number((calculatorResult * 0.03).toFixed(2));
      
      // ตั้งค่า withholding ลงใน form
      form.setFieldsValue({ withholding: withholdingAmount });
      
      const currentItems = [...items];
      
      // สร้างรายการใหม่ถ้าไม่มีรายการสินค้า
      if (currentItems.length === 0) {
        const newItem: QuotationItem = {
          key: Math.random().toString(36).substr(2, 9),
          description: 'สินค้า/บริการ',
          unit: 'รายการ',
          quantity: 1,
          pricePerUnit: Number(calculatorResult.toFixed(2)),
          amount: Number(calculatorResult.toFixed(2)),
        };
        
        currentItems.push(newItem);
      }
      
      // ปรับราคาตามสัดส่วน
      const currentTotal = currentItems.reduce((sum, item) => sum + (item.amount || (item.quantity * item.pricePerUnit)), 0);
      const ratio = calculatorResult / currentTotal;
      
      const updatedItems = currentItems.map(item => {
        const newPricePerUnit = Number((item.pricePerUnit * ratio).toFixed(2));
        const newAmount = Number((item.quantity * newPricePerUnit).toFixed(2));
        
        return {
          ...item,
          pricePerUnit: isNaN(newPricePerUnit) ? 0 : newPricePerUnit,
          amount: isNaN(newAmount) ? 0 : newAmount
        };
      });
      
      // อัพเดทรายการสินค้า
      onUpdateItems(updatedItems);
      
      // คำนวณค่าทั้งหมด
      const subtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
      const discount = form.getFieldValue('discount') || 0;
      const afterDiscount = subtotal - discount;
      
      // คำนวณ VAT
      const vat = includeVat ? afterDiscount * 0.07 : 0;
      const totalAmount = afterDiscount + vat;
      const netTotal = totalAmount - withholdingAmount;
      
      // อัพเดทค่าใน form
      const updatedValues = {
        subtotal,
        afterDiscount,
        vat,
        totalAmount,
        withholding: withholdingAmount,
        netTotal
      };
      
      form.setFieldsValue(updatedValues);
      
      // อัพเดท state
      setCalculatedValues(prevValues => ({
        ...prevValues,
        ...updatedValues
      }));
      
      // ปิด modal
      setIsCalculatorModalVisible(false);
    }
  }

  return {
    calculatedValues,
    includeVat,
    handleVatToggle,
    calculateTotals,
    isCalculatorModalVisible,
    desiredAmount,
    calculatorResult,
    showCalculatorModal,
    handleCalculatorActions
  };
};