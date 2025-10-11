# CI/CD Setup Guide

## Overview

This project uses Gitea Actions for CI/CD with the following infrastructure:
- **Gitea**: Source control and CI/CD orchestration
- **Gitea Runners**: 2 runners with Docker support
- **Docker Registry**: Local registry at `gitea.dredre.net:5005`
- **HashiCorp Vault**: Secrets management at `localhost:8201`

## Infrastructure

### Gitea Runners
- **gitea-runner-1** & **gitea-runner-2**
- Labels: `docker`, `ubuntu-latest`, `ubuntu-20.04`, `ubuntu-22.04`, `ubuntu-24.04`, `alpine`, `debian`
- Capability: Docker-in-Docker support

### Docker Registry
- URL: `gitea.dredre.net:5005`
- Auth: HTTP Basic Auth (htpasswd)
- Storage: Delete enabled for cleanup

### Vault (Development)
- URL: `http://localhost:8201`
- Status: May need initialization

## CI/CD Pipeline

The pipeline is defined in `.gitea/workflows/ci.yml` and consists of:

### 1. Lint & Type Check
- ESLint
- TypeScript type checking
- Runs on all pushes and PRs

### 2. Build
- Next.js build with production optimizations
- Standalone output for Docker
- Uploads build artifacts

### 3. Test
- Runs test suite (when configured)
- Currently continues on error

### 4. Docker Build & Push
- Only on `main` and `develop` branches
- Multi-stage Docker build
- Pushes to local registry
- Tags: `latest`, `branch-name`, `branch-sha`

### 5. Deploy
- **Development**: Triggered on `develop` branch
- **Production**: Triggered on `main` branch

## Required Secrets

Configure these in Gitea repository settings (`Settings` → `Secrets`):

### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

### Docker Registry
```
REGISTRY_USERNAME=dre
REGISTRY_PASSWORD=<your-registry-password>
```

### Optional Secrets
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Setting Up Secrets in Gitea

### Via Web UI
1. Navigate to repository: `https://gitea.dredre.net/dre/go-transit-group`
2. Go to `Settings` → `Secrets`
3. Add each secret with name and value
4. Secrets are encrypted and only available to workflows

### Via API (Programmatic)
```bash
# Using Gitea API
curl -X POST https://gitea.dredre.net/api/v1/repos/dre/go-transit-group/secrets \
  -H "Authorization: token YOUR_GITEA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "REGISTRY_PASSWORD",
    "data": "your-password-here"
  }'
```

## Vault Integration (Future)

To integrate with HashiCorp Vault for dynamic secrets:

1. Initialize Vault (if not already done):
```bash
docker exec -it gitea-vault-dev vault operator init
```

2. Unseal Vault:
```bash
docker exec -it gitea-vault-dev vault operator unseal <unseal-key>
```

3. Store secrets:
```bash
docker exec -it gitea-vault-dev vault kv put secret/go-transit-group \
  supabase_url="https://xxxxx.supabase.co" \
  supabase_anon_key="eyJhbGci..." \
  registry_password="xxxxx"
```

4. Update workflow to fetch from Vault using Vault Action

## Docker Registry Authentication

### Local Development
```bash
# Login to registry
docker login gitea.dredre.net:5005
Username: dre
Password: <your-password>

# Pull image
docker pull gitea.dredre.net:5005/go-transit-group:latest

# Run locally
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL="..." \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="..." \
  gitea.dredre.net:5005/go-transit-group:latest
```

### Registry Management
```bash
# List images
curl -u dre:password https://gitea.dredre.net:5005/v2/_catalog

# List tags for image
curl -u dre:password https://gitea.dredre.net:5005/v2/go-transit-group/tags/list

# Delete image (requires storage delete enabled)
curl -X DELETE -u dre:password \
  https://gitea.dredre.net:5005/v2/go-transit-group/manifests/<digest>
```

## Triggering Workflows

### Automatic Triggers
- Push to `main` or `develop`: Full CI/CD pipeline
- Pull request: Lint, build, and test only
- No docker build or deployment on PRs

### Manual Triggers
```bash
# Via Gitea UI
# Navigate to Actions tab → Select workflow → Run workflow

# Via API
curl -X POST https://gitea.dredre.net/api/v1/repos/dre/go-transit-group/actions/workflows/ci.yml/dispatches \
  -H "Authorization: token YOUR_GITEA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ref": "main"}'
```

## Monitoring Workflow Runs

### Via Web UI
1. Go to repository Actions tab
2. View running/completed workflows
3. Click on workflow run to see logs
4. Download artifacts if needed

### Via CLI (using git)
```bash
# Check workflow status (requires Gitea CLI)
gitea actions list

# View logs
gitea actions logs <run-id>
```

## Deployment Strategies

### Current Setup (Manual Deployment Steps)
The workflow creates deployment jobs but requires manual deployment configuration.

### Recommended: Docker Compose Deployment
Create `docker-compose.prod.yml`:
```yaml
version: '3.8'

services:
  app:
    image: gitea.dredre.net:5005/go-transit-group:latest
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    restart: unless-stopped
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

Deploy with:
```bash
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### Alternative: Kubernetes Deployment
For production-grade deployment, consider k3s or k8s with:
- Ingress controller for HTTPS
- Persistent volumes for uploads
- Horizontal pod autoscaling
- Health checks and readiness probes

## Troubleshooting

### Workflow Not Triggering
- Check runner status: `docker logs gitea-runner-1`
- Verify workflow file is in `.gitea/workflows/`
- Ensure branch protection rules allow pushes

### Build Failures
- Check secrets are properly configured
- Verify Node.js version compatibility
- Review build logs in Actions tab

### Docker Push Failures
- Verify registry credentials
- Check registry is accessible: `curl https://gitea.dredre.net:5005/v2/`
- Ensure disk space available on registry host

### Secret Access Issues
- Secrets are only available in workflow context
- Cannot be logged or printed (Gitea masks them)
- Verify secret names match workflow references

## Best Practices

1. **Branch Strategy**
   - `main`: Production-ready code
   - `develop`: Integration branch
   - `feature/*`: Feature branches
   - Merge to `develop` first, then `main`

2. **Commit Frequently**
   - Atomic commits
   - Meaningful commit messages
   - Link to issues: `Fixes #123`

3. **Test Before Merge**
   - All checks must pass
   - Review docker build logs
   - Test deployment in dev environment

4. **Security**
   - Never commit `.env.local`
   - Rotate secrets regularly
   - Use Vault for production secrets
   - Enable branch protection on `main`

5. **Monitoring**
   - Check workflow runs regularly
   - Set up email notifications for failures
   - Monitor registry disk usage

## Next Steps

1. **Initialize Vault** and migrate secrets from Gitea
2. **Configure deployment target** (add SSH host or k8s cluster)
3. **Set up monitoring** (Prometheus + Grafana)
4. **Add E2E tests** to pipeline
5. **Configure automatic rollbacks** on deployment failure
6. **Set up staging environment** for pre-production testing

## References

- [Gitea Actions Documentation](https://docs.gitea.com/next/usage/actions/overview)
- [Docker Registry API](https://docs.docker.com/registry/spec/api/)
- [HashiCorp Vault Documentation](https://developer.hashicorp.com/vault/docs)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
