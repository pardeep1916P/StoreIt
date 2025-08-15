# StoreIt - Cloud File Storage Platform 🚀

A modern, scalable cloud file storage application built with **AWS serverless architecture**, featuring secure file management, real-time sharing, and intelligent storage optimization.

## 🌟 Live Demo & Links

- **🌐 Live Application**: [https://storeit-cloud-drive.vercel.app/](https://storeit-cloud-drive.vercel.app/)
- **📁 GitHub Repository**: [https://github.com/pardeep1916P/StoreIt](https://github.com/pardeep1916P/StoreIt)

## 🏗️ Architecture

### System Flow Diagram

```mermaid
graph LR
    A[User] --> B[Vercel Frontend]
    B --> C[AWS API Gateway]
    C --> D[AWS Lambda]
    D --> E[AWS DynamoDB]
    D --> F[AWS S3]
    D --> G[AWS Cognito]
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#fff3e0
    style D fill:#e8f5e8
    style E fill:#e3f2fd
    style F fill:#fce4ec
    style G fill:#f1f8e9
```

## 🚀 Key Features

- **📁 File Management**: Upload, download, and organize files
- **🔐 Authentication**: Secure user login with AWS Cognito
- **🤝 File Sharing**: Share files with other users
- **💾 Cloud Storage**: Scalable storage with AWS S3
- **📱 Responsive Design**: Works on all devices

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: AWS Lambda, API Gateway
- **Database**: AWS DynamoDB
- **Storage**: AWS S3
- **Authentication**: AWS Cognito
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- AWS Account
- Git

### Quick Start
```bash
# Clone repository
git clone https://github.com/pardeep1916P/StoreIt.git
cd StoreIt

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local

# Start development
npm run dev
```

## 📝 License

MIT License

---

**⭐ Star this repository if you find it helpful!**

**🔗 Connect with me:**
- **LinkedIn**: [Charan Chaitanya Devanaboyina](https://linkedin.com/in/chinnu-4a7174306)
- **GitHub**: [@pardeep1916P](https://github.com/pardeep1916P)

*Built with ❤️ using modern cloud technologies.*
