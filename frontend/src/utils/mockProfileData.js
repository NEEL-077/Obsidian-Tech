export const mockReturns = [
  {
    id: 'RET12345',
    orderId: 'ORD99887',
    productName: 'iPhone 15 Pro Max',
    image: '/images/products/iphone15promax.png',
    status: 'refunded',
    date: '2024-03-20',
    amount: 149900,
    reason: 'Defective item',
  },
  {
    id: 'RET12346',
    orderId: 'ORD99881',
    productName: 'Samsung Galaxy S24 Ultra',
    image: '/images/products/s24ultra.png',
    status: 'in-transit',
    date: '2024-04-01',
    amount: 129999,
    reason: 'Wrong color delivered',
  }
];

export const mockPayments = [
  {
    id: 'PMT1',
    type: 'visa',
    last4: '4242',
    expiry: '05/27',
    name: 'John Doe',
    isDefault: true,
  },
  {
    id: 'PMT2',
    type: 'mastercard',
    last4: '8899',
    expiry: '12/26',
    name: 'John Doe',
    isDefault: false,
  }
];

export const mockTickets = [
  {
    id: 'TKT5501',
    subject: 'Order Delay - ORD99887',
    status: 'closed',
    priority: 'high',
    date: '2024-03-15',
    lastUpdate: '2024-03-16',
  },
  {
    id: 'TKT5502',
    subject: 'Refund Query - RET12346',
    status: 'open',
    priority: 'medium',
    date: '2024-04-02',
    lastUpdate: '2024-04-03',
  }
];

export const mockGstDetails = {
  businessName: 'John Enterprises Pvt Ltd',
  gstNumber: '22AAAAA0000A1Z5',
  billingAddress: '123, TechHub Tower, S.G. Highway, Ahmedabad - 380054',
};

export const mockNotifications = {
  orderUpdates: true,
  promotions: false,
  securityAlerts: true,
  newsletter: false,
};

export const mockUpiIds = [
  { id: 'upi-1', value: 'john.doe@okaxis' },
  { id: 'upi-2', value: '9876543210@paytm' }
];

export const mockSessions = [
  { id: 'sess-1', device: 'iPhone 15 Pro · Chrome', location: 'Ahmedabad, India', time: 'Current Session', isCurrent: true },
  { id: 'sess-2', device: 'Windows PC · Edge', location: 'Ahmedabad, India', time: 'Yesterday, 14:30', isCurrent: false },
  { id: 'sess-3', device: 'MacBook Pro · Safari', location: 'Mumbai, India', time: '3 days ago', isCurrent: false }
];
