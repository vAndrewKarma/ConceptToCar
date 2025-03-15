### TEAM NAME: © Karma Devs 2025

![ConceptToCar Logo](./logo.png)

# ConceptToCar: Product Lifecycle Management System

## License & Copyright

This project is the exclusive property of its creators and contributors. All rights are reserved, and the code, documentation, and any associated assets cannot be copied, used, modified, or claimed by any individual or organization without explicit permission. Unauthorized use or reproduction of any part of this project is strictly prohibited.

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

# Services Overview

| Service Name                   | Language   | Description                                                                 |
| ------------------------------ | ---------- | --------------------------------------------------------------------------- |
| **AuthentService**             | TypeScript | Handles user registration, login, and email verification.                   |
| **EmailService**               | Go         | Handles sending emails for user verification and password recovery.         |
| **ProductsService**            | TypeScript | Manages products and materials, including creation, updating, and deletion. |
| **UserRegistrationKeyService** | TypeScript | Handles user registration keys and related operations.                      |
| **MaterialPriceService**       | Python     | Gets the material price for a product.                                      |

## Installation and Configuration

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/vAndrewKarma/ConceptToCar.git
   cd ConceptToCar
   ```
