# AI Agency Website

A modern marketplace for AI agents and deployments, built with Next.js, Prisma, and PostgreSQL.

## Features

- 🚀 Modern tech stack with Next.js 14 and TypeScript
- 🎨 Beautiful UI with Tailwind CSS and shadcn/ui
- 🔐 Authentication with NextAuth.js
- 📊 Real-time metrics and analytics
- 💬 Review and feedback system
- 🛍️ Marketplace for AI agents
- 📱 Responsive design
- 🔄 CI/CD pipeline with GitHub Actions
- 🐳 Docker support for development and production

## Prerequisites

- Node.js 18 or later
- PostgreSQL 14 or later
- Docker and Docker Compose (optional)

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-agency-website.git
cd ai-agency-website
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit `.env` with your configuration.

4. Set up the database:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

Or using Docker:
```bash
docker-compose up
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run type-check` - Run TypeScript type checking

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage
npm run test:coverage
```

## Deployment

The project is configured for deployment on Vercel. The CI/CD pipeline will automatically deploy to production when changes are pushed to the main branch.

1. Fork the repository
2. Connect your Vercel account
3. Set up the required environment variables
4. Deploy!

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please:

1. Check the [documentation](docs/)
2. Review [existing issues](https://github.com/yourusername/ai-agency-website/issues)
3. Create a new issue if needed

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Prisma](https://www.prisma.io/)
- [Sentry](https://sentry.io/)
