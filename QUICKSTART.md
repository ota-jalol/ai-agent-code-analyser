# Quick Start Guide

## Installation

```bash
# Clone the repository
git clone https://github.com/ota-jalol/ai-agent-code-analyser.git
cd ai-agent-code-analyser

# Install dependencies (using pnpm recommended)
pnpm install
# or
npm install

# Build the project
pnpm build
# or
npm run build
```

## Basic Usage

### 1. Analyze a Project

```bash
# Basic analysis with default settings
node dist/cli.js analyze /path/to/your/project

# Or using npm script
npm start analyze /path/to/your/project
```

### 2. Generate HTML Report

```bash
node dist/cli.js analyze ./my-project \
  --output ./results \
  --format html
```

### 3. Full Analysis with Tests

```bash
node dist/cli.js analyze ./my-project \
  --output ./results \
  --format markdown \
  --run-tests
```

### 4. Apply Automatic Fixes

```bash
node dist/cli.js analyze ./my-project \
  --apply-fixes \
  --format json
```

## Examples

### Example 1: TypeScript Project

```bash
node dist/cli.js analyze ./my-typescript-app \
  --languages typescript \
  --format html \
  --output ./analysis
```

### Example 2: JavaScript Project with Test Generation

```bash
node dist/cli.js analyze ./my-js-app \
  --languages javascript \
  --format markdown
```

### Example 3: Multi-Language Project

```bash
node dist/cli.js analyze ./my-fullstack-app \
  --languages javascript,typescript,dart \
  --format html \
  --output ./reports
```

## Understanding the Output

### Report Structure

After analysis, you'll find reports in the output directory:

```
output/
├── reports/
│   └── report-{timestamp}.{format}
└── patches/
    ├── patch-1.patch
    ├── patch-2.patch
    └── ...
```

### Report Contents

1. **Project Structure**
   - Total files analyzed
   - Languages detected
   - Dependency graph

2. **Analysis Report**
   - Code quality issues
   - Lines of code
   - Complexity metrics
   - Maintainability index

3. **Vulnerability Report**
   - Security vulnerabilities by severity
   - OWASP Top 10 mapping
   - CWE references
   - Recommendations

4. **Test Report** (if enabled)
   - Generated test suites
   - Test execution results
   - Coverage metrics

5. **Patch Report** (if enabled)
   - Generated fixes
   - Unified diffs
   - Validation status

## Configuration

### Using Configuration File

Create a `config.json`:

```json
{
  "projectPath": "./my-project",
  "outputPath": "./analysis-results",
  "targetLanguages": ["typescript", "javascript"],
  "agents": {
    "ingestor": { "name": "Ingestor", "enabled": true },
    "analyzer": { "name": "Analyzer", "enabled": true },
    "vulnerability": { "name": "Vulnerability Scanner", "enabled": true },
    "testWriter": { "name": "Test Writer", "enabled": true },
    "executor": { "name": "Test Executor", "enabled": false },
    "patcher": { "name": "Patch Generator", "enabled": false }
  },
  "generateTests": true,
  "runTests": false,
  "applyFixes": false,
  "reportFormat": "html"
}
```

## Common Issues

### Issue: "Module not found"

**Solution**: Make sure you've built the project:
```bash
npm run build
```

### Issue: "Permission denied"

**Solution**: Run with appropriate permissions or check file paths:
```bash
node dist/cli.js analyze $(pwd)/my-project
```

### Issue: Too many files

**Solution**: The system automatically excludes `node_modules`, `dist`, `build`, etc.

## Advanced Usage

### Programmatic API

```typescript
import { analyzeProject, createDefaultConfig } from 'ai-agent-code-analyser';

const config = createDefaultConfig('./my-project');
config.reportFormat = 'json';
config.generateTests = true;

const report = await analyzeProject(config);
console.log(report);
```

### Custom Filtering

Modify `.gitignore` patterns in the IngestorAgent to customize which files are analyzed.

## CI/CD Integration

### GitHub Actions

```yaml
name: Code Analysis

on: [push, pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - run: node dist/cli.js analyze . --format json
```

### GitLab CI

```yaml
code_analysis:
  stage: test
  script:
    - npm install
    - npm run build
    - node dist/cli.js analyze . --format html
  artifacts:
    paths:
      - output/
```

## Tips & Tricks

1. **Start with JSON format** for initial analysis to get structured data
2. **Use HTML format** for sharing results with team members
3. **Use Markdown format** for documentation and reports
4. **Enable test generation** to get starter test suites
5. **Review patches** before applying them automatically
6. **Run regularly** in CI/CD for continuous monitoring

## Support

For issues and questions:
- Check the [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
- Review the [README.md](README.md) for comprehensive documentation
- Open an issue on GitHub

## Next Steps

1. Review the generated report
2. Address critical vulnerabilities first
3. Fix high-severity issues
4. Improve code quality based on analysis suggestions
5. Add tests using generated test suites as templates
6. Run analysis regularly to maintain code quality
