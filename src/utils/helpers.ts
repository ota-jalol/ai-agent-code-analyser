import * as fs from 'fs';
import * as path from 'path';

export class Logger {
  private static instance: Logger;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  info(message: string): void {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
  }

  warn(message: string): void {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
  }

  error(message: string, error?: Error): void {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
    if (error) {
      console.error(error);
    }
  }

  success(message: string): void {
    console.log(`[SUCCESS] ${new Date().toISOString()} - ${message}`);
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function detectLanguage(filePath: string): 'javascript' | 'typescript' | 'dart' | null {
  const ext = path.extname(filePath);
  switch (ext) {
    case '.js':
    case '.jsx':
    case '.mjs':
    case '.cjs':
      return 'javascript';
    case '.ts':
    case '.tsx':
      return 'typescript';
    case '.dart':
      return 'dart';
    default:
      return null;
  }
}

export function isCodeFile(filePath: string): boolean {
  return detectLanguage(filePath) !== null;
}

export async function readFile(filePath: string): Promise<string> {
  return fs.promises.readFile(filePath, 'utf-8');
}

export async function writeFile(filePath: string, content: string): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.promises.mkdir(dir, { recursive: true });
  await fs.promises.writeFile(filePath, content, 'utf-8');
}

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.promises.mkdir(dirPath, { recursive: true });
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function calculateComplexity(code: string): number {
  // Simple cyclomatic complexity approximation
  const keywords = [
    'if', 'else', 'for', 'while', 'case', 'catch',
    'switch'
  ];
  
  let complexity = 1;
  for (const keyword of keywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
    const matches = code.match(regex);
    if (matches) {
      complexity += matches.length;
    }
  }
  
  // Count logical operators and ternary operators separately
  complexity += (code.match(/&&/g) || []).length;
  complexity += (code.match(/\|\|/g) || []).length;
  complexity += (code.match(/\?/g) || []).length;
  
  return complexity;
}

export function extractImports(code: string, language: string): string[] {
  const imports: string[] = [];
  
  if (language === 'javascript' || language === 'typescript') {
    const importRegex = /import\s+.*\s+from\s+['"]([^'"]+)['"]/g;
    const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    
    let match;
    while ((match = importRegex.exec(code)) !== null) {
      imports.push(match[1]);
    }
    while ((match = requireRegex.exec(code)) !== null) {
      imports.push(match[1]);
    }
  } else if (language === 'dart') {
    const importRegex = /import\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(code)) !== null) {
      imports.push(match[1]);
    }
  }
  
  return imports;
}
