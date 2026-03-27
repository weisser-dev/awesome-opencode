---
name: api-contract
description: Generate or validate OpenAPI and AsyncAPI specs from code or requirements with consistent naming, errors, and pagination
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: general
---

## What I do

- Generate OpenAPI 3.x or AsyncAPI specs from code or requirements
- Validate existing API specs for completeness and consistency
- Enforce consistent naming conventions across endpoints
- Standardize error response formats and HTTP status codes
- Define pagination, filtering, and sorting patterns

## When to use me

Use this skill when you need to:
- Design a new REST or async API from requirements
- Generate an OpenAPI spec from existing route handlers
- Validate an existing spec for consistency and completeness
- Standardize error responses across an API
- Add pagination to collection endpoints

## Process

1. **Discover**: Analyze existing API code or requirements
   - Scan route definitions, controllers, and handler files
   - Identify existing OpenAPI/Swagger specs if present
   - Note current naming conventions and response patterns

2. **Design resource model**: Map domain entities to API resources
   - Use plural nouns for collection endpoints (`/users`, `/orders`)
   - Use nested routes for relationships (`/users/{id}/orders`)
   - Avoid verbs in URLs; use HTTP methods for actions

3. **Define endpoints**: Specify each operation
   - HTTP method and path
   - Request parameters (path, query, header, body)
   - Request body schema with required fields
   - Response schemas for each status code
   - Authentication requirements

4. **Standardize patterns**: Apply consistent conventions

5. **Generate spec**: Produce the OpenAPI/AsyncAPI document

6. **Validate**: Check spec for completeness and correctness

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Paths | kebab-case, plural nouns | `/api/v1/user-accounts` |
| Query params | camelCase | `?pageSize=20&sortBy=createdAt` |
| Request/response fields | camelCase | `{ "firstName": "Jane" }` |
| Schema names | PascalCase | `UserAccount`, `OrderItem` |
| Enum values | UPPER_SNAKE_CASE | `"ORDER_PENDING"` |

## Standard Error Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address",
        "code": "INVALID_FORMAT"
      }
    ],
    "requestId": "req_abc123"
  }
}
```

### HTTP Status Code Usage

| Code | Usage |
|------|-------|
| 200 | Successful GET, PUT, PATCH |
| 201 | Successful POST that creates a resource |
| 204 | Successful DELETE with no response body |
| 400 | Validation error or malformed request |
| 401 | Missing or invalid authentication |
| 403 | Authenticated but insufficient permissions |
| 404 | Resource not found |
| 409 | Conflict (duplicate, state violation) |
| 422 | Semantically invalid request |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error |

## Pagination Pattern

```yaml
# Query parameters
parameters:
  - name: page
    in: query
    schema:
      type: integer
      minimum: 1
      default: 1
  - name: pageSize
    in: query
    schema:
      type: integer
      minimum: 1
      maximum: 100
      default: 20

# Response envelope
PagedResponse:
  type: object
  properties:
    data:
      type: array
      items: { $ref: '#/components/schemas/Item' }
    pagination:
      type: object
      properties:
        page: { type: integer }
        pageSize: { type: integer }
        totalItems: { type: integer }
        totalPages: { type: integer }
```

## Validation Checklist

- [ ] All endpoints have descriptions
- [ ] All request parameters have types and constraints
- [ ] All responses include schema definitions
- [ ] Error responses follow the standard format
- [ ] Collection endpoints support pagination
- [ ] Authentication requirements specified per endpoint
- [ ] Examples provided for request and response bodies
- [ ] No breaking changes from previous spec version (if updating)

## Rules

- Always version the API in the URL path (`/api/v1/...`)
- Use JSON as the default content type
- Include `requestId` in all error responses for traceability
- Define rate limiting headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`)
- Document all enum values explicitly in the schema
- Prefer `$ref` for reusable schemas over inline definitions
