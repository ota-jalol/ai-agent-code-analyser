import type { ProjectStructure, AnalysisReport, AnalysisIssue } from '../types/index.js';
import { Logger, readFile, calculateComplexity } from '../utils/helpers.js';
import * as path from 'path';

/**
 * Analyzer Agent
 * Responsible for static code analysis, semantic analysis,
 * detecting logical issues, unused code, performance problems
 */
export class AnalyzerAgent {
  private logger: Logger;

  constructor() {
    this.logger = Logger.getInstance();
  }

  async analyze(structure: ProjectStructure, projectPath: string): Promise<AnalysisReport> {
    this.logger.info('Starting code analysis...');

    const issues: AnalysisIssue[] = [];
    let totalComplexity = 0;
    let totalLinesOfCode = 0;

    for (const file of structure.files) {
      try {
        const filePath = path.join(projectPath, file.path);
        const content = await readFile(filePath);
        const fileIssues = await this.analyzeFile(file.path, content, file.language);
        issues.push(...fileIssues);

        const complexity = calculateComplexity(content);
        totalComplexity += complexity;
        totalLinesOfCode += content.split('\n').length;
      } catch (error) {
        this.logger.warn(`Failed to analyze file ${file.path}: ${error}`);
      }
    }

    const avgComplexity = structure.files.length > 0 ? totalComplexity / structure.files.length : 0;
    const maintainability = this.calculateMaintainability(avgComplexity, totalLinesOfCode);

    const report: AnalysisReport = {
      timestamp: new Date(),
      totalFiles: structure.files.length,
      totalIssues: issues.length,
      issues,
      metrics: {
        complexity: Math.round(avgComplexity * 100) / 100,
        maintainability: Math.round(maintainability * 100) / 100,
        linesOfCode: totalLinesOfCode,
      },
    };

    this.logger.success(`Analysis complete: ${issues.length} issues found`);
    return report;
  }

  private async analyzeFile(
    filePath: string,
    content: string,
    language: string
  ): Promise<AnalysisIssue[]> {
    const issues: AnalysisIssue[] = [];

    // Check for common issues
    issues.push(...this.checkConsoleStatements(filePath, content));
    issues.push(...this.checkUnusedVariables(filePath, content));
    issues.push(...this.checkMagicNumbers(filePath, content));
    issues.push(...this.checkLongFunctions(filePath, content));
    issues.push(...this.checkDeepNesting(filePath, content));
    issues.push(...this.checkEmptyCatch(filePath, content));

    if (language === 'typescript' || language === 'javascript') {
      issues.push(...this.checkTodoComments(filePath, content));
      issues.push(...this.checkVarUsage(filePath, content));
      issues.push(...this.checkDoubleEquals(filePath, content));
    }

    return issues;
  }

