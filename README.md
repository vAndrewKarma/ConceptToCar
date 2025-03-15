### TEAM NAME: © Karma Devs 2025

![ConceptToCar Logo](./logo.png)

# ConceptToCar: Product Lifecycle Management System

## [LICENSE & Copyright](./LICENSE)

This project is the exclusive property of its creators and contributors. All rights are reserved, and the code, documentation, and any associated assets cannot be copied, used, modified, or claimed by any individual or organization without explicit permission. Unauthorized use or reproduction of any part of this project is strictly prohibited

## Description

ConceptToCar is a comprehensive web application developed to manage the entire lifecycle of a product—from the initial concept stage to eventual withdrawal. Created as part of a contest in collaboration with DRÄXLMAIER Group and the University of Pitești (Romania), the project provides a digital backbone for companies in the automotive industry by centralizing product information and processes.

## Overview

- **Project Purpose:**  
  Manage the complete lifecycle of a product, including phases such as concept, feasibility, design, production, withdrawal, standby, and cancellation. The system enables users and administrators to monitor and control each phase, leading to better decision-making and reduced operational costs.

- **Target Audience:**  
  Two distinct user groups are supported:

  - **Users:** Can view and filter product data, update stages, etc.
  - **Administrators:** Have extended access for creating, updating, and deleting products as well as managing lifecycle phases.

- **Key Features:**
  - Full CRUD operations for product data management.
  - Dual interfaces for users and administrators.
  - Detailed PDF report generation.
  - Integration with relational databases (MySQL, PostgreSQL, SQL Server, etc.) or file-based storage (JSON, XML) ensuring data integrity.

## Project Structure

- **Backend:**  
  Implements the business logic and handles data operations, including the transition of products through various lifecycle stages.

- **Frontend:**  
  Provides two separate interfaces:

  - A user interface for viewing and interacting with product information.
  - An admin interface for managing products and lifecycle processes.

- **Database:**  
  Supports relational database systems or file-based storage mechanisms to maintain data integrity and relationships between entities such as products, lifecycle stages, materials, and users.

- **Report Generation:**  
  Enables the creation of comprehensive PDF reports detailing product statuses and lifecycle phases.

## Requirements

- **Environment:**

  - A compatible operating system for web applications (Windows, macOS, Linux).
  - MongoDB for database storage.
  - Redis for caching and session management.
  - RabbitMQ for message brokering.
  - [Optional] Skaffold for a clear development enviorement.
  - [Optional] Kubernetes (K8s) for orchestration and Helm for package management.

- **Dependencies:**  
  Refer to the specific backend and frontend documentation for details on installation and required dependencies:
  - **Backend:**
    - Node.js
    - Go
    - Python
  - **Frontend:**
    - React

## Estimated Capacity

Based on the current Kubernetes configurations and resource allocations, the ConceptToCar backend system is estimated to handle approximately: 7000~ users

**HPA Configuration:**

- **Target CPU Utilization:** 50%
- **Minimum Replicas:** 2
- **Maximum Replicas:** 10

**Scaling Behavior:**

- **Scale Up:** When CPU utilization exceeds 50%, HPA increases the number of pod replicas to distribute the load.
- **Scale Down:** When CPU utilization falls below 50%, HPA reduces the number of pod replicas to conserve resources.

### User Estimation

- Assuming an average user generates 1 request per second, the system can handle approximately **7000 concurrent users**.

- ⚠️ These estimates are based on the current configurations and may vary depending on the actual workload and resource usage patterns.

## Services Overview

| Service Name                   | Language   | Description                                                                 |
| ------------------------------ | ---------- | --------------------------------------------------------------------------- |
| **AuthentService**             | TypeScript | Handles user registration, login, and email verification.                   |
| **EmailService**               | Go         | Handles sending emails for user verification and password recovery.         |
| **ProductsService**            | TypeScript | Manages products and materials, including creation, updating, and deletion. |
| **UserRegistrationKeyService** | TypeScript | Handles user registration keys and related operations.                      |
| **MaterialPriceService**       | Python     | Gets the material price for a product.                                      |

## Library

We've developed a shared library named `@karma-packages/conceptocar-common`, which is deployed to npm. This library contains common functions and utilities that are used across various services in the ConceptToCar project. By centralizing these functions, we ensure consistency and reduce code duplication.

### How it Works:

The `@karma-packages/conceptocar-common` library includes a variety of helper functions, middleware, and configurations that facilitate the development and maintenance of our microservices.

## Communication between Services

