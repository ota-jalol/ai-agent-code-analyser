import type { ProjectStructure, TestSuite, TestCase, ASTNode } from '../types/index.js';
import { Logger, readFile } from '../utils/helpers.js';
import * as path from 'path';

/**
 * Test Writer Agent
 * Responsible for generating automated tests for functions, classes, and modules
 */
export class TestWriterAgent {
  private logger: Logger;

  constructor() {
    this.logger = Logger.getInstance();
  }

  async generateTests(structure: ProjectStructure, projectPath: string): Promise<TestSuite[]> {
    this.logger.info('Generating test suites...');

    const testSuites: TestSuite[] = [];

    for (const file of structure.files) {
      try {
        const filePath = path.join(projectPath, file.path);
        const content = await readFile(filePath);
        const ast = structure.astMap.get(filePath);

        if (ast) {
          const suite = await this.generateTestSuite(file.path, content, file.language, ast);
          if (suite.tests.length > 0) {
            testSuites.push(suite);
          }
        }
      } catch (error) {
        this.logger.warn(`Failed to generate tests for ${file.path}: ${error}`);
      }
    }

    this.logger.success(`Generated ${testSuites.length} test suites`);
    return testSuites;
  }

  private async generateTestSuite(
    filePath: string,
    content: string,
    language: string,
    ast: ASTNode
  ): Promise<TestSuite> {
    const framework = this.getTestFramework(language);
    const tests: TestCase[] = [];

    // Extract functions and classes from AST
    const functions = this.extractFunctions(ast);
    const classes = this.extractClasses(ast);

    // Generate tests for functions
    for (const func of functions) {
      const test = this.generateFunctionTest(filePath, func, framework, language);
      if (test) {
        tests.push(test);
      }
    }

    // Generate tests for classes
    for (const cls of classes) {
      const classTests = this.generateClassTests(filePath, cls, framework, language);
      tests.push(...classTests);
    }

    return {
      file: filePath.replace(/\.(ts|js|dart)$/, `.test.$1`),
      framework,
      tests,
      coverageGoal: 80,
    };
  }

  private getTestFramework(language: string): string {
    if (language === 'dart') {
      return 'flutter_test';
    }
    return 'vitest';
  }

  private extractFunctions(ast: ASTNode): ASTNode[] {
    const functions: ASTNode[] = [];

    const traverse = (node: ASTNode) => {
      if (node.type === 'FunctionDeclaration' || 
          node.type === 'ArrowFunctionExpression' ||
          node.type === 'FunctionExpression') {
        if (node.name && !node.name.startsWith('_')) {
          functions.push(node);
        }
      }

      if (node.children) {
        node.children.forEach(traverse);
      }
    };

    traverse(ast);
    return functions;
  }

  private extractClasses(ast: ASTNode): ASTNode[] {
    const classes: ASTNode[] = [];

    const traverse = (node: ASTNode) => {
      if (node.type === 'ClassDeclaration') {
        classes.push(node);
      }

      if (node.children) {
        node.children.forEach(traverse);
      }
    };

    traverse(ast);
    return classes;
  }

  private generateFunctionTest(
    filePath: string,
    func: ASTNode,
    framework: string,
    _language: string
  ): TestCase | null {
    if (!func.name) return null;

    const functionName = func.name;
    const testName = `should test ${functionName}`;

    let code = '';

    if (framework === 'vitest' || framework === 'jest') {
      const importPath = filePath.replace(/\.(ts|js)$/, '');
      code = this.generateJSTest(importPath, functionName, testName);
    } else if (framework === 'flutter_test') {
      code = this.generateDartTest(filePath, functionName, testName);
    }

    return {
      name: testName,
      code,
      framework: framework as any,
      targetFile: filePath,
      targetFunction: functionName,
    };
  }

