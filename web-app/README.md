# Netxus Intelligence Hub - Web Application

**Core Netxus web application for autonomous AI agent ecosystem management**

## 🎯 **Overview**

The Netxus web application serves as the central intelligence hub for autonomous AI agent operations. This React-based frontend provides a comprehensive dashboard for managing AI workflows, content processing, and knowledge graph operations.

## 🚀 **Features**

### **Core Netxus Functionality**
- **Intelligence Dashboard**: Real-time overview of AI agent activities
- **Content Processing Pipeline**: Automated content capture and analysis
- **Knowledge Graph Management**: Visual representation of connected intelligence
- **Task Orchestration**: Centralized task distribution and monitoring
- **Performance Analytics**: Real-time metrics and optimization insights

### **Integration Points**
- **Supabase Backend**: Real-time database and authentication
- **Browser Extension**: One-click content capture system
- **GitHub Integration**: Automated repository management
- **Notion Workspace**: Knowledge base synchronization

## 🛠️ **Technology Stack**

### **Frontend**
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **React Router** for navigation
- **Recharts** for data visualization

### **Backend Integration**
- **Supabase** for database and real-time features
- **Edge Functions** for serverless processing
- **RESTful APIs** for external integrations

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Browser       │    │   Netxus        │    │   Supabase      │
│   Extension     │───▶│   Web App       │───▶│   Backend       │
│                 │    │   (React)       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   External      │
                       │   APIs          │
                       │   (GitHub,      │
                       │    Notion)      │
                       └─────────────────┘
```

## 📦 **Installation**

### **Prerequisites**
- Node.js 18+
- pnpm (recommended) or npm
- Supabase account

### **Setup**
```bash
# Clone and navigate to web-app
cd netxus/web-app

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env.local
# Add your Supabase credentials

# Start development server
pnpm dev
```

## 🔧 **Configuration**

### **Environment Variables**
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Netxus API Configuration
VITE_NETXUS_API_URL=your_netxus_api_url
VITE_NETXUS_API_KEY=your_netxus_api_key

# External Integrations
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_NOTION_CLIENT_ID=your_notion_client_id
```

## 🚀 **Development**

### **Available Scripts**
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm build:prod   # Build with production optimizations
pnpm preview      # Preview production build
pnpm lint         # Run ESLint
pnpm clean        # Clean node_modules and reinstall
```

### **Project Structure**
```
src/
├── components/          # Reusable UI components
├── pages/              # Route-based page components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── services/           # API and external service integrations
└── styles/             # Global styles and Tailwind config
```

## 🎮 **Usage**

### **Dashboard Navigation**
1. **Intelligence Hub**: Main overview dashboard
2. **Content Pipeline**: Monitor content capture and processing
3. **Knowledge Graph**: Visualize connected intelligence networks
4. **Task Management**: Track and manage AI agent tasks
5. **Analytics**: Performance metrics and optimization insights

### **Content Capture Workflow**
1. **Browser Extension**: Capture content from any webpage
2. **Automatic Processing**: Content sent to Netxus processing pipeline
3. **AI Analysis**: Intelligent content analysis and categorization
4. **Knowledge Integration**: Update knowledge graph with new insights
5. **Task Generation**: Create actionable tasks from captured content

## 🔐 **Security**

### **Authentication**
- Supabase Auth for user management
- Row Level Security (RLS) for data protection
- JWT tokens for API authentication

### **Data Protection**
- All sensitive data encrypted in transit and at rest
- API keys stored securely in environment variables
- Regular security audits and updates

## 📊 **Performance**

### **Optimization Features**
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: WebP format with fallbacks
- **Caching**: Intelligent caching strategies
- **Bundle Analysis**: Regular bundle size monitoring

### **Metrics**
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.0s

## 🧪 **Testing**

### **Test Coverage**
```bash
pnpm test         # Run unit tests
pnpm test:e2e     # Run end-to-end tests
pnpm test:coverage # Generate coverage report
```

## 🚀 **Deployment**

### **Production Build**
```bash
pnpm build:prod
```

### **Deployment Options**
- **Vercel**: Automatic deployments from Git
- **Netlify**: Static site hosting with serverless functions
- **AWS**: Custom deployment with CloudFront and S3
- **Self-hosted**: Docker containers with nginx

## 📈 **Monitoring**

### **Analytics Integration**
- Real-time user analytics
- Performance monitoring
- Error tracking and reporting
- API usage metrics

## 🤝 **Contributing**

### **Development Workflow**
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request
5. Code review and merge

### **Code Standards**
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Conventional commits for git messages

## 📞 **Support**

- **Documentation**: [GitHub Wiki](https://github.com/etaionline/netxus/wiki)
- **Issues**: [GitHub Issues](https://github.com/etaionline/netxus/issues)
- **Discussions**: [GitHub Discussions](https://github.com/etaionline/netxus/discussions)

---

## 🎉 **Ready to Transform Your Intelligence Workflow?**

**The Netxus Intelligence Hub is your gateway to autonomous AI operations.** 🛡️