  private checkConsoleStatements(file: string, content: string): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      if (line.match(/console\.(log|warn|error|debug)/)) {
        issues.push({
          file,
          line: index + 1,
          column: line.indexOf('console'),
          severity: 'warning',
          message: 'Console statement found in production code',
          rule: 'no-console',
          suggestion: 'Remove console statements or use a proper logging library',
        });
      }
    });

    return issues;
  }

  private checkUnusedVariables(file: string, content: string): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const varMatch = line.match(/(?:const|let|var)\s+(\w+)\s*=/);
      if (varMatch) {
        const varName = varMatch[1];
        const restOfFile = lines.slice(index + 1).join('\n');
        const usageRegex = new RegExp(`\\b${varName}\\b`);
        
        if (!usageRegex.test(restOfFile)) {
          issues.push({
            file,
            line: index + 1,
            column: line.indexOf(varName),
            severity: 'warning',
            message: `Variable '${varName}' is declared but never used`,
            rule: 'no-unused-vars',
            suggestion: `Remove unused variable '${varName}'`,
          });
        }
      }
    });

    return issues;
  }

  private checkMagicNumbers(file: string, content: string): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const lines = content.split('\n');
    
    // Pre-compile regex for better performance
    const magicNumberRegex = /\b(?<![.\w])((?!0|1|-1)\d{2,})(?![.\w])/g;

    lines.forEach((line, index) => {
      // Skip if it's in a comment or string
      const beforeComment = line.split('//')[0].split('/*')[0];
      const inString = beforeComment.includes('"') || beforeComment.includes("'");
      
      if (!inString) {
        let match;
        magicNumberRegex.lastIndex = 0; // Reset regex
        
        while ((match = magicNumberRegex.exec(beforeComment)) !== null) {
          issues.push({
            file,
            line: index + 1,
            column: match.index,
            severity: 'info',
            message: `Magic number ${match[1]} should be extracted to a named constant`,
            rule: 'no-magic-numbers',
            suggestion: 'Define this value as a named constant',
          });
        }
      }
    });

    return issues;
  }

  private checkLongFunctions(file: string, content: string): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const lines = content.split('\n');
    const MAX_FUNCTION_LENGTH = 50;

    let functionStart = -1;
    let functionName = '';
    let braceCount = 0;

    lines.forEach((line, index) => {
      const functionMatch = line.match(/(?:function|async\s+function)\s+(\w+)|(\w+)\s*[=:]\s*(?:async\s+)?\(/);
      
      if (functionMatch && functionStart === -1) {
        functionStart = index;
        functionName = functionMatch[1] || functionMatch[2] || 'anonymous';
      }

      if (functionStart !== -1) {
        braceCount += (line.match(/{/g) || []).length;
        braceCount -= (line.match(/}/g) || []).length;

        if (braceCount === 0 && functionStart !== -1) {
          const functionLength = index - functionStart + 1;
          
          if (functionLength > MAX_FUNCTION_LENGTH) {
            issues.push({
              file,
              line: functionStart + 1,
              column: 0,
              severity: 'warning',
              message: `Function '${functionName}' is too long (${functionLength} lines)`,
              rule: 'max-function-length',
              suggestion: 'Consider breaking this function into smaller functions',
            });
          }
          
          functionStart = -1;
          functionName = '';
        }
      }
    });

    return issues;
  }

  private checkDeepNesting(file: string, content: string): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const lines = content.split('\n');
    const MAX_NESTING = 4;

    let nesting = 0;

    lines.forEach((line, index) => {
      nesting += (line.match(/{/g) || []).length;
      
      if (nesting > MAX_NESTING) {
        issues.push({
          file,
          line: index + 1,
          column: 0,
          severity: 'warning',
          message: `Code nesting level too deep (${nesting})`,
          rule: 'max-nesting-depth',
          suggestion: 'Extract nested logic into separate functions',
        });
      }
      
      nesting -= (line.match(/}/g) || []).length;
    });

    return issues;
  }

  private checkEmptyCatch(file: string, content: string): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('catch')) {
        let braceFound = false;
        let isEmpty = true;
        
        for (let j = i; j < Math.min(i + 3, lines.length); j++) {
          if (lines[j].includes('{')) {
            braceFound = true;
          }
          if (braceFound && lines[j].trim() && !lines[j].trim().match(/^[{}]$/)) {
            isEmpty = false;
            break;
          }
          if (lines[j].includes('}') && braceFound) {
            break;
          }
        }

        if (isEmpty && braceFound) {
          issues.push({
            file,
            line: i + 1,
            column: lines[i].indexOf('catch'),
            severity: 'error',
            message: 'Empty catch block',
            rule: 'no-empty-catch',
            suggestion: 'Handle the error or add a comment explaining why it\'s ignored',
          });
        }
      }
    }

    return issues;
  }

  private checkTodoComments(file: string, content: string): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      if (line.match(/\/\/\s*TODO|\/\*\s*TODO/i)) {
        issues.push({
          file,
          line: index + 1,
          column: line.indexOf('TODO'),
          severity: 'info',
          message: 'TODO comment found',
          rule: 'no-todo',
          suggestion: 'Complete the TODO or create a task',
        });
      }
    });

    return issues;
  }

  private checkVarUsage(file: string, content: string): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      if (line.match(/\bvar\s+\w+/)) {
        issues.push({
          file,
          line: index + 1,
          column: line.indexOf('var'),
          severity: 'warning',
          message: 'Use of var keyword',
          rule: 'no-var',
          suggestion: 'Use const or let instead of var',
        });
      }
    });

    return issues;
  }

  private checkDoubleEquals(file: string, content: string): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const matches = line.match(/[^=!<>]==(?!=)/g);
      if (matches) {
        issues.push({
          file,
          line: index + 1,
          column: line.indexOf('=='),
          severity: 'warning',
          message: 'Use of == instead of ===',
          rule: 'eqeqeq',
          suggestion: 'Use === for strict equality comparison',
        });
      }
    });

    return issues;
  }

  private calculateMaintainability(complexity: number, linesOfCode: number): number {
    // Simplified maintainability index
    // Higher is better, range 0-100
    const volume = linesOfCode * Math.log2(linesOfCode || 1);
    const maintainability = Math.max(
      0,
      Math.min(100, 171 - 5.2 * Math.log(volume) - 0.23 * complexity - 16.2 * Math.log(linesOfCode || 1))
    );
    
    return maintainability;
  }
}
