# Dynamic Specification Growth System (DSGS)

[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/ptreezh/Dynamic-Specification-Growth-System-DSGS)
![DSGS Logo](https://via.placeholder.com/150) <!-- Replace with actual logo -->

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-blue)](https://nodejs.org/)
[![npm Version](https://img.shields.io/npm/v/dynamic-specs-growth.svg)](https://www.npmjs.com/package/dynamic-specs-growth)

**Dynamic Specification Growth System (DSGS)** is a next-generation specification management system that dynamically generates context-aware constraints for software development tasks. DSGS helps teams maintain code quality and consistency by providing minimal, task-specific constraints that evolve with your project.

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Features

### 🚀 Core Capabilities
- **Dynamic Constraint Generation**: Automatically generates appropriate constraints based on task type and context
- **Hierarchical Specification Management**: Manages specifications from global rules to task-specific constraints
- **Real-time IDE Integration**: Seamless integration with Cline, VS Studio, and other MCP-compatible IDEs
- **Phased Evolution**: Supports incremental adoption from MVP to advanced features

### 🛠️ Key Components
- **Basic Survival Laws (BSL)**: Foundational rules that define system-wide constraints
- **Task Context Capsules (TCC)**: Context-aware containers that provide task-specific constraints
- **Constraint Template Library**: Extensible library of constraint templates for security, performance, and architecture
- **MCP Integration**: Standardized communication protocol for IDE and tool integration

## Architecture

DSGS follows a layered architecture with clear separation between core logic, integration, and utilities:

```
dsgs/
├── src/
│   ├── core/               # Core business logic
│   │   ├── specification/  # Specification management
│   │   ├── constraint/     # Constraint generation
│   │   └── evolution/      # Evolution management
│   ├── integration/        # External integrations
│   │   ├── mcp/            # MCP protocol implementation
│   │   └── cli/            # Command-line interface
│   └── utils/              # Utility functions
├── docs/                   # Documentation
├── config/                 # Configuration files
└── tools/                  # Development tools
```

## Installation

### Prerequisites
- Node.js v18.0.0 or higher
- npm v8.0.0 or higher

### NPM Package (Recommended)
```bash
npm install dynamic-specs-growth
```

### From Source
```bash
# Clone the repository
git clone https://github.com/ptreezh/Dynamic-Specification-Growth-System-DSGS.git
cd Dynamic-Specification-Growth-System-DSGS

# Install dependencies
npm install

# Build the project
npm run build
```

## Usage

### IDE Integration (Cline/VS Studio)
DSGS integrates seamlessly with MCP-compatible IDEs:

1. Install the DSGS MCP server:
```bash
npm install -g dynamic-specs-growth
```

2. Configure your IDE's MCP settings to include DSGS:
```json
{
  "mcpServers": {
    "dynamic-specs-growth-stdio": {
      "type": "stdio",
      "command": "node",
      "args": [
        "path/to/dsgs/dist/integration/mcp/McpStdioServer.js"
      ]
    }
  }
}
```

3. Restart your IDE to activate the integration.

### Command Line Interface
DSGS provides a CLI for CI/CD integration and standalone usage:

```bash
# Check constraints for a task
dsgs check-constraints --tcc-path ./task.tcc --spec-path ./spec.json

# Get system status
dsgs status

# Generate constraints for a task type
dsgs generate-constraints --task-type SECURITY
```

### Programmatic Usage
```javascript
const { initializeMcpStdioServer } = require('dynamic-specs-growth');

// Start the MCP server
initializeMcpStdioServer().then(() => {
  console.log('DSGS server is running');
});
```

## Configuration

### Basic Configuration
Create a `dsgs.config.json` file in your project root:

```json
{
  "bsl": {
    "rules": ["NO_DEADLOCK", "MINIMAL_PRIVILEGE", "NO_RESOURCE_LEAK"]
  },
  "constraintTemplates": {
    "security": ["SEC-001", "SEC-002"],
    "performance": ["PERF-001"]
  },
  "evolutionStage": "MVP"
}
```

### MCP Configuration
Configure DSGS in your IDE's MCP settings:

```json
{
  "mcpServers": {
    "dynamic-specs-growth-stdio": {
      "autoApprove": [],
      "disabled": false,
      "timeout": 60,
      "type": "stdio",
      "command": "node",
      "args": [
        "node_modules/dynamic-specs-growth/dist/integration/mcp/McpStdioServer.js"
      ],
      "env": {}
    }
  }
}
```

## API Reference

### MCP Methods
DSGS implements the following MCP methods:

#### `checkConstraints`
Validates code against constraints defined in a Task Context Capsule.

**Parameters:**
- `tccPath` (string): Path to the Task Context Capsule
- `specPath` (string): Path to the specification file

**Returns:**
```json
{
  "constraints": [...],
  "violations": [...],
  "timestamp": "2025-08-01T02:44:03.734Z"
}
```

#### `getSystemStatus`
Returns the current status of the DSGS server.

**Returns:**
```json
{
  "status": "running",
  "version": "1.0.0",
  "uptime": 123.45,
  "timestamp": "2025-08-01T02:44:03.734Z"
}
```

#### `getEvolutionStage`
Returns the current evolution stage of the system.

**Returns:**
```json
{
  "currentStage": "MVP",
  "description": "Minimum Viable Product - Core functionality implemented",
  "capabilities": [
    "Basic constraint generation",
    "Task Context Capsule support",
    "MCP integration",
    "CLI interface"
  ],
  "timestamp": "2025-08-01T02:44:03.734Z"
}
```

## Development

### Getting Started
```bash
# Clone the repository
git clone https://github.com/ptreezh/Dynamic-Specification-Growth-System-DSGS.git
cd Dynamic-Specification-Growth-System-DSGS

# Install dependencies
npm install

# Start development server
npm run dev
```

### Project Structure
- `src/core/`: Core business logic and algorithms
- `src/integration/`: External integrations (MCP, CLI)
- `src/utils/`: Utility functions and helpers
- `test/`: Unit, integration, and E2E tests
- `docs/`: Documentation and specifications
- `config/`: Configuration files and schemas

### Building
```bash
# Build the project
npm run build

# Run tests
npm run test

# Generate coverage report
npm run test:coverage
```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

Please read our [Contributing Guidelines](CONTRIBUTING.md) for more details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments
- [Model Context Protocol (MCP)](https://modelcontextprotocol.com) for the integration standard
- The open-source community for inspiration and support
- All contributors who have helped improve DSGS

## Support
For help or questions, please open an issue on GitHub or contact the maintainers.

---

*Dynamic Specification Growth System - Making software development more predictable and maintainable*
