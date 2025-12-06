import type { AnalysisReport, VulnerabilityReport, TestExecutionReport, PatchReport, CodePatch, AnalysisIssue, Vulnerability } from '../types/index.js';
import { Logger, readFile, writeFile } from '../utils/helpers.js';
import * as path from 'path';

/**
 * Patch/Fix Agent
 * Responsible for applying safe code fixes, generating diffs,
 * ensuring no breaking changes
 */
export class PatchAgent {
  private logger: Logger;

  constructor() {
    this.logger = Logger.getInstance();
  }

  async generatePatches(
    analysisReport: AnalysisReport,
    vulnerabilityReport: VulnerabilityReport,
    testReport: TestExecutionReport | undefined,
    projectPath: string,
    outputPath: string
  ): Promise<PatchReport> {
    this.logger.info('Generating patches...');

    const patches: CodePatch[] = [];

    // Generate patches for analysis issues
    for (const issue of analysisReport.issues) {
      if (issue.suggestion) {
        const patch = await this.generateIssuePatch(issue.file, issue, projectPath);
        if (patch) {
          patches.push(patch);
        }
      }
    }

    // Generate patches for vulnerabilities
    for (const vuln of vulnerabilityReport.vulnerabilities) {
      const patch = await this.generateVulnerabilityPatch(vuln.file, vuln, projectPath);
      if (patch) {
        patches.push(patch);
      }
    }

    // Generate patches for failed tests
    if (testReport) {
      for (const result of testReport.results) {
        for (const failure of result.failures) {
          const patch = await this.generateTestFailurePatch(result.suite, failure);
          if (patch) {
            patches.push(patch);
          }
        }
      }
    }

    // Write patches to files
    for (let i = 0; i < patches.length; i++) {
      const patchPath = path.join(outputPath, 'patches', `patch-${i + 1}.patch`);
      await writeFile(patchPath, patches[i].diff);
    }

    const report: PatchReport = {
      timestamp: new Date(),
      totalPatches: patches.length,
      patches,
    };

    this.logger.success(`Generated ${patches.length} patches`);
    return report;
  }

  private async generateIssuePatch(
    file: string,
    issue: AnalysisIssue,
    projectPath: string
  ): Promise<CodePatch | null> {
    try {
      const filePath = path.join(projectPath, file);
      const content = await readFile(filePath);
      const lines = content.split('\n');

      if (issue.line > lines.length) return null;

      const originalLine = lines[issue.line - 1];
      let fixedLine = originalLine;

      // Apply simple fixes based on rule
      switch (issue.rule) {
        case 'no-console':
          fixedLine = originalLine.replace(/console\.(log|warn|error|debug)/, '// $&');
          break;
        case 'no-var':
          fixedLine = originalLine.replace(/\bvar\b/, 'const');
          break;
        case 'eqeqeq':
          fixedLine = originalLine.replace(/([^=!<>])==(?!=)/g, '$1===');
          break;
        default:
          return null;
      }

      if (fixedLine === originalLine) return null;

      const diff = this.createDiff(file, issue.line, originalLine, fixedLine);

      return {
        file,
        diff,
        description: `Fix ${issue.rule}: ${issue.message}`,
        validated: true,
      };
    } catch (error) {
      this.logger.warn(`Failed to generate patch for ${file}: ${error}`);
      return null;
    }
  }

  private async generateVulnerabilityPatch(
    file: string,
    vuln: Vulnerability,
    projectPath: string
  ): Promise<CodePatch | null> {
    try {
      const filePath = path.join(projectPath, file);
      const content = await readFile(filePath);
      const lines = content.split('\n');

      if (vuln.line > lines.length) return null;

      const originalLine = lines[vuln.line - 1];
      let fixedLine = originalLine;

      // Apply security fixes
      switch (vuln.type) {
        case 'Cross-Site Scripting (XSS)':
          if (originalLine.includes('innerHTML')) {
            fixedLine = originalLine.replace('innerHTML', 'textContent');
          }
          break;
        case 'Weak Cryptography':
          if (originalLine.includes('md5') || originalLine.includes('sha1')) {
            fixedLine = originalLine.replace(/(md5|sha1)/g, 'sha256');
          }
          break;
        case 'Insecure HTTP':
          fixedLine = originalLine.replace(/http:\/\//g, 'https://');
          break;
        case 'Use of var keyword':
          fixedLine = originalLine.replace(/\bvar\b/, 'const');
          break;
        default:
          // For complex vulnerabilities, add a comment
          fixedLine = `// TODO: Fix ${vuln.type} - ${vuln.recommendation}\n${originalLine}`;
          break;
      }

      if (fixedLine === originalLine) return null;

      const diff = this.createDiff(file, vuln.line, originalLine, fixedLine);

      return {
        file,
        diff,
        description: `Fix ${vuln.type}: ${vuln.description}`,
        validated: false, // Security fixes should be manually reviewed
      };
    } catch (error) {
      this.logger.warn(`Failed to generate vulnerability patch for ${file}: ${error}`);
      return null;
    }
  }

  private async generateTestFailurePatch(
    suite: string,
    _failure: { test: string; error: string; stackTrace: string }
  ): Promise<CodePatch | null> {
    // Test failure patches would require more sophisticated analysis
    // For now, just log that we identified a test failure
    this.logger.info(`Test failure detected in ${suite}: ${_failure.test}`);
    return null;
  }

  private createDiff(file: string, lineNumber: number, originalLine: string, fixedLine: string): string {
    return `--- a/${file}
+++ b/${file}
@@ -${lineNumber},1 +${lineNumber},1 @@
-${originalLine}
+${fixedLine}
`;
  }

  async applyPatches(patches: CodePatch[], projectPath: string): Promise<void> {
    this.logger.info('Applying patches...');

    for (const patch of patches) {
      if (!patch.validated) {
        this.logger.warn(`Skipping unvalidated patch for ${patch.file}`);
        continue;
      }

      try {
        await this.applyPatch(patch, projectPath);
        this.logger.success(`Applied patch to ${patch.file}`);
      } catch (error) {
        this.logger.error(`Failed to apply patch to ${patch.file}`, error as Error);
      }
    }
  }

  private async applyPatch(patch: CodePatch, projectPath: string): Promise<void> {
    // Parse the diff and apply changes
    const lines = patch.diff.split('\n');
    const fileChanges = new Map<string, { line: number; old: string; new: string }[]>();

    let currentFile = '';
    let lineNumber = 0;

    for (const line of lines) {
      if (line.startsWith('---')) {
        currentFile = line.substring(6);
      } else if (line.startsWith('@@')) {
        const match = line.match(/@@ -(\d+)/);
        if (match) {
          lineNumber = parseInt(match[1]);
        }
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        const oldLine = line.substring(1);
        const newLineIndex = lines.indexOf(line) + 1;
        if (newLineIndex < lines.length && lines[newLineIndex].startsWith('+')) {
          const newLine = lines[newLineIndex].substring(1);
          
          if (!fileChanges.has(currentFile)) {
            fileChanges.set(currentFile, []);
          }
          fileChanges.get(currentFile)!.push({ line: lineNumber, old: oldLine, new: newLine });
        }
      }
    }

    // Apply changes to files
    for (const [file, changes] of fileChanges) {
      const filePath = path.join(projectPath, file);
      const content = await readFile(filePath);
      const contentLines = content.split('\n');

      for (const change of changes) {
        if (change.line <= contentLines.length) {
          contentLines[change.line - 1] = change.new;
        }
      }

      await writeFile(filePath, contentLines.join('\n'));
    }
  }
}
