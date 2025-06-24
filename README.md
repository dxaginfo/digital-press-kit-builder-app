# Digital Press Kit Builder

A web application that enables musicians and artists to create professional, shareable digital press kits.

## Features

- **User Account Management**: Create and manage your account
- **Press Kit Creation and Management**: Create multiple press kits for different projects/albums
- **Customizable Templates**: Choose from different design templates that match your genre/style
- **Multimedia Integration**: Upload and embed music tracks, videos, and high-resolution photos
- **Biography and Press Section**: Add artist biography, press quotes, and reviews
- **Tour Dates and Shows**: Add and manage upcoming show dates and past performance history
- **Contact Information**: Display booking and management contact information
- **Sharing and Distribution**: Generate unique URLs and export as PDF
- **Analytics**: Track views and engagement with your press kit

## Tech Stack

### Frontend
- React.js
- Redux for state management
- Material UI components
- Styled Components for styling
- Formik with Yup validation for forms

### Backend
- Node.js with Express.js
- RESTful API architecture
- JWT (JSON Web Tokens) for authentication

### Database
- MongoDB (for flexible schema to handle various press kit structures)
- AWS S3 (for media files)

### Deployment
- AWS Elastic Beanstalk
- Cloudflare CDN
- GitHub Actions for CI/CD

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB
- AWS account for S3 storage

### Setup

1. Clone the repository:
```bash
git clone https://github.com/dxaginfo/digital-press-kit-builder-app.git
cd digital-press-kit-builder-app
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

3. Set up environment variables:
```bash
# Create a .env file in the server directory
cp .env.example .env
# Edit .env file with your MongoDB URI, JWT secret, and AWS credentials
```

4. Start the development servers:
```bash
# Start backend server
cd server
npm run dev

# Start frontend development server
cd ../client
npm start
```

5. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
digital-press-kit-builder-app/
├── client/                   # React frontend
│   ├── public/               # Static files
│   └── src/                  # React components and logic
│       ├── components/       # Reusable components
│       ├── pages/            # Page components
│       ├── services/         # API service calls
│       ├── redux/            # Redux state management
│       └── utils/            # Utility functions
├── server/                   # Node.js backend
│   ├── config/               # Configuration files
│   ├── controllers/          # Request controllers
│   ├── models/               # MongoDB models
│   ├── routes/               # API routes
│   ├── services/             # Business logic
│   └── utils/                # Utility functions
└── shared/                   # Shared code between client and server
    ├── constants/            # Shared constants
    └── validation/           # Shared validation schemas
```

## API Documentation

The API documentation is available at `/api/docs` when running the server locally.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Material UI](https://mui.com/) - UI components
- [MongoDB](https://www.mongodb.com/) - Database
- [AWS S3](https://aws.amazon.com/s3/) - File storage
- [Express.js](https://expressjs.com/) - Web framework
- [React.js](https://reactjs.org/) - Frontend framework