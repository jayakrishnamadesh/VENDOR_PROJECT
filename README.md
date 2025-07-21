# SAP Vendor Portal - Complete Full-Stack Application

A comprehensive, production-ready SAP ERP Vendor Portal built with **Angular 17** frontend and **Node.js + Express** backend, integrated with SAP OData v2 services.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Angular 17    │    │  Node.js API    │    │   SAP Backend   │
│    Frontend     │◄──►│   (Express)     │◄──►│  OData v2 API   │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📦 Features

### Frontend (Angular 17)
- **Modern Angular 17** with standalone components
- **Responsive Design** with mobile-first approach
- **Authentication & Authorization** with route guards
- **Modular Architecture** with lazy-loaded routes
- **Real-time Data** with RxJS observables
- **Error Handling** with fallback mechanisms
- **Professional UI/UX** with modern design patterns

### Backend (Node.js + Express)
- **RESTful API** with comprehensive endpoints
- **SAP OData Integration** with axios client
- **Session Management** with authentication middleware
- **Error Handling** with global error middleware
- **Logging** with Winston logger
- **Environment Configuration** with dotenv
- **Mock Data Fallback** for development/testing

### SAP Integration Modules
1. **VENDORLOGINSET** - Authentication
2. **PROFILESET** - Vendor profile management
3. **VENDORQUOTATIONS** - RFQ management
4. **PURCHASEORDERSET** - Purchase order tracking
5. **GOODSRECEIPTSET** - Goods receipt confirmation
6. **INVOICESET** - Invoice management
7. **PAYMENTSET** - Payment tracking
8. **AGEINGSET** - Aging reports

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Angular CLI 17+
- Access to SAP system (optional for demo)

### Installation

1. **Clone and Install Dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

2. **Configure SAP Connection**
```bash
# Copy environment template
cp server/.env server/.env.local

# Edit server/.env with your SAP credentials:
SAP_BASE_URL=http://172.17.19.24:8000/sap/opu/odata/sap/ZVENDORPORTALJK_SRV
SAP_USERNAME=K901586
SAP_PASSWORD=Kaar@271103
```

3. **Start Development Servers**
```bash
# Terminal 1: Start backend server
cd server
npm start

# Terminal 2: Start Angular frontend
npm start
```

4. **Access Application**
- Frontend: http://localhost:4200
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/api/health

## 📁 Project Structure

### Frontend Structure
```
src/app/
├── core/                    # Core services, guards, interceptors
│   ├── services/
│   │   └── auth.service.ts
│   ├── guards/
│   │   └── auth.guard.ts
│   └── interceptors/
│       └── auth.interceptor.ts
├── shared/                  # Shared components, models, utilities
│   ├── models/
│   │   └── vendor.model.ts
│   └── components/
│       ├── header/
│       └── sidebar/
├── login/                   # Login module
├── profile/                 # Profile management
├── dashboard/               # Main dashboard
│   ├── rfq/                # RFQ management
│   ├── po/                 # Purchase orders
│   └── gr/                 # Goods receipt
├── finance/                 # Financial modules
│   ├── invoice/            # Invoice management
│   ├── payment/            # Payment tracking
│   └── aging/              # Aging reports
└── app.routes.ts           # Application routing
```

### Backend Structure
```
server/
├── routes/                  # API route handlers
│   ├── login.js
│   ├── profile.js
│   ├── rfq.js
│   ├── po.js
│   ├── gr.js
│   ├── invoice.js
│   ├── payment.js
│   └── aging.js
├── services/
│   └── sapClient.js        # SAP OData client
├── middleware/
│   ├── session.js          # Authentication middleware
│   └── errorHandler.js     # Error handling
├── utils/
│   └── logger.js           # Winston logger
├── .env                    # Environment configuration
└── server.js               # Express server setup
```

## 🔌 API Endpoints

### Authentication
- `POST /api/login` - Vendor login
- `POST /api/login/logout` - Logout
- `GET /api/login/verify` - Verify token

### Profile Management
- `GET /api/profile` - Get vendor profile
- `PUT /api/profile` - Update profile
- `GET /api/profile/summary` - Profile summary

### RFQ Management
- `GET /api/rfq` - Get all RFQs
- `GET /api/rfq/:id` - Get RFQ details
- `POST /api/rfq/:id/quote` - Submit quotation

### Purchase Orders
- `GET /api/po` - Get purchase orders
- `GET /api/po/:id` - Get PO details
- `POST /api/po/:id/acknowledge` - Acknowledge PO

### Goods Receipt
- `GET /api/gr` - Get goods receipts
- `GET /api/gr/:id` - Get GR details
- `POST /api/gr/:id/confirm` - Confirm receipt

### Invoice Management
- `GET /api/invoice` - Get invoices
- `POST /api/invoice` - Create invoice
- `PUT /api/invoice/:id` - Update invoice
- `POST /api/invoice/:id/submit` - Submit invoice

### Payment Tracking
- `GET /api/payment` - Get payments
- `GET /api/payment/:id` - Get payment details
- `POST /api/payment/:id/retry` - Retry payment

### Aging Reports
- `GET /api/aging` - Get aging report
- `GET /api/aging/summary` - Aging summary
- `GET /api/aging/overdue` - Overdue invoices

## 🔧 Configuration

### Environment Variables
```bash
# SAP Configuration
SAP_BASE_URL=http://your-sap-server:8000/sap/opu/odata/sap/ZVENDORPORTALJK_SRV
SAP_USERNAME=your-username
SAP_PASSWORD=your-password

# Server Configuration
PORT=3001
NODE_ENV=development

# Session Configuration
SESSION_SECRET=your-secret-key
```

### Angular Environment
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3001/api'
};
```

## 🛡️ Security Features

- **Authentication Guards** - Route protection
- **Session Management** - Secure session handling
- **CORS Configuration** - Cross-origin request security
- **Input Validation** - Request data validation
- **Error Sanitization** - Secure error responses
- **Environment Variables** - Secure credential storage

## 🧪 Testing & Development

### Mock Data
The application includes comprehensive mock data for all modules, allowing development and testing without SAP connectivity.

### Error Handling
- Graceful fallback to mock data when SAP is unavailable
- User-friendly error messages
- Comprehensive logging for debugging

### Development Mode
```bash
# Enable development mode with detailed logging
NODE_ENV=development npm start
```

## 📊 Monitoring & Logging

### Winston Logger
- Structured logging with multiple levels
- File-based log rotation
- Console output in development
- Error tracking and debugging

### Health Checks
- API health endpoint: `/api/health`
- SAP connectivity monitoring
- Service status reporting

## 🚀 Deployment

### Production Build
```bash
# Build Angular application
npm run build

# Start production server
cd server
NODE_ENV=production npm start
```

### Environment Setup
1. Configure production SAP credentials
2. Set secure session secrets
3. Enable HTTPS in production
4. Configure reverse proxy (nginx/Apache)
5. Set up monitoring and logging

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the API health endpoint: `/api/health`
- Review server logs in `server/logs/`
- Verify SAP connectivity and credentials
- Check Angular console for frontend errors

## 🔄 Version History

- **v1.0.0** - Initial release with full SAP integration
- Complete vendor portal functionality
- Production-ready architecture
- Comprehensive error handling and fallbacks

---

**Built with ❤️ using Angular 17, Node.js, and SAP OData v2**