# Contributing to Dynamic Specification Growth System (DSGS)

Thank you for your interest in contributing to DSGS! We welcome contributions from everyone and appreciate your help in making DSGS better.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Coding Guidelines](#coding-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [License](#license)

## Code of Conduct
By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it carefully to ensure a positive and inclusive community.

## How to Contribute
There are many ways you can contribute to DSGS:

### Report Bugs
Help us identify and fix issues by reporting bugs you encounter. Please provide detailed information about the problem.

### Suggest Features
Have an idea for a new feature? We'd love to hear it! Please open an issue with your suggestion.

### Improve Documentation
Help us make DSGS easier to use by improving our documentation.

### Write Code
Fix bugs, implement new features, or improve existing code.

### Review Pull Requests
Help us maintain code quality by reviewing pull requests from other contributors.

## Development Setup
To set up DSGS for development:

1. **Fork the Repository**
   Click the "Fork" button at the top right of the repository page.

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/your-username/dynamic-specs-growth.git
   cd dynamic-specs-growth
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

5. **Make Your Changes**
   Implement your bug fix or feature.

6. **Run Tests**
   ```bash
   npm run test
   ```

7. **Build the Project**
   ```bash
   npm run build
   ```

## Coding Guidelines
Please follow these guidelines when contributing code:

### TypeScript
- Use camelCase for variables and functions
- Use PascalCase for classes and interfaces
- Follow the existing code style and patterns
- Add JSDoc comments for all public functions and classes
- Keep files under 500 lines when possible

### File Organization
- Use singular form for directory and file names
- Group related files in directories
- No directory should contain more than 7 files
- Each directory must have a README.md explaining its purpose

### Commit Messages
- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally

Example:
```
fix: resolve MCP connection timeout issue

- Add keep-alive mechanism to prevent connection timeouts
- Improve error handling for network issues
- Update documentation with connection troubleshooting tips

Fixes #123
```

## Testing
We use Jest for testing. Please ensure your changes are covered by tests.

### Running Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Writing Tests
- Write unit tests for individual functions and classes
- Write integration tests for component interactions
- Aim for 90%+ code coverage
- Test both success and error cases

## Documentation
Good documentation is essential. When contributing:

### Code Comments
- Add JSDoc comments for all public interfaces
- Explain complex logic with inline comments
- Document assumptions and edge cases

### README Updates
- Update the README when adding new features
- Include examples of how to use new functionality
- Keep installation and usage instructions up to date

### API Documentation
- Document all public API methods
- Include parameter types and return values
- Provide usage examples

## Pull Request Process
1. **Create a Pull Request**
   - Ensure your branch is up to date with the main branch
   - Include a clear description of your changes
   - Reference any related issues

2. **Wait for Review**
   - A maintainer will review your pull request
   - Address any feedback or requested changes

3. **Merge**
   - Once approved, your pull request will be merged
   - Thank you for your contribution!

## Issue Reporting
When reporting an issue, please include:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Environment information (OS, Node.js version, etc.)
- Any relevant error messages or logs

## License
By contributing to this project, you agree that your contributions will be licensed under the MIT License.

## Support
If you have questions about contributing, please open an issue or contact the maintainers.

Thank you for helping make DSGS better!
