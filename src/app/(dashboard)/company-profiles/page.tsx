//quotation-system/src/app/(dashboard)/company-profiles/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Typography, 
  Button, 
  Table, 
  Space, 
  Modal, 
  Form, 
  Input,
  Checkbox,
  message,
  Tag,
  Card,
  Tabs
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  CheckCircleOutlined,
  SignatureOutlined 
} from '@ant-design/icons';
import SignatureCanvas from 'react-signature-canvas';

const { Title } = Typography;
const { TabPane } = Tabs;

interface CompanyProfile {
  id: string;
  companyName: string;
  address: string;
  phoneNumber: string;
  email: string;
  taxId: string;
  contactPerson: string;
  logo?: string;
  signature?: string;
  isDefault: boolean;
}

const CompanyProfilesPage: React.FC = () => {
  const [profiles, setProfiles] = useState<CompanyProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSignatureModalVisible, setIsSignatureModalVisible] = useState(false);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [editingProfile, setEditingProfile] = useState<CompanyProfile | null>(null);
  // Fixed: Use the correct type for sigCanvas
  const sigCanvas = useRef<SignatureCanvas>(null);
  
  // Fetch profiles data
  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/company-profile');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setProfiles(data);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      message.error('ไม่สามารถโหลดข้อมูลบริษัทได้');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProfiles();
  }, []);
  
  // Handle modal visibility
  const showModal = (profile?: CompanyProfile) => {
    if (profile) {
      setEditingProfile(profile);
      form.setFieldsValue(profile);
    } else {
      setEditingProfile(null);
      form.resetFields();
      // ถ้าไม่มีข้อมูลบริษัทเลย ให้ตั้งเป็นค่าเริ่มต้น
      if (profiles.length === 0) {
        form.setFieldsValue({ isDefault: true });
      }
    }
    setIsModalVisible(true);
  };
  
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingProfile) {
        // Update existing profile
        const res = await fetch(`/api/company-profile/${editingProfile.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        
        if (!res.ok) throw new Error('Failed to update profile');
        message.success('อัพเดทข้อมูลบริษัทสำเร็จ');
      } else {
        // Create new profile
        const res = await fetch('/api/company-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        
        if (!res.ok) throw new Error('Failed to create profile');
        message.success('เพิ่มข้อมูลบริษัทสำเร็จ');
      }
      
      setIsModalVisible(false);
      form.resetFields();
      fetchProfiles();
    } catch (error) {
      console.error('Error submitting form:', error);
      message.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };
  
  // Handle profile deletion
  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'ยืนยันการลบข้อมูล',
      content: 'คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลบริษัทนี้?',
      okText: 'ใช่',
      okType: 'danger',
      cancelText: 'ยกเลิก',
      onOk: async () => {
        try {
          const res = await fetch(`/api/company-profile/${id}`, {
            method: 'DELETE',
          });
          
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to delete profile');
          }
          
          message.success('ลบข้อมูลบริษัทสำเร็จ');
          fetchProfiles();
        } catch (error: any) {
          console.error('Error deleting profile:', error);
          message.error(error.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
        }
      },
    });
  };
  
  // Set as default
  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/company-profile/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });
      
      if (!res.ok) throw new Error('Failed to update default profile');
      message.success('ตั้งเป็นค่าเริ่มต้นสำเร็จ');
      fetchProfiles();
    } catch (error) {
      console.error('Error setting default profile:', error);
      message.error('เกิดข้อผิดพลาดในการตั้งค่าเริ่มต้น');
    }
  };

  // Show signature modal - fixed version
const showSignatureModal = (profileId: string) => {
    setCurrentProfileId(profileId);
    setIsSignatureModalVisible(true);
    
    // If there's a saved signature, show it after a brief delay to allow the canvas to load
    const profile = profiles.find(p => p.id === profileId);
    if (profile?.signature && sigCanvas.current) {
      setTimeout(() => {
        const img = new Image();
        img.onload = () => {
          const canvas = sigCanvas.current;
          if (canvas) {
            canvas.clear();
            const ctx = canvas.getCanvas().getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
            }
          }
        };
        // Fix TypeScript error by using type assertion to ensure profile.signature is string
        img.src = profile.signature as string;
      }, 100);
    } else if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
  };
  
  // Clear signature
  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
  };
  
// Save signature function with optimized signature size
const saveSignature = async () => {
    if (!currentProfileId || !sigCanvas.current) return;
    
    try {
      // ตรวจสอบว่ามีลายเซ็นหรือไม่
      if (sigCanvas.current.isEmpty()) {
        // กรณีลายเซ็นว่าง ให้บันทึกเป็น null
        const res = await fetch(`/api/company-profile/${currentProfileId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ signature: null }),
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || 'Failed to clear signature');
        }
        
        message.success('ล้างลายเซ็นสำเร็จ');
        setIsSignatureModalVisible(false);
        fetchProfiles();
        return;
      }
      
      // กรณีมีลายเซ็น ให้ optimize ขนาดลายเซ็น
      let signatureData = sigCanvas.current.toDataURL('image/png', 0.5); // ลดคุณภาพลง 50%
      
      // ถ้าลายเซ็นยังใหญ่เกินไป ลองลดขนาดลงอีก
      if (signatureData.length > 500000) { // ถ้าใหญ่กว่า 500KB
        signatureData = sigCanvas.current.toDataURL('image/jpeg', 0.3); // ใช้ JPEG คุณภาพ 30%
      }
      
      console.log('Signature size:', signatureData.length, 'bytes');
      
      // ส่งลายเซ็นไปบันทึก
      const res = await fetch(`/api/company-profile/${currentProfileId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature: signatureData }),
      });
      
      // ตรวจสอบ response
      if (!res.ok) {
        const responseText = await res.text();
        let errorMessage = 'Failed to save signature';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      message.success('บันทึกลายเซ็นสำเร็จ');
      setIsSignatureModalVisible(false);
      fetchProfiles();
    } catch (error) {
        console.error('Error saving signature:', error);
        // แก้ไขโดยใช้ Type Assertion
        message.error(`เกิดข้อผิดพลาดในการบันทึกลายเซ็น: ${(error as Error).message}`);
      }
  };

  // Table columns
  const columns = [
    {
      title: 'ชื่อบริษัท',
      dataIndex: 'companyName',
      key: 'companyName',
      render: (text: string, record: CompanyProfile) => (
        <Space>
          {text}
          {record.isDefault && <Tag color="green" icon={<CheckCircleOutlined />}>ค่าเริ่มต้น</Tag>}
        </Space>
      )
    },
    {
      title: 'ผู้ติดต่อ',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
    },
    {
      title: 'เบอร์โทร',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'อีเมล',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'เลขประจำตัวผู้เสียภาษี',
      dataIndex: 'taxId',
      key: 'taxId',
    },
    {
      title: 'ลายเซ็น',
      key: 'signature',
      render: (_: any, record: CompanyProfile) => (
        <Space>
          {record.signature ? (
            <Tag color="green">มีลายเซ็น</Tag>
          ) : (
            <Tag color="orange">ไม่มีลายเซ็น</Tag>
          )}
          <Button 
            icon={<SignatureOutlined />} 
            onClick={() => showSignatureModal(record.id)}
            size="small"
          >
            จัดการลายเซ็น
          </Button>
        </Space>
      ),
    },
    {
      title: 'จัดการ',
      key: 'action',
      render: (_: any, record: CompanyProfile) => (
        <Space size="middle">
          <Button 
            icon={<EditOutlined />} 
            onClick={() => showModal(record)}
            type="primary"
          >
            แก้ไข
          </Button>
          {!record.isDefault && (
            <>
              <Button 
                onClick={() => handleSetDefault(record.id)}
              >
                ตั้งเป็นค่าเริ่มต้น
              </Button>
              <Button 
                icon={<DeleteOutlined />} 
                onClick={() => handleDelete(record.id)}
                danger
              >
                ลบ
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>จัดการข้อมูลบริษัท</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => showModal()}
        >
          เพิ่มข้อมูลบริษัท
        </Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={profiles.map(profile => ({ ...profile, key: profile.id }))} 
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
      
      {/* Company Profile Form Modal */}
      <Modal
        title={editingProfile ? "แก้ไขข้อมูลบริษัท" : "เพิ่มข้อมูลบริษัท"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText={editingProfile ? "อัพเดท" : "บันทึก"}
        cancelText="ยกเลิก"
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item 
            name="companyName" 
            label="ชื่อบริษัท" 
            rules={[{ required: true, message: 'กรุณากรอกชื่อบริษัท' }]}
          >
            <Input placeholder="ชื่อบริษัท" />
          </Form.Item>
          
          <Form.Item 
            name="contactPerson" 
            label="ชื่อผู้ติดต่อ" 
            rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ติดต่อ' }]}
          >
            <Input placeholder="ชื่อผู้ติดต่อ" />
          </Form.Item>
          
          <Form.Item 
            name="address" 
            label="ที่อยู่บริษัท" 
            rules={[{ required: true, message: 'กรุณากรอกที่อยู่บริษัท' }]}
          >
            <Input.TextArea rows={3} placeholder="ที่อยู่บริษัท" />
          </Form.Item>
          
          <Form.Item 
            name="phoneNumber" 
            label="เบอร์โทรศัพท์" 
            rules={[{ required: true, message: 'กรุณากรอกเบอร์โทรศัพท์' }]}
          >
            <Input placeholder="เบอร์โทรศัพท์" />
          </Form.Item>
          
          <Form.Item 
            name="email" 
            label="อีเมล" 
            rules={[
              { required: true, message: 'กรุณากรอกอีเมล' },
              { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง' }
            ]}
          >
            <Input placeholder="อีเมล" />
          </Form.Item>
          
          <Form.Item 
            name="taxId" 
            label="เลขประจำตัวผู้เสียภาษี" 
            rules={[{ required: true, message: 'กรุณากรอกเลขประจำตัวผู้เสียภาษี' }]}
          >
            <Input placeholder="เลขประจำตัวผู้เสียภาษี" />
          </Form.Item>
          
          <Form.Item 
            name="isDefault" 
            valuePropName="checked"
          >
            <Checkbox>ตั้งเป็นค่าเริ่มต้น</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* Signature Modal */}
      <Modal
        title="จัดการลายเซ็น"
        open={isSignatureModalVisible}
        onCancel={() => setIsSignatureModalVisible(false)}
        footer={[
          <Button key="clear" onClick={clearSignature}>
            ล้างลายเซ็น
          </Button>,
          <Button key="cancel" onClick={() => setIsSignatureModalVisible(false)}>
            ยกเลิก
          </Button>,
          <Button key="save" type="primary" onClick={saveSignature}>
            บันทึกลายเซ็น
          </Button>,
        ]}
        width={600}
      >
        <div style={{ textAlign: 'center' }}>
          <p>ลงลายเซ็นในช่องด้านล่าง</p>
          <div style={{ border: '1px solid #d9d9d9', marginBottom: 16, height: 200 }}>
            <SignatureCanvas
              ref={sigCanvas}
              canvasProps={{
                width: 598,
                height: 200,
                className: 'signature-canvas'
              }}
            />
          </div>
          <p>คลิกที่ "ล้างลายเซ็น" เพื่อเริ่มใหม่ หรือ "บันทึกลายเซ็น" เพื่อบันทึกลายเซ็นของคุณ</p>
        </div>
      </Modal>
    </>
  );
};

export default CompanyProfilesPage;