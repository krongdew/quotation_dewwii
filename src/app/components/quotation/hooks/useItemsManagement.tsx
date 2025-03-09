//quotation-system/src/app/components/quotation/hooks/useItemsManagement.tsx
import { useState, useEffect } from 'react';
import { QuotationItem, Quotation } from '../types';

export const useItemsManagement = (initialData?: Quotation) => {
  const [items, setItems] = useState<QuotationItem[]>([]);
  
  // Initialize items from initial data if provided
  useEffect(() => {
    if (initialData?.items) {
      setItems(initialData.items.map(item => ({
        ...item,
        key: (item as any).key || (item as any).id || Math.random().toString(36).substr(2, 9),
      })));
    }
  }, [initialData]);
  
  // Add a new empty item to the table
  const handleAddItem = () => {
    const newItem: QuotationItem = {
      key: Math.random().toString(36).substr(2, 9),
      description: '',
      unit: 'ชิ้น',
      quantity: 1,
      pricePerUnit: 0,
      amount: 0,
    };
    
    setItems([...items, newItem]);
  };
  
  // Remove an item from the table
  const handleRemoveItem = (key: string) => {
    setItems(items.filter(item => item.key !== key));
  };
  
  // Update an item field value
  const handleItemChange = (key: string, field: keyof QuotationItem, value: any) => {
    const updatedItems = items.map(item => {
      if (item.key === key) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate amount if quantity or price changes
        if (field === 'quantity' || field === 'pricePerUnit') {
          updatedItem.amount = updatedItem.quantity * updatedItem.pricePerUnit;
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setItems(updatedItems);
  };
  
  return {
    items,
    handleAddItem,
    handleRemoveItem,
    handleItemChange,
    setItems // เพิ่ม setItems ที่นี่
  };
};