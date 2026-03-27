---
name: docker-optimize
description: Analyze Dockerfile and produce optimized version with multi-stage builds, layer caching, minimal base, and security hardening
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: general
---

## What I do

- Analyze existing Dockerfile for inefficiencies and security issues
- Produce an optimized version with multi-stage builds
- Maximize layer caching for faster builds
- Select minimal base images to reduce attack surface
- Apply security hardening best practices

## When to use me

Use this skill when you need to:
- Optimize a Dockerfile for smaller image size or faster builds
- Harden a container image for production deployment
- Convert a single-stage Dockerfile to multi-stage
- Debug slow Docker builds or bloated images
- Review a Dockerfile for security best practices

## Process

1. **Analyze**: Read the existing Dockerfile and `.dockerignore`
   - Identify the application type and runtime requirements
   - Note current base image and its size
   - Check for anti-patterns (see checklist below)

2. **Optimize base image**: Select the smallest viable base
   - `alpine` variants for minimal footprint
   - `distroless` for production (no shell, no package manager)
   - `slim` variants as a middle ground
   - Pin exact image digest or version tag, never use `latest`

3. **Implement multi-stage build**: Separate build and runtime
   ```dockerfile
   # Build stage
   FROM node:20-alpine AS build
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --production=false
   COPY . .
   RUN npm run build

   # Production stage
   FROM node:20-alpine AS production
   WORKDIR /app
   COPY --from=build /app/dist ./dist
   COPY --from=build /app/node_modules ./node_modules
   USER node
   EXPOSE 3000
   CMD ["node", "dist/index.js"]
   ```

4. **Maximize layer caching**: Order instructions by change frequency
   - Copy dependency manifests first, install, then copy source
   - Group rarely-changing instructions early in the Dockerfile
   - Use `.dockerignore` to exclude unnecessary files

5. **Security hardening**: Apply container security best practices
   - Run as non-root user
   - Drop all capabilities, add only what is needed
   - Set `HEALTHCHECK` instruction
   - Avoid storing secrets in image layers
   - Use `COPY` instead of `ADD` unless tar extraction is needed

6. **Validate**: Verify the optimized image
   - Compare image size before and after
   - Confirm the application starts correctly
   - Run a vulnerability scan on the final image

## Anti-Pattern Checklist

- [ ] Using `latest` tag for base image
- [ ] Running as root user
- [ ] Installing unnecessary packages (build tools in production image)
- [ ] Copying entire context before installing dependencies
- [ ] Using `ADD` when `COPY` suffices
- [ ] Not using `.dockerignore`
- [ ] Storing secrets in `ENV` or `ARG` instructions
- [ ] Multiple `RUN` commands that should be combined
- [ ] Not cleaning up package manager caches in the same layer

## Optimization Targets

| Metric | Goal |
|--------|------|
| Image size | Reduce by 50%+ from naive build |
| Build time (cached) | Under 30 seconds for source-only changes |
| Security | No critical/high CVEs in base image |
| Layers | Minimize total layer count |

## Language-Specific Patterns

### Java
```dockerfile
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package -DskipTests

FROM eclipse-temurin:21-jre-alpine
COPY --from=build /app/target/*.jar app.jar
USER 1001
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Go
```dockerfile
FROM golang:1.22-alpine AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /server .

FROM gcr.io/distroless/static
COPY --from=build /server /server
USER nonroot
EXPOSE 8080
ENTRYPOINT ["/server"]
```

## Rules

- Always pin base image versions explicitly
- Never store secrets or credentials in the image
- Always run the final container as a non-root user
- Combine `RUN` commands to reduce layers and clean up in the same layer
- Include a `.dockerignore` that excludes `.git`, `node_modules`, and build artifacts
