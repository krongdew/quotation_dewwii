'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Card, Row, Col, Statistic } from 'antd';
import { 
  TeamOutlined, 
  FileOutlined, 
  DollarOutlined 
} from '@ant-design/icons';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    customerCount: 0,
    quotationCount: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    // Fetch dashboard statistics
    const fetchStats = async () => {
      try {
        // Fetch customers count
        const customersRes = await fetch('/api/customers');
        const customers = await customersRes.json();
        
        // Fetch quotations
        const quotationsRes = await fetch('/api/quotations');
        const quotations = await quotationsRes.json();
        
        // Calculate total amount from all quotations
        const total = quotations.reduce((sum: number, q: any) => sum + q.netTotal, 0);
        
        setStats({
          customerCount: customers.length,
          quotationCount: quotations.length,
          totalAmount: total,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <>
      <Title level={2}>แดชบอร์ด</Title>
      
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="จำนวนลูกค้า"
              value={stats.customerCount}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="จำนวนใบเสนอราคา"
              value={stats.quotationCount}
              prefix={<FileOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="มูลค่ารวมทั้งหมด"
              value={stats.totalAmount}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="บาท"
            />
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Dashboard;