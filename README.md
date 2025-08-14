# StoreIt - File Storage Application

A modern file storage application built with Next.js frontend and Node.js backend, featuring AWS S3 integration and user authentication.

## 🚀 Features

- **File Upload & Management**: Drag & drop file uploads with progress tracking
- **User Authentication**: Secure login/signup with AWS Cognito
- **File Sharing**: Share files with other users
- **File Preview**: Preview various file types (images, documents, videos)
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Live file status updates

## 🏗️ Architecture

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Node.js with Express.js
- **Storage**: AWS S3 for file storage
- **Database**: AWS DynamoDB for metadata
- **Authentication**: AWS Cognito
- **API**: RESTful API with AWS API Gateway

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- AWS Account with appropriate permissions
- Git

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd main1
```

### 2. Backend Setup

```bash
cd backend
npm install
cp env.example .env.local
# Edit .env.local with your AWS credentials
npm start
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cp env.example .env.local
# Edit .env.local with your API Gateway URL
npm run dev
```

## 🔐 Environment Configuration

### Backend (.env.local)

```bash
# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_SESSION_TOKEN=your_aws_session_token
AWS_REGION=ap-south-1

# AWS Cognito Configuration
USER_POOL_ID=your_user_pool_id
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret

# DynamoDB Configuration
TABLE_NAME=storeit-files

# S3 Configuration
BUCKET_NAME=storeit-files-bucket

# Server Configuration
PORT=3001
NODE_ENV=development
```

### Frontend (.env.local)

```bash
# API Gateway Configuration
NEXT_PUBLIC_API_GATEWAY_URL=your_api_gateway_url

# AWS S3 Configuration
NEXT_PUBLIC_S3_BUCKET_NAME=storeit-user-files
NEXT_PUBLIC_AWS_REGION=ap-south-1

# Next.js Configuration
NEXT_PUBLIC_APP_NAME=StoreIt
NEXT_PUBLIC_APP_VERSION=1.0.0

# Development Configuration
NODE_ENV=development
```

## 🚀 Running the Application

### Development Mode

```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

### Production Mode

```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
npm start
```

## 📁 Project Structure

```
main1/
├── backend/                 # Node.js backend server
│   ├── index.mjs          # Main server file
│   ├── utils/             # Utility functions
│   └── package.json       # Backend dependencies
├── frontend/               # Next.js frontend application
│   ├── app/               # App router pages
│   ├── components/        # Reusable components
│   ├── lib/               # Utility libraries
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── .gitignore             # Git ignore rules
├── README.md              # This file
└── env.example            # Environment examples
```

## 🔒 Security Features

- Environment variables for sensitive configuration
- AWS IAM roles and policies
- Secure file upload validation
- User authentication and authorization
- HTTPS enforcement in production

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📦 Deployment

### Backend Deployment
- Deploy to AWS Lambda or EC2
- Configure environment variables
- Set up API Gateway

### Frontend Deployment
- Build the application: `npm run build`
- Deploy to Vercel, Netlify, or AWS S3
- Configure environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

## 🔄 Version History

- **v1.0.0**: Initial release with basic file storage functionality
- **v1.1.0**: Added file sharing and user management
- **v1.2.0**: Enhanced UI/UX and mobile responsiveness

---

**Note**: Make sure to never commit your actual `.env.local` files as they contain sensitive information. The `.gitignore` file is configured to exclude these files automatically.
