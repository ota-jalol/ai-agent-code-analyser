#!/usr/bin/env node

import { Command } from 'commander';
import { analyzeProject, createDefaultConfig } from './index.js';
import type { SystemConfig } from './types/index.js';
import * as path from 'path';
import { Logger } from './utils/helpers.js';

const program = new Command();
const logger = Logger.getInstance();

program
  .name('ai-code-analyser')
  .description('Multi-Agent AI System for Real-Time Code Analysis, Testing, and Auto-Fixing')
  .version('1.0.0');

program
  .command('analyze')
  .description('Analyze a project')
  .argument('<project-path>', 'Path to the project to analyze')
  .option('-o, --output <path>', 'Output directory for reports', './output')
  .option('-f, --format <format>', 'Report format (json|html|markdown)', 'json')
  .option('--no-tests', 'Skip test generation')
  .option('--run-tests', 'Run generated tests')
  .option('--apply-fixes', 'Apply suggested fixes automatically')
  .option('--languages <languages>', 'Target languages (comma-separated)', 'javascript,typescript,dart')
  .action(async (projectPath: string, options: any) => {
    try {
      const absoluteProjectPath = path.resolve(projectPath);
      const absoluteOutputPath = path.resolve(options.output);

      logger.info(`Analyzing project: ${absoluteProjectPath}`);

      const config: SystemConfig = {
        projectPath: absoluteProjectPath,
        outputPath: absoluteOutputPath,
        targetLanguages: options.languages.split(',').map((l: string) => l.trim()),
        agents: {
          ingestor: { name: 'Ingestor', enabled: true },
          analyzer: { name: 'Analyzer', enabled: true },
          vulnerability: { name: 'Vulnerability Scanner', enabled: true },
          testWriter: { name: 'Test Writer', enabled: options.tests },
          executor: { name: 'Test Executor', enabled: options.runTests },
          patcher: { name: 'Patch Generator', enabled: options.applyFixes },
        },
        generateTests: options.tests,
        runTests: options.runTests,
        applyFixes: options.applyFixes,
        reportFormat: options.format,
      };

      const report = await analyzeProject(config);

      logger.success('Analysis complete!');
      logger.info(`Report saved to: ${absoluteOutputPath}/reports`);
      
      // Print summary
      console.log('\n=== Analysis Summary ===');
      console.log(`Files analyzed: ${report.projectStructure.files.length}`);
      console.log(`Issues found: ${report.analysisReport.totalIssues}`);
      console.log(`Vulnerabilities found: ${report.vulnerabilityReport.totalVulnerabilities}`);
      console.log(`  - Critical: ${report.vulnerabilityReport.criticalCount}`);
      console.log(`  - High: ${report.vulnerabilityReport.highCount}`);
      console.log(`  - Medium: ${report.vulnerabilityReport.mediumCount}`);
      console.log(`  - Low: ${report.vulnerabilityReport.lowCount}`);
      
      if (report.testReport) {
        console.log(`\nTests: ${report.testReport.passed}/${report.testReport.totalTests} passed`);
        console.log(`Coverage: ${report.testReport.coverage}%`);
      }
      
      if (report.patchReport) {
        console.log(`\nPatches generated: ${report.patchReport.totalPatches}`);
      }

      // Exit with error code if critical vulnerabilities found
      if (report.vulnerabilityReport.criticalCount > 0) {
        process.exit(1);
      }
    } catch (error) {
      logger.error('Analysis failed', error as Error);
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Initialize a configuration file')
  .argument('<project-path>', 'Path to the project')
  .action((projectPath: string) => {
    const config = createDefaultConfig(path.resolve(projectPath));
    console.log('Generated configuration:');
    console.log(JSON.stringify(config, null, 2));
    console.log('\nSave this to a config.json file and modify as needed.');
  });

program.parse();
