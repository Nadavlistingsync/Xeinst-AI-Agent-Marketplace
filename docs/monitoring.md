# Monitoring and Error Tracking

This document provides an overview of the monitoring and error tracking features implemented in the AI agency website.

## Real-time Updates

The application uses WebSocket connections to provide real-time updates for deployments. This includes:

- Deployment status changes
- Performance metrics
- Activity logs
- Health checks

### Usage

```typescript
import { useDeploymentSocket } from '@/hooks/useDeploymentSocket';

function DeploymentComponent({ deploymentId }: { deploymentId: string }) {
  const { status, metrics, logs, isConnected, error } = useDeploymentSocket({
    deploymentId,
  });

  // Use the real-time data in your component
}
```

## Error Tracking

We use Sentry for error tracking and monitoring. The implementation includes:

- Automatic error capturing
- Custom error boundaries
- API error handling
- Performance monitoring

### Error Boundary

Wrap your components with the error boundary to catch and handle React errors:

```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

### API Error Handling

Use the `useApiError` hook to handle API errors:

```typescript
import { useApiError } from '@/hooks/useApiError';

function YourComponent() {
  const { error, handleError, clearError } = useApiError();

  const handleApiCall = async () => {
    try {
      await apiCall();
    } catch (error) {
      handleError(error, { context: 'additional info' });
    }
  };
}
```

## Performance Monitoring

The application includes a performance monitoring system that tracks:

- Operation durations
- Success rates
- Error rates
- Custom metrics

### Usage

```typescript
import { measurePerformance } from '@/lib/performance';

async function yourFunction() {
  const result = await measurePerformance(
    'operation-name',
    async () => {
      // Your async operation
    },
    { additional: 'metadata' }
  );
}
```

## Automated Testing

The application includes comprehensive test coverage for:

- WebSocket functionality
- Deployment components
- Error handling
- Performance monitoring

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- src/test/websocket.test.ts
```

## CI/CD Pipeline

The application uses GitHub Actions for continuous integration and deployment:

1. **Test**: Runs all tests and type checks
2. **Build**: Builds the application
3. **Deploy**: Deploys to Vercel

### Pipeline Stages

1. **Test Stage**
   - Unit tests
   - Integration tests
   - Type checking
   - Linting

2. **Build Stage**
   - Build application
   - Generate Prisma client
   - Upload artifacts

3. **Deploy Stage**
   - Deploy to Vercel
   - Environment configuration
   - Production deployment

## Environment Variables

Required environment variables for monitoring:

```env
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_APP_URL=your-app-url
```

## Best Practices

1. **Error Handling**
   - Always use the error boundary for React components
   - Use the `useApiError` hook for API calls
   - Include relevant context with errors

2. **Performance Monitoring**
   - Use `measurePerformance` for async operations
   - Include meaningful operation names
   - Add relevant metadata

3. **Real-time Updates**
   - Handle connection states
   - Implement reconnection logic
   - Clean up subscriptions

4. **Testing**
   - Write tests for new features
   - Maintain test coverage
   - Test error scenarios

## Troubleshooting

### WebSocket Issues

1. Check connection status
2. Verify deployment ID
3. Check server logs
4. Verify environment variables

### Error Tracking Issues

1. Verify Sentry DSN
2. Check error boundary implementation
3. Verify error context
4. Check Sentry dashboard

### Performance Issues

1. Check operation durations
2. Monitor success rates
3. Review error rates
4. Check resource usage

## Support

For issues or questions:

1. Check the documentation
2. Review error logs
3. Contact the development team
4. Submit a GitHub issue 