import * as fs from 'fs';
import * as path from 'path';
import { parse } from '@babel/parser';
import { glob } from 'glob';
import type { ProjectStructure, FileMetadata, ASTNode } from '../types/index.js';
import { Logger, generateId, detectLanguage, readFile, extractImports, isCodeFile } from '../utils/helpers.js';

/**
 * Ingestor Agent
 * Responsible for reading project structure recursively,
 * extracting functions, classes, modules, building AST and dependency graphs
 */
export class IngestorAgent {
  private logger: Logger;

  constructor() {
    this.logger = Logger.getInstance();
  }

  async ingest(projectPath: string): Promise<ProjectStructure> {
    this.logger.info(`Starting project ingestion: ${projectPath}`);

    const files = await this.scanProject(projectPath);
    this.logger.info(`Found ${files.length} code files`);

    const fileMetadataMap = new Map<string, FileMetadata>();
    const astMap = new Map<string, ASTNode>();
    const dependencyGraph = new Map<string, string[]>();

    for (const file of files) {
      try {
        const metadata = await this.processFile(file, projectPath);
        fileMetadataMap.set(file, metadata);
        
        const ast = await this.buildAST(file, metadata.language);
        if (ast) {
          astMap.set(file, ast);
        }
        
        dependencyGraph.set(file, metadata.dependencies);
      } catch (error) {
        this.logger.warn(`Failed to process file ${file}: ${error}`);
      }
    }

    const structure: ProjectStructure = {
      rootPath: projectPath,
      files: Array.from(fileMetadataMap.values()),
      dependencyGraph,
      astMap,
    };

    this.logger.success(`Project ingestion complete: ${files.length} files processed`);
    return structure;
  }

  private async scanProject(projectPath: string): Promise<string[]> {
    const patterns = [
      '**/*.js',
      '**/*.jsx',
      '**/*.ts',
      '**/*.tsx',
      '**/*.dart',
      '**/*.mjs',
      '**/*.cjs',
    ];

    const ignore = [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.git/**',
      '**/coverage/**',
      '**/*.min.js',
      '**/*.test.*',
      '**/*.spec.*',
    ];

    const files: string[] = [];
    
    for (const pattern of patterns) {
      const matches = await glob(pattern, {
        cwd: projectPath,
        absolute: true,
        ignore,
      });
      files.push(...matches);
    }

    return [...new Set(files)]; // Remove duplicates
  }

  private async processFile(filePath: string, projectPath: string): Promise<FileMetadata> {
    const stats = await fs.promises.stat(filePath);
    const content = await readFile(filePath);
    const language = detectLanguage(filePath);

    if (!language) {
      throw new Error(`Unknown language for file: ${filePath}`);
    }

    const dependencies = extractImports(content, language);
    const relativePath = path.relative(projectPath, filePath);

    return {
      id: generateId(),
      path: relativePath,
      language,
      size: stats.size,
      lastModified: stats.mtime,
      dependencies,
    };
  }

  private async buildAST(filePath: string, language: string): Promise<ASTNode | null> {
    try {
      const content = await readFile(filePath);

      if (language === 'javascript' || language === 'typescript') {
        const ast = parse(content, {
          sourceType: 'module',
          plugins: language === 'typescript' 
            ? ['typescript', 'jsx']
            : ['jsx', 'flow'],
        });

        return this.convertBabelAST(ast);
      } else if (language === 'dart') {
        // For Dart, we'd need a Dart parser. For now, return a simplified structure
        return this.parseDartSimple(content);
      }

      return null;
    } catch (error) {
      this.logger.warn(`Failed to build AST for ${filePath}: ${error}`);
      return null;
    }
  }

  private convertBabelAST(babelAST: any): ASTNode {
    const convert = (node: any): ASTNode => {
      const astNode: ASTNode = {
        type: node.type,
        name: node.name || node.id?.name,
        loc: node.loc ? {
          start: { line: node.loc.start.line, column: node.loc.start.column },
          end: { line: node.loc.end.line, column: node.loc.end.column },
        } : undefined,
      };

      // Extract children based on node type
      const children: ASTNode[] = [];
      
      if (node.body) {
        if (Array.isArray(node.body)) {
          children.push(...node.body.map(convert));
        } else {
          children.push(convert(node.body));
        }
      }

      if (node.declarations) {
        children.push(...node.declarations.map(convert));
      }

      if (children.length > 0) {
        astNode.children = children;
      }

      return astNode;
    };

    return convert(babelAST);
  }

  private parseDartSimple(content: string): ASTNode {
    // Simple Dart parsing - extract classes and functions
    const lines = content.split('\n');
    const children: ASTNode[] = [];

    lines.forEach((line, index) => {
      const classMatch = line.match(/class\s+(\w+)/);
      const functionMatch = line.match(/(?:void|Future|String|int|double|bool)\s+(\w+)\s*\(/);

      if (classMatch) {
        children.push({
          type: 'ClassDeclaration',
          name: classMatch[1],
          loc: {
            start: { line: index + 1, column: 0 },
            end: { line: index + 1, column: line.length },
          },
        });
      } else if (functionMatch) {
        children.push({
          type: 'FunctionDeclaration',
          name: functionMatch[1],
          loc: {
            start: { line: index + 1, column: 0 },
            end: { line: index + 1, column: line.length },
          },
        });
      }
    });

    return {
      type: 'Program',
      children,
    };
  }
}
