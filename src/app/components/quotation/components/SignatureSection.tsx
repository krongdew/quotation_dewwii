//quotation-system/src/app/components/quotation/components/SignatureSection.tsx
import React from 'react';
import { Card, Typography, Space, Button, Row, Col, Radio, Popconfirm } from 'antd';
import SignatureCanvas from 'react-signature-canvas';
import { SignatureOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

interface SignatureSectionProps {
  customerSigCanvas: React.RefObject<SignatureCanvas>;
  sellerSigCanvas: React.RefObject<SignatureCanvas>;
  selectedCompany: any;
  initialData: any;
  useCompanySignature: boolean;
  isSigningCustomer: boolean;
  isSigningSeller: boolean;
  customerSignature: string | null; // เพิ่ม
  sellerSignature: string | null;   // เพิ่ม
  onSignatureAction: {
    startSigning: (type: 'customer' | 'seller') => void;
    finishSigning: (type: 'customer' | 'seller') => void;
    clearSignature: (type: 'customer' | 'seller') => void;
    clearSavedSignature: (type: 'customer' | 'seller') => void; // เพิ่ม
    toggleCompanySignature: (useCompany: boolean) => void;
  };
  mode: 'create' | 'edit' | 'view';
}

const SignatureSection: React.FC<SignatureSectionProps> = ({
  customerSigCanvas,
  sellerSigCanvas,
  selectedCompany,
  initialData,
  useCompanySignature,
  isSigningCustomer,
  isSigningSeller,
  customerSignature,
  sellerSignature,
  onSignatureAction,
  mode
}) => {
  // Seller signature section
  const renderSellerSignature = () => {
    return (
      <Col span={12}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <Text strong>ผู้เสนอราคา</Text>
        </div>
        
        {mode !== 'view' && selectedCompany?.signature && (
          <div style={{ marginBottom: 12 }}>
            <RadioGroup 
              value={useCompanySignature} 
              onChange={e => onSignatureAction.toggleCompanySignature(e.target.value)}
              buttonStyle="solid"
              style={{ width: '100%', display: 'flex' }}
            >
              <RadioButton value={true} style={{ flex: 1, textAlign: 'center' }}>
                ใช้ลายเซ็นบริษัท
              </RadioButton>
              <RadioButton value={false} style={{ flex: 1, textAlign: 'center' }}>
                เซ็นใหม่
              </RadioButton>
            </RadioGroup>
          </div>
        )}
        
        {isSigningSeller ? (
          <>
            <div style={{ border: '1px solid #d9d9d9', marginBottom: 8, height: 150 }}>
              <SignatureCanvas
                ref={sellerSigCanvas}
                canvasProps={{
                  width: 300,
                  height: 150,
                  className: 'signature-canvas'
                }}
              />
            </div>
            <Space>
              <Button size="small" onClick={() => onSignatureAction.clearSignature('seller')}>
                ล้าง
              </Button>
              <Button size="small" type="primary" onClick={() => onSignatureAction.finishSigning('seller')}>
                ยืนยัน
              </Button>
            </Space>
          </>
        ) : (
          <>
            <div 
              style={{ 
                border: '1px solid #d9d9d9', 
                height: 150, 
                marginBottom: 8,
                backgroundImage: useCompanySignature && selectedCompany?.signature
                  ? `url(${selectedCompany.signature})`
                  : sellerSignature
                  ? `url(${sellerSignature})`
                  : 'none',
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }} 
            />
            {mode !== 'view' && (
              <Space>
                <Button 
                  size="small" 
                  type="primary" 
                  onClick={() => onSignatureAction.startSigning('seller')}
                  icon={<SignatureOutlined />}
                >
                  {useCompanySignature ? 'เซ็นใหม่' : 'เพิ่มลายเซ็น'}
                </Button>
                
                {/* ถ้ามีลายเซ็นและไม่ได้ใช้ลายเซ็นบริษัท ให้แสดงปุ่มล้าง */}
                {sellerSignature && !useCompanySignature && (
                  <Popconfirm
                    title="ล้างลายเซ็น"
                    description="คุณต้องการล้างลายเซ็นนี้หรือไม่?"
                    onConfirm={() => onSignatureAction.clearSavedSignature('seller')}
                    okText="ใช่"
                    cancelText="ไม่"
                  >
                    <Button 
                      size="small" 
                      danger
                      icon={<DeleteOutlined />}
                    >
                      ล้างลายเซ็น
                    </Button>
                  </Popconfirm>
                )}
              </Space>
            )}
          </>
        )}
      </Col>
    );
  };
  
  // Customer signature section
  const renderCustomerSignature = () => {
    return (
      <Col span={12}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <Text strong>ลูกค้า</Text>
        </div>
        
        {isSigningCustomer ? (
          <>
            <div style={{ border: '1px solid #d9d9d9', marginBottom: 8, height: 150 }}>
              <SignatureCanvas
                ref={customerSigCanvas}
                canvasProps={{
                  width: 300,
                  height: 150,
                  className: 'signature-canvas'
                }}
              />
            </div>
            <Space>
              <Button size="small" onClick={() => onSignatureAction.clearSignature('customer')}>
                ล้าง
              </Button>
              <Button size="small" type="primary" onClick={() => onSignatureAction.finishSigning('customer')}>
                ยืนยัน
              </Button>
            </Space>
          </>
        ) : (
          <>
            <div 
              style={{ 
                border: '1px solid #d9d9d9', 
                height: 150, 
                marginBottom: 8,
                backgroundImage: customerSignature 
                  ? `url(${customerSignature})` 
                  : 'none',
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }} 
            />
            {mode !== 'view' && (
              <Space>
                <Button 
                  size="small" 
                  type="primary" 
                  onClick={() => onSignatureAction.startSigning('customer')}
                  icon={<SignatureOutlined />}
                >
                  {customerSignature ? 'เซ็นใหม่' : 'เพิ่มลายเซ็น'}
                </Button>
                
                {/* เพิ่มปุ่มล้างลายเซ็นลูกค้า - แสดงเฉพาะเมื่อมีลายเซ็นแล้ว */}
                {customerSignature && (
                  <Popconfirm
                    title="ล้างลายเซ็น"
                    description="คุณต้องการล้างลายเซ็นลูกค้านี้หรือไม่?"
                    onConfirm={() => onSignatureAction.clearSavedSignature('customer')}
                    okText="ใช่"
                    cancelText="ไม่"
                  >
                    <Button 
                      size="small" 
                      danger
                      icon={<DeleteOutlined />}
                    >
                      ล้างลายเซ็น
                    </Button>
                  </Popconfirm>
                )}
              </Space>
            )}
          </>
        )}
      </Col>
    );
  };
  
  return (
    <Card title="ลายเซ็น" size="small" style={{ flex: 1 }}>
      <Row gutter={24}>
        {renderSellerSignature()}
        {renderCustomerSignature()}
      </Row>
    </Card>
  );
};

export default SignatureSection;