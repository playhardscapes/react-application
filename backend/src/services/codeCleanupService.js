// src/services/codeCleanupService.js
const fs = require('fs').promises;
const path = require('path');

class CodeCleanupService {
  constructor() {
    this.ignoreDirs = new Set(['node_modules', 'dist', '.git', 'build']);
    this.fileTypes = new Set(['.js', '.jsx', '.ts', '.tsx']);
    this.routeMap = new Map();  // Maps routes to their handlers
    this.serviceUsage = new Map();  // Tracks where services are used
  }

  async analyzeProject(rootDir) {
    try {
      const files = await this.getAllFiles(rootDir);
      console.log(`Found ${files.length} files to analyze`);

      // First pass: build route and service maps
      await this.buildDependencyMaps(files);

      // Second pass: analyze usage
      const [unusedFiles, serviceCoverage] = await this.analyzeUsage(files);

      const priorities = this.generatePriorities(unusedFiles, serviceCoverage);

      return {
        unused: unusedFiles,
        serviceCoverage,
        priorities,
        totalFiles: files.length,
        scannedDirs: files.map(f => path.dirname(f.path))
          .filter((v, i, a) => a.indexOf(v) === i)
      };
    } catch (error) {
      console.error('Project analysis error:', error);
      throw error;
    }
  }

  async buildDependencyMaps(files) {
    for (const file of files) {
      const content = await fs.readFile(file.path, 'utf8');
      
      // Look for route definitions
      if (file.path.includes('/routes/')) {
        const routes = this.extractRoutes(content);
        routes.forEach(route => {
          this.routeMap.set(route.path, {
            method: route.method,
            handler: route.handler,
            file: file.path
          });
        });
      }

      // Track service imports and usage
      if (file.path.includes('/services/')) {
        const serviceName = path.basename(file.path, path.extname(file.path));
        this.serviceUsage.set(serviceName, {
          path: file.path,
          usedIn: new Set()
        });
      }

      // Track service usage in other files
      const serviceImports = this.extractServiceImports(content);
      serviceImports.forEach(service => {
        const usage = this.serviceUsage.get(service);
        if (usage) {
          usage.usedIn.add(file.path);
        }
      });
    }
  }

  async analyzeUsage(files) {
    const unusedFiles = [];
    const serviceCoverage = [];

    for (const file of files) {
      const isRoute = file.path.includes('/routes/');
      const isService = file.path.includes('/services/');
      const isController = file.path.includes('/controllers/');

      if (isService) {
        const serviceName = path.basename(file.path, path.extname(file.path));
        const usage = this.serviceUsage.get(serviceName);
        
        if (!usage || usage.usedIn.size === 0) {
          unusedFiles.push({
            path: file.path,
            type: 'service',
            suggestion: 'This service appears to be unused. Consider removing it or adding references.'
          });
        } else {
          serviceCoverage.push({
            name: serviceName,
            path: file.path,
            usageCount: usage.usedIn.size,
            usedIn: Array.from(usage.usedIn)
          });
        }
      }

      if (isController) {
        const controllerName = path.basename(file.path, path.extname(file.path));
        const hasRoutes = Array.from(this.routeMap.values())
          .some(route => route.handler.includes(controllerName));
        
        if (!hasRoutes) {
          unusedFiles.push({
            path: file.path,
            type: 'controller',
            suggestion: 'This controller is not referenced by any routes.'
          });
        }
      }
    }

    return [unusedFiles, serviceCoverage];
  }

  extractRoutes(content) {
    const routes = [];
    const routePatterns = [
      /router\.(get|post|put|delete|patch)\s*\(['"]([^'"]+)['"],\s*([^)]+)\)/g,
      /app\.(get|post|put|delete|patch)\s*\(['"]([^'"]+)['"],\s*([^)]+)\)/g,
      /router\.route\(['"]([^'"]+)['"]\)\.(get|post|put|delete|patch)\s*\(([^)]+)\)/g
    ];

    routePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        routes.push({
          method: match[1],
          path: match[2],
          handler: match[3].trim()
        });
      }
    });

    return routes;
  }

  extractServiceImports(content) {
    const services = new Set();
    
    // Match require statements
    const requirePattern = /require\(['"]\.\.\/services\/([^'"]+)['"]\)/g;
    let match;
    while ((match = requirePattern.exec(content)) !== null) {
      services.add(match[1].replace(/\.js$/, ''));
    }

    // Match import statements
    const importPattern = /import.*from\s+['"]\.\.\/services\/([^'"]+)['"]/g;
    while ((match = importPattern.exec(content)) !== null) {
      services.add(match[1].replace(/\.js$/, ''));
    }

    return Array.from(services);
  }

  generatePriorities(unusedFiles, serviceCoverage) {
    const priorities = [];

    // Group unused files by type
    const unusedByType = unusedFiles.reduce((acc, file) => {
      acc[file.type] = (acc[file.type] || 0) + 1;
      return acc;
    }, {});

    if (unusedFiles.length > 0) {
      priorities.push({
        type: 'unused-code',
        priority: 'high',
        description: `Found ${unusedFiles.length} potentially unused files`,
        details: Object.entries(unusedByType)
          .map(([type, count]) => `${count} unused ${type}(s)`)
          .join(', '),
        recommendation: 'Review and remove unused services and controllers, or ensure they are properly referenced.'
      });
    }

    // Analyze service coverage
    const lowCoverageServices = serviceCoverage.filter(s => s.usageCount < 2);
    if (lowCoverageServices.length > 0) {
      priorities.push({
        type: 'service-usage',
        priority: 'medium',
        description: `Found ${lowCoverageServices.length} services with limited usage`,
        details: `Services used in less than 2 locations may need review`,
        recommendation: 'Consider consolidating services or ensuring proper service reuse.'
      });
    }

    return priorities;
  }

  async getAllFiles(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      entries
        .filter(entry => !this.ignoreDirs.has(entry.name))
        .map(async entry => {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            return this.getAllFiles(fullPath);
          } else if (this.fileTypes.has(path.extname(entry.name))) {
            const stats = await fs.stat(fullPath);
            return [{
              path: fullPath,
              name: entry.name,
              size: stats.size,
              lastModified: stats.mtime
            }];
          }
          return [];
        })
    );

    return files.flat();
  }
}

module.exports = new CodeCleanupService();