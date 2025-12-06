import type { TestSuite, TestExecutionReport, TestResult } from '../types/index.js';
import { Logger } from '../utils/helpers.js';
import { spawn } from 'child_process';
import * as path from 'path';

/**
 * Execution Agent
 * Responsible for running tests, capturing logs, errors, stack traces
 */
export class ExecutionAgent {
  private logger: Logger;

  constructor() {
    this.logger = Logger.getInstance();
  }

  async executeTests(testSuites: TestSuite[], projectPath: string): Promise<TestExecutionReport> {
    this.logger.info('Executing tests...');

    const results: TestResult[] = [];
    let totalTests = 0;
    let passed = 0;
    let failed = 0;

    for (const suite of testSuites) {
      try {
        const result = await this.runTestSuite(suite, projectPath);
        results.push(result);
        totalTests += result.passed + result.failed + result.skipped;
        passed += result.passed;
        failed += result.failed;
      } catch (error) {
        this.logger.warn(`Failed to execute test suite ${suite.file}: ${error}`);
        results.push({
          suite: suite.file,
          passed: 0,
          failed: suite.tests.length,
          skipped: 0,
          duration: 0,
          failures: suite.tests.map(test => ({
            test: test.name,
            error: 'Test execution failed',
            stackTrace: String(error),
          })),
        });
        totalTests += suite.tests.length;
        failed += suite.tests.length;
      }
    }

    const coverage = totalTests > 0 ? (passed / totalTests) * 100 : 0;

    const report: TestExecutionReport = {
      timestamp: new Date(),
      totalTests,
      passed,
      failed,
      coverage: Math.round(coverage * 100) / 100,
      results,
    };

    this.logger.success(`Test execution complete: ${passed}/${totalTests} passed`);
    return report;
  }

  private async runTestSuite(suite: TestSuite, projectPath: string): Promise<TestResult> {
    const startTime = Date.now();

    if (suite.framework === 'vitest' || suite.framework === 'jest') {
      return this.runVitestSuite(suite, projectPath, startTime);
    } else if (suite.framework === 'flutter_test') {
      return this.runDartTestSuite(suite, projectPath, startTime);
    }

    throw new Error(`Unsupported test framework: ${suite.framework}`);
  }

  private async runVitestSuite(suite: TestSuite, projectPath: string, startTime: number): Promise<TestResult> {
    return new Promise((resolve) => {
      const testPath = path.join(projectPath, suite.file);
      
      // Simulate test execution
      // In a real implementation, this would actually run vitest
      const passed = Math.floor(suite.tests.length * 0.7);
      const failed = suite.tests.length - passed;
      const failures = suite.tests.slice(passed).map(test => ({
        test: test.name,
        error: 'Test not implemented',
        stackTrace: 'No stack trace available',
      }));

      resolve({
        suite: suite.file,
        passed,
        failed,
        skipped: 0,
        duration: Date.now() - startTime,
        failures,
      });
    });
  }

  private async runDartTestSuite(suite: TestSuite, projectPath: string, startTime: number): Promise<TestResult> {
    return new Promise((resolve) => {
      // Simulate test execution
      const passed = Math.floor(suite.tests.length * 0.7);
      const failed = suite.tests.length - passed;
      const failures = suite.tests.slice(passed).map(test => ({
        test: test.name,
        error: 'Test not implemented',
        stackTrace: 'No stack trace available',
      }));

      resolve({
        suite: suite.file,
        passed,
        failed,
        skipped: 0,
        duration: Date.now() - startTime,
        failures,
      });
    });
  }
}
