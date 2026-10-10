import fs from 'fs';
import path from 'path';
import { RepositoryContext } from '../../types/codeforge';

export class RepoInspector {
  public static async inspectDirectory(dirPath: string, repoName: string = 'local-repo'): Promise<RepositoryContext> {
    const exists = fs.existsSync(dirPath);
    if (!exists) {
      throw new Error(`Target repository directory does not exist: ${dirPath}`);
    }

    const files = this.scanDirRecursive(dirPath, 4);
    let language = 'JavaScript / TypeScript';
    let framework = 'Node.js / Web Application';
    let packageManager = 'npm';
    const dependencies: Record<string, string> = {};
    const apiEndpoints: string[] = [];
    const entryPoints: string[] = [];
    const databaseModels: string[] = [];
    const testSuites: string[] = [];
    const riskyFiles: string[] = [];

    // Check package.json
    const pkgPath = path.join(dirPath, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        if (pkg.dependencies) {
          Object.assign(dependencies, pkg.dependencies);
        }
        if (pkg.devDependencies) {
          Object.assign(dependencies, pkg.devDependencies);
        }
        if (dependencies['next']) {
          framework = 'Next.js App Router';
          language = 'TypeScript / React';
        } else if (dependencies['fastapi']) {
          framework = 'FastAPI';
          language = 'Python';
        } else if (dependencies['express']) {
          framework = 'Express.js';
        }
      } catch (err) {
        console.warn('Error reading package.json:', err);
      }
    }

    // Check pyproject.toml / requirements.txt
    const reqPath = path.join(dirPath, 'requirements.txt');
    if (fs.existsSync(reqPath)) {
      language = 'Python';
      framework = 'FastAPI / AsyncIO';
      packageManager = 'poetry / pip';
      const lines = fs.readFileSync(reqPath, 'utf-8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const parts = trimmed.split(/[==,>=,<=,~=]/);
          dependencies[parts[0].trim()] = parts[1]?.trim() || '*';
        }
      }
    }

    // Classify files
    for (const relFile of files) {
      const lower = relFile.toLowerCase();
      if (lower.includes('test') || lower.includes('.spec.')) {
        testSuites.push(relFile);
      } else if (lower.includes('model') || lower.includes('schema') || lower.includes('entity')) {
        databaseModels.push(relFile);
      } else if (lower.includes('api/') || lower.includes('router') || lower.includes('route.')) {
        apiEndpoints.push(relFile);
      } else if (
        lower.endsWith('main.py') ||
        lower.endsWith('app.py') ||
        lower.endsWith('index.ts') ||
        lower.endsWith('page.tsx')
      ) {
        entryPoints.push(relFile);
      }

      if (
        lower.includes('auth') ||
        lower.includes('token') ||
        lower.includes('payment') ||
        lower.includes('secret') ||
        lower.includes('lock')
      ) {
        riskyFiles.push(relFile);
      }
    }

    return {
      id: `repo_${repoName.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}`,
      name: repoName,
      fullName: `workspace/${repoName}`,
      defaultBranch: 'main',
      language,
      framework,
      packageManager,
      structure: {
        totalFiles: files.length,
        entryPoints: entryPoints.slice(0, 5),
        apiEndpoints: apiEndpoints.slice(0, 8),
        databaseModels: databaseModels.slice(0, 6),
        testSuites: testSuites.slice(0, 6),
        riskyFiles: riskyFiles.slice(0, 6),
        dependencies: Object.fromEntries(Object.entries(dependencies).slice(0, 15)),
      },
      stats: {
        stars: 128,
        forks: 24,
        openIssues: 5,
        lastCommit: 'Just now',
      },
    };
  }

  private static scanDirRecursive(dir: string, maxDepth: number, currentDepth: number = 0): string[] {
    if (currentDepth > maxDepth) return [];
    let results: string[] = [];
    try {
      const list = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of list) {
        if (
          item.name === '.git' ||
          item.name === 'node_modules' ||
          item.name === '.next' ||
          item.name === '__pycache__'
        ) {
          continue;
        }
        if (item.isDirectory()) {
          results = results.concat(
            this.scanDirRecursive(path.join(dir, item.name), maxDepth, currentDepth + 1).map(
              (sub) => `${item.name}/${sub}`
            )
          );
        } else {
          results.push(item.name);
        }
      }
    } catch {
      // ignore unreadable
    }
    return results;
  }
}
