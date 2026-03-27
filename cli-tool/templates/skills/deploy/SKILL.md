---
name: deploy
description: Guide deployment processes including CI/CD pipeline creation, environment setup, and rollback procedures
license: MIT
compatibility: opencode
metadata:
  audience: devops
  workflow: general
---

## What I do

- Analyze the project to determine the appropriate deployment strategy
- Generate CI/CD pipeline configurations (GitHub Actions, GitLab CI, etc.)
- Create environment-specific configurations
- Define rollback procedures
- Set up health checks and monitoring

## When to use me

Use this skill when you need to:
- Set up a new deployment pipeline
- Add a new deployment environment (staging, production)
- Create or update CI/CD configurations
- Plan a deployment strategy for a new service

## Deployment Strategies

### 1. Rolling Update (Default)
- Gradually replace instances
- Zero-downtime for stateless services
- Easy rollback

### 2. Blue/Green
- Two identical environments
- Switch traffic at once
- Instant rollback

### 3. Canary
- Route small percentage to new version
- Monitor metrics
- Gradual traffic shift

## CI/CD Templates

### GitHub Actions (Node.js)

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Deploy
        run: |
          # Add deployment commands
          echo "Deploying..."
```

### GitHub Actions (Java/Maven)

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
      - run: mvn verify
      - run: mvn package -DskipTests

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy
        run: echo "Deploying..."
```

## Rollback Procedure

1. **Detect**: Monitor health checks and error rates
2. **Decide**: If error rate > threshold, initiate rollback
3. **Execute**: Revert to previous version
4. **Verify**: Confirm health checks pass
5. **Communicate**: Notify team of rollback and reason

## Environment Checklist

- [ ] Environment variables configured
- [ ] Secrets stored securely (not in code)
- [ ] Database migrations applied
- [ ] Health check endpoint available
- [ ] Logging and monitoring configured
- [ ] Rollback procedure documented and tested
- [ ] SSL/TLS certificates valid
- [ ] DNS configured correctly
