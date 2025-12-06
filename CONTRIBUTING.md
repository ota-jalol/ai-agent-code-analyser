# Contributing to AI Agent Code Analyser

Thank you for your interest in contributing to the AI Agent Code Analyser! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)

## Code of Conduct

This project follows a code of conduct to ensure a welcoming environment for all contributors. Please be respectful and constructive in all interactions.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/ai-agent-code-analyser.git`
3. Add upstream remote: `git remote add upstream https://github.com/ota-jalol/ai-agent-code-analyser.git`

## Development Setup

### Prerequisites

- Node.js 18+ 
- pnpm 8+ (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Run in development mode
pnpm dev
```

## Project Structure

```
src/
├── agents/           # Agent implementations
│   ├── IngestorAgent.ts
│   ├── AnalyzerAgent.ts
│   ├── VulnerabilityAgent.ts
│   ├── TestWriterAgent.ts
│   ├── ExecutionAgent.ts
│   ├── PatchAgent.ts
│   └── SupervisorAgent.ts
├── types/           # TypeScript type definitions
│   └── index.ts
├── utils/           # Utility functions
│   └── helpers.ts
├── cli.ts          # CLI implementation
└── index.ts        # Main entry point
```

## Making Changes

### Types of Contributions

1. **Bug Fixes**: Fix issues in existing code
2. **New Features**: Add new agents or capabilities
3. **Improvements**: Enhance existing functionality
4. **Documentation**: Improve or add documentation
5. **Tests**: Add or improve test coverage

### Branch Naming

- `feature/description` - For new features
- `fix/description` - For bug fixes
- `docs/description` - For documentation
- `refactor/description` - For code refactoring

### Creating a New Agent

To add a new agent:

1. Create a new file in `src/agents/`
2. Implement the agent class
3. Update `SupervisorAgent.ts` to integrate it
4. Add types to `src/types/index.ts`
5. Update documentation

Example:

```typescript
import { Logger } from '../utils/helpers.js';

export class MyNewAgent {
  private logger: Logger;

  constructor() {
    this.logger = Logger.getInstance();
  }

  async execute(): Promise<MyReport> {
    this.logger.info('Starting MyNewAgent...');
    // Implementation
    return report;
  }
}
```

### Adding New Checks

To add new code analysis checks:

1. Add check method to relevant agent
2. Define issue/vulnerability type in `src/types/`
3. Update report generation logic
4. Add documentation

### Adding New Languages

To support a new programming language:

1. Update `detectLanguage()` in `src/utils/helpers.ts`
2. Add language-specific parsing in `IngestorAgent.ts`
3. Add language-specific checks in other agents
4. Update test generation in `TestWriterAgent.ts`

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test -- --watch
```

### Testing Your Changes

Before submitting, test your changes:

```bash
# Build the project
pnpm build

# Test on a sample project
node dist/cli.js analyze ./test-project --format json
```

### Dogfooding

Test the analyzer on itself:

```bash
node dist/cli.js analyze ./src --output ./self-analysis
```

## Submitting Changes

### Before Submitting

1. Ensure code builds: `pnpm build`
2. Run linter: `pnpm lint`
3. Format code: `pnpm format`
4. Test your changes
5. Update documentation if needed

### Pull Request Process

1. Update your fork:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. Push your changes:
   ```bash
   git push origin your-branch-name
   ```

3. Create a Pull Request with:
   - Clear title describing the change
   - Detailed description of what and why
   - Reference to related issues (if any)
   - Screenshots for UI changes

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Checklist
- [ ] Code builds without errors
- [ ] Tests pass
- [ ] Documentation updated
- [ ] Self-reviewed code
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Use explicit types (avoid `any`)
- Use meaningful variable names

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add comments for complex logic
- Keep functions focused and small

### Naming Conventions

- Classes: `PascalCase`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Interfaces/Types: `PascalCase`

### Comments

```typescript
/**
 * Function description
 * @param param1 - Description
 * @returns Description
 */
export function myFunction(param1: string): number {
  // Implementation comment
  return 42;
}
```

## Areas for Contribution

### High Priority

1. Add more vulnerability patterns
2. Improve test generation intelligence
3. Add support for more languages
4. Improve patch generation
5. Add integration tests

### Medium Priority

1. Performance optimizations
2. Better error messages
3. Configuration file support
4. Custom rule definitions
5. IDE integration

### Documentation

1. More usage examples
2. Video tutorials
3. API documentation
4. Architecture diagrams
5. Translation to other languages

## Getting Help

- Open an issue for questions
- Check existing issues and PRs
- Review the [ARCHITECTURE.md](ARCHITECTURE.md)
- Read the [QUICKSTART.md](QUICKSTART.md)

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- GitHub contributors page

Thank you for contributing to make AI Agent Code Analyser better!
