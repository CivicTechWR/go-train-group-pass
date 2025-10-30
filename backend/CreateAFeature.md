# 📖 Playbook: Adding a Feature (with Tests)

This guide walks you through the full process for adding a new, tested feature module. This assumes the `{EntityName}` (e.g., `Route`, `User`) **already exists** in `src/entities/`.

### Step 1: Generate the Feature Module

First, use the NestJS CLI to create the boilerplate files for your new feature. Replace `{feature-name}` with your feature's name (e.g., `routes`, `trips`).

1.  From the `backend` directory, run the `generate` commands:

    ```bash
    nest generate module {feature-name}
    nest generate controller {feature-name}
    nest generate service {feature-name}
    ```

      * This creates a new `src/{feature-name}/` folder.
      * It also *automatically* adds `{FeatureName}Module` to your main `src/app.module.ts`.

### Step 2: Build the "Brains" (The Service)

The service will contain all your business logic. Since the `{EntityName}` entity already exists, you just need to "inject" its repository.

Go to the new file: `src/{feature-name}/{feature-name}.service.ts`.

```typescript
// src/{feature-name}/{feature-name}.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { {EntityName} } from '../entities/{entity-name}.entity'; // <-- Import the EXISTING entity

@Injectable()
export class {FeatureName}Service {
  // This is Dependency Injection.
  constructor(
    @InjectRepository({EntityName})
    private readonly {entityName}Repository: EntityRepository<{EntityName}>,
  ) {}

  // --- This is your business logic ---

  async findAll(): Promise<{EntityName}[]> {
    return this.{entityName}Repository.findAll();
  }

  async findOne(id: number): Promise<{EntityName} | null> {
    // Note: Adjust the property 'id' if your primary key is different
    return this.{entityName}Repository.findOne({ id });
  }
}
```

### Step 3: Create the "Receptionist" (The Controller)

Now, wire up your new service to web endpoints in the controller.

Go to the new file: `src/{feature-name}/{feature-name}.controller.ts`.

```typescript
// src/{feature-name}/{feature-name}.controller.ts

import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { {FeatureName}Service } from './{feature-name}.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('{feature-name}') // This sets the base URL: /{feature-name}
export class {FeatureName}Controller {
  constructor(private readonly {featureName}Service: {FeatureName}Service) {}

  @Get()
  @UseGuards(AuthGuard) // <-- Protect the endpoint
  findAll() {
    return this.{featureName}Service.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.{featureName}Service.findOne(+id); // +id casts string to number
  }
}
```

### Step 4: Connect Everything (The Module)

This is the final, crucial step. You must tell your new `{FeatureName}Module` about the `{EntityName}` entity so that `{FeatureName}Service` can inject its repository.

Go to the new file: `src/{feature-name}/{feature-name}.module.ts`.

```typescript
// src/{feature-name}/{feature-name}.module.ts

import { Module } from '@nestjs/common';
import { {FeatureName}Service } from './{feature-name}.service';
import { {FeatureName}Controller } from './{feature-name}.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs'; // <-- Import this
import { {EntityName} } from '../entities/{entity-name}.entity'; // <-- Import the EXISTING entity

@Module({
  imports: [
    MikroOrmModule.forFeature([{EntityName}]), // <-- ADD THIS LINE
    // This tells the module to make the {EntityName} repository
    // available for injection in the {FeatureName}Service.
  ],
  controllers: [{FeatureName}Controller],
  providers: [{FeatureName}Service],
})
export class {FeatureName}Module {}
```

-----

### Step 5: Add Unit Tests (The Service)

Now, let's write a **unit test** for the `{FeatureName}Service`. The goal is to test the service's logic in *isolation*, without touching a real database.

1.  Create a new test file: `src/{feature-name}/{feature-name}.service.spec.ts`.
2.  Add the following code. The comments explain each part of the setup.

<!-- end list -->

```typescript
// src/{feature-name}/{feature-name}.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { {FeatureName}Service } from './{feature-name}.service';
import { {EntityName} } from '../entities/{entity-name}.entity';
import { vi } from 'vitest'; // Vitest's mock/spy library

// Define a type for our mock repository
type MockRepository<T> = Partial<Record<keyof EntityRepository<T>, ReturnType<typeof vi.fn>>>;

describe('{FeatureName}Service', () => {
  let service: {FeatureName}Service;
  let mock{EntityName}Repository: MockRepository<{EntityName}>;

  // This is a sample object to use in our tests
  const test{EntityName}: {EntityName} = {
    id: 1,
    // ... add other required properties from your entity
  } as {EntityName};

  beforeEach(async () => {
    // 1. Create a mock repository object.
    // We only mock the functions our service actually calls.
    mock{EntityName}Repository = {
      findAll: vi.fn(),
      findOne: vi.fn(),
    };

    // 2. Create a NestJS testing module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {FeatureName}Service, // The service we want to test
        {
          // This is the special part:
          // We tell Nest to provide our 'mock{EntityName}Repository'
          // whenever someone asks for the '{EntityName}' repository.
          provide: getRepositoryToken({EntityName}),
          useValue: mock{EntityName}Repository,
        },
      ],
    }).compile();

    // 3. Get the instance of our service from the testing module
    service = module.get<{FeatureName}Service>({FeatureName}Service);
  });

  // A simple "sanity check" test
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test the 'findAll' method
  describe('findAll', () => {
    it('should return an array of {entityName}s', async () => {
      // Arrange: Set up the mock's return value
      mock{EntityName}Repository.findAll.mockResolvedValue([test{EntityName}]);

      // Act: Call the service method
      const result = await service.findAll();

      // Assert: Check the results
      expect(result).toEqual([test{EntityName}]);
      expect(mock{EntityName}Repository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  // Test the 'findOne' method
  describe('findOne', () => {
    it('should return a single {entityName} by ID', async () => {
      // Arrange
      mock{EntityName}Repository.findOne.mockResolvedValue(test{EntityName});

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(result).toEqual(test{EntityName});
      expect(mock{EntityName}Repository.findOne).toHaveBeenCalledWith({ id: 1 });
    });
  });
});
```

### Step 6: Run Your Tests

Now that your feature and tests are built, you can run them.

```bash
# Run all tests in the project
npm run test

# Run tests in watch mode (great for development)
npm run test:watch
```

-----

### 📚 Summary & Key Resources

1.  **Generate:** `nest g module/service/controller {feature-name}`
2.  **Service (`.service.ts`):** Inject the repository (`@InjectRepository({EntityName})`).
3.  **Controller (`.controller.ts`):** Inject the service.
4.  **Module (`.module.ts`):** Import `MikroOrmModule.forFeature([{EntityName}])`.
5.  **Test (`.spec.ts`):**
      * Create a `mock...Repository` object with `vi.fn()`.
      * Build a `TestingModule` that provides the mock using `getRepositoryToken`.
      * Test each service method by mocking its return value and asserting the result.

<!-- end list -->

* **NestJS Testing:** [https://docs.nestjs.com/testing](https://www.google.com/search?q=https://docs.nestjs.com/testing)
* **Vitest:** [https://vitest.dev/](https://vitest.dev/)