For communication between services, **RabbitMQ** will be used as a message broker for pub/sub and work queue patterns. RabbitMQ is a reliable, scalable, and widely used message broker that facilitates communication between distributed systems.

### How it Works:

1. **Publisher-Subscriber Model**:

   - Services can publish messages (events) to specific exchanges.
   - Subscribing services can bind queues to exchanges to receive relevant messages.
   - This enables asynchronous communication, allowing services to function independently.

2. **Update Events**:

   - Services publish update events to exchanges to notify other services about system changes.
   - Subscribing services consume these events from their queues and react accordingly, ensuring real-time updates across the application.

3. **Scalability and Reliability**:
   - RabbitMQ supports message persistence, acknowledgments, and clustering, ensuring reliable message delivery.
   - It enables load balancing by distributing messages across multiple consumers.

### Example Usage:

- **Registration/Login Service**: Publishes user-related events such as user registration to an exchange.
- **Email Service**: Subscribes to user registration events and sends verification emails accordingly.

## Deployment

- **Backend Deployment**

  - Platform: Google Cloud (GCloud)
  - Description: The backend services are deployed on Kubernetes (K8s) clusters managed by Google Kubernetes Engine (GKE). Helm is used for package management and deployment automation for the databases.

- **Frontend Deployment**
  - Platform: Content Delivery Network (CDN)
  - Description: The frontend application is deployed on a CDN for fast and reliable content delivery to users worldwide.

