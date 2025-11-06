# Supabase Advanced Configuration & Troubleshooting

This guide covers advanced Supabase configuration, deployment scenarios, and troubleshooting for the Go Train Group Pass backend.

> **Quick Start**: For basic setup, see the [README.md](./README.md#getting-started) quick start guide. This document covers advanced scenarios.

## Local Development Configuration

### Port Customization

If the default Supabase ports conflict with other services, modify `supabase/config.toml`:

```toml
[api]
port = 54321  # API
enabled = true

[db]
port = 54322  # Database
major_version = 17

[studio]
port = 54323  # Studio UI

[inbucket]
port = 54324  # Email testing
```

### Environment-Specific Configuration

Different environments may require different configurations:

#### Development (Local)
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
SUPABASE_URL=http://127.0.0.1:54321
NODE_ENV=development
```

#### Staging
```env
DATABASE_URL=postgresql://postgres.[STAGING_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
SUPABASE_URL=https://[STAGING_REF].supabase.co
NODE_ENV=staging
```

#### Production
```env
DATABASE_URL=postgresql://postgres.[PROD_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
SUPABASE_URL=https://[PROD_REF].supabase.co
NODE_ENV=production
```

## Advanced Setup Scenarios

### Multiple Environment Setup

For teams working across multiple environments:

1. **Local Development**: Use default local Supabase
2. **Feature Testing**: Create feature-specific branches in hosted Supabase
3. **Staging**: Shared staging environment for integration testing
4. **Production**: Production Supabase project

### Custom Database Schema

To customize the database schema beyond the default migrations:

1. **Create custom migrations**:
   ```bash
   npm run migrate:create -- --name CustomSchema
   ```

2. **Edit migration file** in `backend/src/database/migrations/`

3. **Apply migrations**:
   ```bash
   npm run migrate:up
   ```

### TypeScript Type Generation

Generate TypeScript types from your database schema:

```bash
# Local development
supabase gen types typescript --local > src/types/supabase.ts

# Hosted environment
supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts
```

## Connection Pooling & Performance

### Production Database Configuration

For production environments, use connection pooling:

```env
# High-traffic applications
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true

# Connection limits
DB_POOL_MIN=2
DB_POOL_MAX=10
```

### MikroORM Optimization

Optimize MikroORM for production in `mikro-orm.config.ts`:

```typescript
export default defineConfig({
  // ... other config
  dbName: process.env.DB_NAME,
  debug: process.env.NODE_ENV !== 'production',
  migrations: {
    path: './src/database/migrations',
    emit: 'ts',
  },
  // Enable connection pooling for production
  pool: {
    min: 2,
    max: 10,
  },
});
```

## Migration Strategies

### Safe Migration Deployment

For production deployments:

1. **Backup first**:
   ```bash
   # Create backup
   pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
   ```

2. **Test migrations on staging**:
   ```bash
   # Switch to staging environment
   export DATABASE_URL="staging-database-url"
   npm run migrate:up
   ```

3. **Deploy to production**:
   ```bash
   # Switch to production
   export DATABASE_URL="production-database-url"
   npm run migrate:up
   ```

### Migration Rollback

If migrations fail:

```bash
# Rollback last migration
npm run migrate:down

# Or rollback to specific migration
npm run migrate:down -- --to 20231105213554
```

## Authentication Configuration

### Supabase Auth Settings

Configure authentication settings in your Supabase dashboard:

1. **Site URL**: Set to your frontend URL
2. **Redirect URLs**: Add allowed redirect URLs
3. **Email Templates**: Customize email templates
4. **Provider Settings**: Configure OAuth providers

### JWT Configuration

Customize JWT settings for your security requirements:

```typescript
// In your auth configuration
{
  jwt: {
    exp: 3600, // 1 hour
    secret: process.env.JWT_SECRET,
  }
}
```

## Monitoring & Debugging

### Database Monitoring

Monitor database performance:

```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check database size
SELECT pg_size_pretty(pg_database_size('postgres'));
```

### Supabase Studio

Access Supabase Studio for:
- **Database Explorer**: Browse tables and data
- **SQL Editor**: Run custom queries
- **Auth**: Manage users and policies
- **API**: Test endpoints
- **Logs**: Monitor application logs

### Application Logging

Enable detailed logging in development:

```typescript
// In your application setup
import { Logger } from '@nestjs/common';

const logger = new Logger('Supabase');

logger.log('Database connected successfully');
logger.error('Database connection failed', error.stack);
```

## Security Considerations

### Row Level Security (RLS)

Implement RLS policies for data security:

```sql
-- Example: Users can only access their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Example: Admin access
CREATE POLICY "Admins can access all data" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
```

### API Security

Secure your API endpoints:

1. **CORS Configuration**: Set appropriate CORS policies
2. **Rate Limiting**: Implement rate limiting for production
3. **Input Validation**: Validate all user inputs
4. **HTTPS**: Always use HTTPS in production

## Backup & Recovery

### Automated Backups

Set up automated backups:

```bash
#!/bin/bash
# backup-database.sh
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > "backup_${DATE}.sql"
aws s3 cp "backup_${DATE}.sql" s3://your-backup-bucket/
```

### Point-in-Time Recovery

For critical data recovery:

1. **Enable Point-in-Time Recovery** in Supabase dashboard
2. **Keep backup retention** period appropriate for your needs
3. **Test recovery procedures** regularly

## Troubleshooting Common Issues

### Connection Issues

**Problem**: "Connection refused" or timeout errors

**Solutions**:
1. Check if Supabase is running: `supabase status`
2. Verify environment variables: `echo $DATABASE_URL`
3. Test connection manually: `psql $DATABASE_URL`
4. Check firewall settings
5. Verify port availability: `lsof -i :54322`

### Migration Failures

**Problem**: Migration errors or database schema conflicts

**Solutions**:
1. Check migration syntax in migration files
2. Verify database permissions
3. Review migration order and dependencies
4. Reset database if safe: `npm run migrate:down && npm run migrate:up`
5. Check for concurrent migration processes

### Performance Issues

**Problem**: Slow queries or high database load

**Solutions**:
1. Add database indexes for frequently queried columns
2. Use database connection pooling
3. Optimize ORM queries with proper relations
4. Monitor database performance in Supabase dashboard
5. Consider read replicas for heavy read operations

### Authentication Issues

**Problem**: JWT errors or authentication failures

**Solutions**:
1. Verify Supabase keys in environment variables
2. Check JWT expiration settings
3. Ensure correct audience and issuer settings
4. Test with Supabase CLI: `supabase auth login`
5. Clear browser storage and retry

### Port Conflicts

**Problem**: "Address already in use" errors

**Solutions**:
1. Check what's using the port: `lsof -i :54321`
2. Stop conflicting services
3. Change Supabase ports in `supabase/config.toml`
4. Use different local ports for multiple projects

## Getting Help

### Documentation Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [MikroORM Documentation](https://mikro-orm.io/docs)
- [NestJS Database Documentation](https://docs.nestjs.com/recipes/sql-typeorm)

### Community Support

- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/supabase)

### Internal Support

For project-specific issues:
- Check existing issues in the project repository
- Contact the CivicTech WR development team
- Review project-specific documentation and setup guides
