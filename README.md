# OSINT Profile Generator and Management System

A comprehensive system for generating and managing realistic profiles for OSINT (Open Source Intelligence) research and security testing purposes.

## ⚠️ Important Disclaimer

This tool is intended for **legitimate OSINT research, security testing, and educational purposes only**. All generated profiles are entirely fictional and created using the randomuser.me API. Users are responsible for ensuring compliance with applicable laws and regulations in their jurisdiction.

## Features

### Profile Generation
- Integration with randomuser.me API for realistic profile data
- Customizable filters (nationality, gender, age range)
- High-quality profile photos
- Unique identifiers for each profile

### Social Media Profile Enhancement
- Automatic generation of consistent social media profiles
- Platforms supported: Facebook, Instagram, Twitter, LinkedIn
- Realistic interests, hobbies, and behavioral patterns
- Cross-platform username consistency
- Professional background and education details

### Data Management
- SQLite database for secure local storage
- Full CRUD operations for profiles
- Advanced search and filtering capabilities
- Tagging system for organization
- Usage logging and notes

### Security & Deployment
- Docker containerization for easy deployment
- Rate limiting and security middleware
- Automated backup system
- CI/CD pipeline with GitHub Actions
- Health checks and monitoring

## Installation

### Prerequisites
- Node.js 18+ 
- Docker and Docker Compose (for containerized deployment)

### Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd osint-profile-generator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Initialize the database:
```bash
npm run db:migrate
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (frontend) and `http://localhost:3001` (API).

### Docker Deployment

1. Build and run with Docker Compose:
```bash
docker-compose up -d
```

2. The application will be available at `http://localhost:3001`

### Easypanel Deployment

1. Create a new service in Easypanel
2. Use the provided `docker-compose.yml` configuration
3. Set up the required environment variables
4. Deploy the service

## API Documentation

### Endpoints

#### Generate Profile
```
POST /api/profiles/generate
```
Body:
```json
{
  "nationality": "US",
  "gender": "female",
  "minAge": 25,
  "maxAge": 35
}
```

#### Get All Profiles
```
GET /api/profiles?search=john&limit=20&offset=0
```

#### Get Profile Details
```
GET /api/profiles/:id
```

#### Delete Profile
```
DELETE /api/profiles/:id
```

#### Add Tag to Profile
```
POST /api/profiles/:id/tags
```
Body:
```json
{
  "tagName": "Research Target",
  "color": "#FF5733"
}
```

## Database Schema

### Tables
- `profiles`: Basic profile information
- `social_media_profiles`: Social media account details
- `tags`: Available tags for organization
- `profile_tags`: Profile-tag associations
- `usage_logs`: Activity tracking

## Configuration

### Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 3001)
- `DATABASE_PATH`: SQLite database file path
- `JWT_SECRET`: Secret key for JWT tokens
- `RATE_LIMIT_MAX_REQUESTS`: API rate limiting

## Security Considerations

1. **Rate Limiting**: API endpoints are rate-limited to prevent abuse
2. **Input Validation**: All inputs are validated and sanitized
3. **SQL Injection Protection**: Parameterized queries prevent SQL injection
4. **CORS Configuration**: Properly configured CORS for security
5. **Helmet.js**: Security headers for production deployment

## Backup and Recovery

The system includes an automated backup service that:
- Creates daily backups of the SQLite database
- Keeps the last 7 backups
- Stores backups in the `/backups` volume

To restore from backup:
```bash
docker-compose exec backup sh
cd /backups
tar -xzf backup-YYYYMMDD-HHMMSS.tar.gz -C /data
```

## Monitoring and Health Checks

- Health check endpoint: `GET /api/health`
- Docker health checks configured
- Logging with Morgan middleware
- Error tracking and reporting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## Legal and Ethical Guidelines

- Only use for legitimate research and testing purposes
- Respect privacy and applicable laws
- Do not use for harassment, fraud, or illegal activities
- Ensure proper authorization before conducting security tests
- Follow responsible disclosure practices

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

## Changelog

### v1.0.0
- Initial release
- Profile generation with randomuser.me integration
- Social media profile enhancement
- SQLite database with full CRUD operations
- Docker deployment support
- CI/CD pipeline
- Automated backup system