## Installation and Configuration

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/vAndrewKarma/ConceptToCar.git
   cd ConceptToCar
   ```

2. **Install frontend dependencies (Node.js required):**

   ```bash
   cd frontend
   npm i
   ```

3. **Start backend (Skaffold required, Minikube or any Kubernetes environment required, Docker required):**
   ```bash
   cd ../backend
   skaffold dev
   ```

### ⚠️ IMPORTANT

- If you want to use **localhost** instead of the official app backend, you must change routes inside the frontend.
- Currently, this setup is temporary. Some improvements are needed, but due to time constraints, we couldn't implement them.

## CI/CD Pipeline for Backend and Frontend

This project includes separate CI/CD pipelines for the backend and frontend, using GitHub Actions for automated deployment. The frontend is deployed to Google Cloud Storage (GCS), while the backend is built into Docker images and deployed to a Kubernetes cluster on Google Kubernetes Engine (GKE).

---

## Frontend CI/CD

### Workflow Overview

The frontend CI/CD pipeline performs the following steps:

1. **Checkout Code** - Retrieves the latest code from the repository.
2. **Set Up Node.js** - Installs Node.js version 18.
3. **Install Dependencies** - Runs `npm install` in the frontend directory.
4. **Build the Project** - Runs `npm run build` to generate the production-ready files.
5. **Authenticate to Google Cloud** - Uses a service account to authenticate.
6. **Set Up Google Cloud SDK** - Configures Google Cloud tools.
7. **Deploy to GCS** - Copies the built frontend files to a GCS bucket.
8. **Set Website Configuration** - Ensures the correct files are served as the website.

### Deployment Target

The frontend files are stored in a GCS bucket (`karma-buckets`) and configured as a static website.

---

## Backend CI/CD

### Workflow Overview

The backend CI/CD pipeline includes:

1. **Checkout Code** - Retrieves the latest backend code.
2. **Set Up Node.js** - Installs Node.js version 18.
3. **Authenticate to Docker Hub** - Logs into Docker Hub.
4. **Install Dependencies** - Installs necessary dependencies for each backend service.
5. **Build the Project** - Runs `npm run build` for each service.
6. **Authenticate to Google Cloud** - Uses a service account for authentication.
7. **Set Up Google Cloud SDK** - Installs necessary tools.
8. **Configure Docker for GCP** - Authenticates Docker with Google Cloud.
9. **Build and Push Docker Images** - Builds and pushes images for multiple services (`authentservice`, `keys`, `products`, `mailservice`).
10. **Deploy to GKE** - Retrieves cluster credentials and restarts Kubernetes deployments.
11. **Wait for Deployments** - Ensures the services are running successfully.
12. **Health Checks** - Uses `curl` to verify that key endpoints are responding.

### Services Deployed

- `authentservice`
- `keys`
- `products`
- `mailservice`

These services are deployed to a Kubernetes cluster and restarted on each update.

---

## Testing Limitations

Due to time constraints, we were unable to integrate additional testing using `curl` for more thorough validation. Ideally, we would have included more API tests and automated integration checks. However, the current pipeline does perform basic health checks for key endpoints.

---

## Future Improvements

- **Expanded Testing**: Increase test coverage with automated API and integration tests.
- **Staging Environment**: Add a dedicated cluster for testing before deploying to production (no money).

---

## Security Measures

The ConceptToCar backend project incorporates several security measures to ensure the safety and integrity of the application and its data. Below is a summary of the key security measures implemented:

### 1. HMAC (Hash-based Message Authentication Code)

- **Usage:** HMAC is used to verify the integrity and authenticity of tokens.
- **Implementation:**
  - Tokens are signed using the HMAC algorithm with a secret key.
  - Example: `createHmac(HMAC_ALGORITHM, HMAC_SECRET).update(token).digest('hex')`

### 2. CSRF (Cross-Site Request Forgery)

- **Usage:** CSRF protection is implemented to prevent unauthorized actions on behalf of authenticated users.
- **Implementation:**
  - CSRF tokens are generated and validated for sensitive operations.
  - Example: `const csrfToken = generateToken()`

### 3. PKCE (Proof Key for Code Exchange)

- **Usage:** PKCE is used to enhance the security of authorization code flow.
- **Implementation:**
  - Code verifier and code challenge are used to prevent interception attacks.
  - Example: `verifyPKCE(code_verifier, loginReq.challenge)`

### 4. Argon2 Password Hashing

- **Usage:** Argon2 is used for secure password hashing.
- **Implementation:**
  - Passwords are hashed using Argon2 with specific parameters for memory cost, time cost, and parallelism.
  - Example: `const password = await argon2.hash(D_user.password, { memoryCost: 2 ** 15, timeCost: 2, parallelism: 2, type: argon2.argon2id })`

### 5. Redis for Session Management

- **Usage:** Redis is used for managing sessions and storing temporary data securely.
- **Implementation:**
  - Session data is stored in Redis with expiration times using pipelines.
  - Example: `await redis.set(sessionKey, JSON.stringify(sessionData), 'EX', accessTokenTTL)`

### 6. Secure Cookie Handling

- **Usage:** Cookies are handled securely to prevent XSS and CSRF attacks.
- **Implementation:**
  - Cookies are set with `httpOnly`, `secure`, and `sameSite` attributes.
  - Example: `res.setCookie('access_token', token, { httpOnly: true, secure: true, sameSite: 'none', path: '/', maxAge: 30 * 24 * 60 * 60 * 1000, domain: '.conceptocar.xyz' })`

### 7. Input Validation and Sanitization

- **Usage:** Input validation and sanitization are performed to prevent SQL injection and other attacks.
- **Implementation:**
  - Input data is validated using schemas.
  - Example: `const schema = { type: 'object', properties: { email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 8 } }, required: ['email', 'password'] }`

### 8. Rate Limiting

- **Usage:** Rate limiting is implemented to prevent brute-force attacks.
- **Implementation:**
  - Requests are limited based on IP address using NGINX Reverse Proxy / Gcloud Armory (OUT OF USE).

### 9. Role-Based Access Control (RBAC)

- **Usage:** RBAC is used to control access to different parts of the application based on user roles.
- **Implementation:**
  - Access is granted or denied based on user roles.

### 10. Secure Configuration Management

- **Usage:** Environment variables are used for secure configuration management.
- **Implementation:**
  - Sensitive information is stored in environment variables (base64 encoded).

### 11. Logging and Monitoring

- **Usage:** Logging and monitoring are implemented to detect and respond to security incidents.
- **Implementation:**
  - Logs are generated for important events and errors using ELK STACK and monitoring is done using Prometheus + Grafana check charts. Both are deployed using Helm.

### 12. Data hashing

- **Usage:** Data hashing is used to protect sensitive data.
- **Implementation:**
  - Data is encrypted before storage or transmission.
  - Example: Internet Protocols are hashed

### 13. Health Checks

- **Usage:** Health checks are implemented to monitor the health of the application.
- **Implementation:**
  - Health check endpoints are provided for monitoring.
  - Example: `app.get('/healthz', (req, res) => res.status(200).send('OK'))`

### 14. Secure API Endpoints

- **Usage:** API endpoints are secured to prevent unauthorized access.
- **Implementation:**
  - Endpoints are protected using authentication and authorization mechanisms.

### 15. Check out the project for more...

These security measures help ensure that the ConceptToCar backend is secure and resilient against various types of attacks and vulnerabilities.

---

## Diagrams

For system architecture, CI/CD flow, and service interactions, check out the **diagrams**, **images** or **pdf** in [`docs`](./docs).

---