  private generateClassTests(
    filePath: string,
    cls: ASTNode,
    framework: string,
    _language: string
  ): TestCase[] {
    const tests: TestCase[] = [];
    const className = cls.name || 'UnknownClass';

    // Generate constructor test
    tests.push({
      name: `should create instance of ${className}`,
      code: this.generateConstructorTest(filePath, className, framework),
      framework: framework as any,
      targetFile: filePath,
    });

    // Extract methods from class
    if (cls.children) {
      const methods = cls.children.filter(
        child => child.type === 'MethodDefinition' || child.type === 'ClassMethod'
      );

      for (const method of methods) {
        if (method.name && !method.name.startsWith('_')) {
          tests.push({
            name: `should test ${className}.${method.name}`,
            code: this.generateMethodTest(filePath, className, method.name, framework),
            framework: framework as any,
            targetFile: filePath,
            targetFunction: method.name,
          });
        }
      }
    }

    return tests;
  }

  private generateJSTest(importPath: string, functionName: string, testName: string): string {
    return `import { describe, it, expect } from 'vitest';
import { ${functionName} } from './${importPath}';

describe('${functionName}', () => {
  it('${testName}', () => {
    // TODO: Add test implementation
    expect(${functionName}).toBeDefined();
  });

  it('should handle valid input', () => {
    // TODO: Test with valid input
    const result = ${functionName}(/* valid input */);
    expect(result).toBeDefined();
  });

  it('should handle edge cases', () => {
    // TODO: Test edge cases
    expect(() => ${functionName}(/* edge case */)).not.toThrow();
  });

  it('should handle invalid input', () => {
    // TODO: Test with invalid input
    expect(() => ${functionName}(/* invalid input */)).toThrow();
  });
});
`;
  }

  private generateDartTest(filePath: string, functionName: string, testName: string): string {
    return `import 'package:flutter_test/flutter_test.dart';
import 'package:${filePath}';

void main() {
  group('${functionName}', () {
    test('${testName}', () {
      // TODO: Add test implementation
      expect(${functionName}, isNotNull);
    });

    test('should handle valid input', () {
      // TODO: Test with valid input
      final result = ${functionName}(/* valid input */);
      expect(result, isNotNull);
    });

    test('should handle edge cases', () {
      // TODO: Test edge cases
      expect(() => ${functionName}(/* edge case */), returnsNormally);
    });

    test('should handle invalid input', () {
      // TODO: Test with invalid input
      expect(() => ${functionName}(/* invalid input */), throwsException);
    });
  });
}
`;
  }

  private generateConstructorTest(filePath: string, className: string, framework: string): string {
    if (framework === 'vitest' || framework === 'jest') {
      return `import { describe, it, expect } from 'vitest';
import { ${className} } from './${filePath.replace(/\.(ts|js)$/, '')}';

describe('${className}', () => {
  it('should create instance of ${className}', () => {
    const instance = new ${className}(/* constructor args */);
    expect(instance).toBeInstanceOf(${className});
  });

  it('should initialize with default values', () => {
    const instance = new ${className}();
    expect(instance).toBeDefined();
  });
});
`;
    } else {
      return `import 'package:flutter_test/flutter_test.dart';
import 'package:${filePath}';

void main() {
  group('${className}', () {
    test('should create instance of ${className}', () {
      final instance = ${className}(/* constructor args */);
      expect(instance, isA<${className}>());
    });
  });
}
`;
    }
  }

  private generateMethodTest(
    filePath: string,
    className: string,
    methodName: string,
    framework: string
  ): string {
    if (framework === 'vitest' || framework === 'jest') {
      return `import { describe, it, expect, beforeEach } from 'vitest';
import { ${className} } from './${filePath.replace(/\.(ts|js)$/, '')}';

describe('${className}.${methodName}', () => {
  let instance: ${className};

  beforeEach(() => {
    instance = new ${className}(/* constructor args */);
  });

  it('should test ${methodName}', () => {
    const result = instance.${methodName}(/* method args */);
    expect(result).toBeDefined();
  });

  it('should return expected value', () => {
    // TODO: Test return value
    const result = instance.${methodName}(/* args */);
    expect(result).toEqual(/* expected */);
  });
});
`;
    } else {
      return `import 'package:flutter_test/flutter_test.dart';
import 'package:${filePath}';

void main() {
  group('${className}.${methodName}', () {
    late ${className} instance;

    setUp(() {
      instance = ${className}(/* constructor args */);
    });

    test('should test ${methodName}', () {
      final result = instance.${methodName}(/* method args */);
      expect(result, isNotNull);
    });
  });
}
`;
    }
  }
}
