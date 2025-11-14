# Repository/Service/Controllers Guide

This backend uses MikroORM for persistence and a layered architecture based on **Entity → Repository → Service → Controller**.

This document explains:

1. The responsibility of each layer.
2. How these layers work together.
3. How to approach implementing a ticket in this architecture.

---

## 1. Entities (MikroORM)

**What they are**

An **Entity** is a TypeScript class that represents a database table row plus its relationships.

Key points:

- Decorated with MikroORM decorators such as:
  - `@Entity()`, `@PrimaryKey()`, `@Property()`, `@ManyToOne()`, `@OneToMany()`, etc.
- Lives in `src/entities`.
- May extend shared base classes (e.g. `base.ts`, `base_status_log.ts`) to reuse:
  - `id`
  - timestamps
  - audit/status fields

**Why they matter**

- Provide a single, typed definition for core domain concepts:
  - Users, trips, travel groups, payments, itineraries, GTFS data, etc.
- MikroORM uses them to:
  - Map between database rows and objects.
  - Build type-safe queries.
  - Manage relationships and cascading operations.

**When to change entities**

- When the domain model changes (e.g. new field, new relationship).
- When introducing a new concept that should be persisted.

Always pair structural changes to entities with the appropriate database migration.

---

## 2. Repositories

**What they are**

A **Repository** encapsulates all database access for a specific entity (or set of closely related entities).

Responsibilities:

- Use MikroORM’s `EntityManager` / `EntityRepository` to:
  - Query (`find`, `findOne`, `findOneOrFail`, custom filters).
  - Persist (`persistAndFlush`, `remove`).
- Provide expressive methods that represent meaningful data access operations, such as:
  - `findByEmail(email: string)`
  - `findActiveById(id: string)`
  - `findByTravelGroup(groupId: string)`

**Why they matter**

- Centralize query logic and constraints.
- Avoid duplicated queries and inconsistent filters across the codebase.
- Provide a clean abstraction that services can depend on instead of raw ORM calls.

**Practices**

- Keep repositories focused on persistence concerns.
- If a new use case needs a specific query, add a method to the relevant repository rather than inlining queries in services or controllers.

---

## 3. Services

**What they are**

A **Service** contains the **business logic** for a specific domain area or feature.

Responsibilities:

- Implement use cases:
  - Booking a trip
  - Creating a travel group
  - Processing a payment
  - Updating statuses and logs
- Coordinate multiple repositories and entities.
- Enforce business rules and invariants:
  - Preconditions, validations, authorization (when not handled by guards), status transitions.

**Why they matter**

- Keep controllers free of complex logic.
- Keep repositories focused on persistence.
- Provide a stable place for domain behavior that can evolve without leaking into transport (HTTP) or persistence layers.

**Practices**

- Services should depend on repositories and other services, not on HTTP or framework-specific request objects.
- Throw appropriate exceptions (e.g. NestJS HTTP exceptions) where relevant to signal invalid states or constraints.

---

## 4. Controllers

**What they are**

A **Controller** is the HTTP interface, implemented with NestJS.

Responsibilities:

- Define routes and HTTP methods (e.g. `@Get`, `@Post`, `@Patch`).
- Accept and validate input (DTOs, parameters, query).
- Invoke the appropriate service method.
- Map service results to HTTP responses.

**Why they matter**

- Isolate transport concerns:
  - Routing
  - Status codes
  - Authentication/authorization guards
- Ensure external API contracts are enforced at the edges.

**Practices**

- Keep controllers thin.
- Do not implement business logic or data access directly in controllers.
- Delegate to services for all meaningful operations.

---

## 5. How the Layers Work Together

Typical request flow:

1. **Controller**
   - Receives an HTTP request.
   - Parses and validates inputs.
   - Calls a method on a service.

2. **Service**
   - Applies business rules.
   - Calls one or more repositories.
   - Creates/loads/modifies entities.
   - Returns a result (entity, DTO, or aggregate data).

3. **Repository**
   - Executes queries using MikroORM.
   - Returns entities or collections.

4. **Entity**
   - Represents the domain data being read/written.

Conceptually:

> Controller (HTTP) → Service (business logic) → Repository (persistence) → Entity (data model)

The response then flows back up the same path.

---

## 6. How to Implement a Ticket in This Architecture

Use this as a structured approach.

### Step 1: Clarify the domain behavior

Before coding:

- Identify which concepts are involved (e.g. User, TravelGroup, Trip, Payment).
- Understand the expected behavior:
  - What should happen?
  - What are the edge cases?
  - What are the constraints and preconditions?

### Step 2: Check or update the Entities

- Inspect `src/entities` for relevant entities.
- If all required fields and relationships exist:
  - Reuse them.
- If not:
  - Add/modify entity fields.
  - Add relationships as needed (e.g. `@ManyToOne`, `@OneToMany`).
  - Create a migration that aligns the database schema with the entity change.

Ensure:

- Naming is consistent.
- Types are accurate.
- New fields are reflected in migrations.

### Step 3: Use or extend the Repository

- Locate the repository for the entity (e.g. `users.repository.ts`, or the repository for the relevant module).
- If the ticket requires data access that doesn’t exist yet:
  - Add a dedicated method with a clear name.
  - Implement the query using MikroORM.
- Keep:
  - Filters and conditions close to the repository.
  - Pagination, ordering, and projections encapsulated where appropriate.

The goal is for services to call intention-revealing methods instead of assembling raw queries.

### Step 4: Implement or update the Service

- Identify the relevant service file.
- Add a method that:
  - Accepts input (DTO or parameters).
  - Uses repository methods to fetch or persist entities.
  - Applies business rules:
    - Validation
    - Access checks (if not handled elsewhere)
    - Status transitions
    - Cross-entity coordination
  - Throws meaningful errors when constraints fail.

Guidelines:

- Keep each service method focused on a single use case.
- Delegate repeated logic into private helper methods if necessary.

### Step 5: Expose it via a Controller (if part of the public API)

- Add or update an endpoint:
  - Choose HTTP method and route.
  - Bind request body/params/query to a DTO.
  - Call the new/updated service method.
  - Return the result.

Consider:

- Input validation (class-validator / pipes).
- Guards (authentication/authorization).
- Response shape / DTOs for external clients.

### Step 6: Add or update tests

- **Service tests**:
  - Mock repositories to focus on business logic.
- **Repository tests** (where valuable):
  - Use a test database or in-memory setup to validate queries.
- **E2E tests** (for critical flows):
  - Verify controller → service → repository → database integration and response.

---

## 7. Common Pitfalls to Avoid

- Calling MikroORM or raw SQL directly from controllers.
- Embedding complex business logic in controllers.
- Skipping repositories by querying directly from unrelated services.
- Modifying entities without:
  - Adding/updating migrations.
  - Reviewing existing repository/service logic for impact.
- Returning inconsistent shapes to clients by bypassing established DTOs.

---

## 8. Summary

The pattern enforced here:

- Keeps responsibilities separated.
- Makes the codebase more predictable.
- Simplifies maintenance, testing, and onboarding.
- Allows the system to grow in complexity while remaining understandable.

When in doubt:
1. Start from the domain concept (entity).
2. Express data access in a repository.
3. Implement behavior in a service.
4. Expose it via a controller when needed.
