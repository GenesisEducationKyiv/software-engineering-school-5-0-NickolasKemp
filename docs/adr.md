## ADR-001: Framework Selection

#### Status: Accepted  
#### Date: 2025-06-08  
#### Author: Mykola Tubolev

### Context

The Weather API project aims to provide a robust, scalable, and maintainable RESTful service for weather data retrieval and subscription-based weather updates. The service must support:

- Real-time weather data retrieval by city
- User subscriptions for periodic weather updates (daily/hourly)
- Email notifications for confirmations and updates
- Secure, reliable, and maintainable codebase
- Easy extensibility for future features (e.g., more notification channels, additional data sources)
- Strong TypeScript support and testability

Given these requirements, the choice of framework is critical for long-term success.

### Considered Options

#### 1. ExpressJS
- **Pros:** Minimal setup, large ecosystem, many developers familiar with it.
- **Cons:** Less structure for modularity, more boilerplate for scalable architecture, not opinionated about project structure.

#### 2. Fastify
- **Pros:** High performance, built-in schema validation, lower resource usage, plugin system.
- **Cons:** Smaller ecosystem, less guidance for large-scale architecture, fewer community resources for advanced patterns.

#### 3. NestJS
- **Pros:** Modular architecture out of the box, built-in Dependency Injection, strong TypeScript support, encourages clean code and testing, supports both Express and Fastify under the hood, active community, and many ready-made integrations (validation, ORM - for example with Prisma, mailing, etc.).
- **Cons:** Steeper learning curve, more complex initial setup, more opinionated structure.

### Decision

**Selected NestJS**.

### Project Structure

```text
src/            # Application source code
├── weather/         # Weather data retrieval logic and endpoints
├── subscription/    # Subscription management and confirmation flows
├── email/           # Email notification service
├── tasks/           # Background processing (e.g., scheduled weather updates)
├── prisma/          # Database integration
├── app.module.ts    # Root module
static/         # Static files (e.g., HTML landing page)
test/           # Automated tests (unit, integration, e2e, mocks)
```

### Consequences

#### Positive
- Structured Development: NestJS’s opinionated structure enforces clean separation of concerns, simplifying onboarding and long-term maintenance.
- High Code Quality: TypeScript and Dependency Injection improve code reliability, testability, and developer productivity.
- Extensibility: The modular design and ecosystem enable easy integration of new features, such as additional notification channels or third-party APIs.
- Scalability: The architecture supports future growth, including potential migration to microservices or distributed systems.
- Community Support: A robust ecosystem and active community accelerate development and troubleshooting.

#### Negative
- Initial Complexity: Setup is more involved than lightweight frameworks like ExpressJS, though long-term benefits outweigh this.
- Potential Overkill: For very small projects, NestJS’s structure might be excessive, but the project’s scope justifies its use.
- Learning Curve: Developers new to NestJS may need time to adapt to its conventions and patterns.
