// Commented out - not used after SQLiteCache methods were commented
// This class was only used by the advanced query methods in SQLiteCache
// Preserved for future use when advanced querying is needed

// import type { PackageQueryOptions } from '#types';
//
// /**
//  * Smart SQL query builder for package filtering
//  * Generates optimized queries based on filter combinations
//  */
// export class SQLiteQueryBuilder {
//   /**
//    * Build optimized package query with smart filtering
//    */
//   static buildPackageQuery(
//     environmentId: number,
//     options: PackageQueryOptions = {},
//   ): { sql: string; params: unknown[] } {
//     const conditions: string[] = ['environment_id = ?'];
//     const params: unknown[] = [environmentId];
//
//     // Category filtering (uses index: idx_packages_env_category)
//     if (options.category && options.category !== 'all') {
//       conditions.push('category = ?');
//       params.push(options.category);
//     }
//
//     // Direct dependency filtering (uses index: idx_packages_env_direct)
//     if (options.directOnly) {
//       conditions.push('is_direct_dependency = 1');
//     }
//
//     // Type definitions filtering
//     if (options.includeTypes === false) {
//       conditions.push('name NOT LIKE "@types/%"');
//     }
//
//     // Relevance score threshold (uses index: idx_packages_env_relevance)
//     if (options.minRelevanceScore !== undefined) {
//       conditions.push('relevance_score >= ?');
//       params.push(options.minRelevanceScore);
//     }
//
//     // Build WHERE clause
//     let sql = `SELECT * FROM packages WHERE ${conditions.join(' AND ')}`;
//
//     // Add regex filtering if provided (post-filter after index lookups)
//     if (options.filter) {
//       sql = this.addRegexFilter(sql, options.filter, params);
//     }
//
//     // Add ORDER BY clause based on sort preference
//     sql = this.addSorting(sql, options);
//
//     // Add LIMIT and OFFSET for pagination
//     sql = this.addPagination(sql, options, params);
//
//     return { sql, params };
//   }
//
//   /**
//    * Build query for getting top packages by relevance
//    * Optimized for the most common use case
//    */
//   static buildTopPackagesQuery(
//     environmentId: number,
//     limit = 50,
//     options: Partial<PackageQueryOptions> = {},
//   ): { sql: string; params: unknown[] } {
//     const params: unknown[] = [environmentId];
//
//     // Use covering index for best performance
//     let sql = `
//       SELECT
//         p.*,
//         CASE
//           WHEN p.is_direct_dependency = 1 THEN p.relevance_score + 100
//           WHEN p.category = 'production' THEN p.relevance_score + 50
//           ELSE p.relevance_score
//         END as adjusted_score
//       FROM packages p
//       WHERE p.environment_id = ?
//     `;
//
//     // Apply optional filters
//     if (options.category && options.category !== 'all') {
//       sql += ' AND p.category = ?';
//       params.push(options.category);
//     }
//
//     if (options.includeTypes === false) {
//       sql += ' AND p.name NOT LIKE "@types/%"';
//     }
//
//     // Order by adjusted relevance score
//     sql += ' ORDER BY adjusted_score DESC, p.name ASC';
//
//     // Apply limit
//     sql += ' LIMIT ?';
//     params.push(limit);
//
//     return { sql, params };
//   }
//
//   /**
//    * Build query for package group filtering
//    * Matches packages against predefined groups
//    */
//   static buildGroupQuery(
//     environmentId: number,
//     _group: string,
//     groupPatterns: string[],
//   ): { sql: string; params: unknown[] } {
//     const params: unknown[] = [environmentId];
//
//     // Build OR conditions for all patterns in the group
//     const patternConditions = groupPatterns.map(() => 'name GLOB ?');
//
//     let sql = `
//       SELECT * FROM packages
//       WHERE environment_id = ?
//       AND (${patternConditions.join(' OR ')})
//       ORDER BY relevance_score DESC, name ASC
//     `;
//
//     // Add all pattern parameters
//     params.push(...groupPatterns);
//
//     return { sql, params };
//   }
//
//   /**
//    * Build query for summary statistics
//    */
//   static buildSummaryQuery(environmentId: number): { sql: string; params: unknown[] } {
//     const sql = `
//       SELECT
//         COUNT(*) as total,
//         COUNT(CASE WHEN category = 'production' THEN 1 END) as production_count,
//         COUNT(CASE WHEN category = 'development' THEN 1 END) as development_count,
//         COUNT(CASE WHEN is_direct_dependency = 1 THEN 1 END) as direct_count,
//         COUNT(CASE WHEN is_direct_dependency = 0 THEN 1 END) as transitive_count,
//         COUNT(CASE WHEN name LIKE '@types/%' THEN 1 END) as types_count,
//         AVG(relevance_score) as avg_relevance,
//         MAX(relevance_score) as max_relevance,
//         SUM(size_bytes) as total_size,
//         COUNT(DISTINCT SUBSTR(name, 1, INSTR(name || '/', '/') - 1)) as unique_scopes
//       FROM packages
//       WHERE environment_id = ?
//     `;
//
//     return { sql, params: [environmentId] };
//   }
//
//   /**
//    * Build query for finding similar packages
//    * Uses edit distance for fuzzy matching
//    */
//   static buildSimilarPackagesQuery(
//     environmentId: number,
//     packageName: string,
//     _maxDistance = 3,
//   ): { sql: string; params: unknown[] } {
//     // SQLite doesn't have built-in edit distance, so we use LIKE patterns
//     const patterns = this.generateSimilarPatterns(packageName);
//     const params: unknown[] = [environmentId];
//
//     const patternConditions = patterns.map(() => 'name LIKE ?');
//
//     const sql = `
//       SELECT
//         *,
//         CASE
//           WHEN name = ? THEN 1000
//           WHEN name LIKE ? THEN 500
//           ELSE 100
//         END as similarity_score
//       FROM packages
//       WHERE environment_id = ?
//       AND (${patternConditions.join(' OR ')})
//       ORDER BY similarity_score DESC, relevance_score DESC
//       LIMIT 10
//     `;
//
//     params.unshift(packageName, `%${packageName}%`);
//     params.push(...patterns);
//
//     return { sql, params };
//   }
//
//   /**
//    * Build query for package dependency analysis
//    */
//   static buildDependencyAnalysisQuery(environmentId: number): { sql: string; params: unknown[] } {
//     const sql = `
//       WITH dependency_stats AS (
//         SELECT
//           CASE
//             WHEN is_direct_dependency = 1 THEN 'direct'
//             ELSE 'transitive'
//           END as dep_type,
//           category,
//           COUNT(*) as count,
//           SUM(size_bytes) as total_size,
//           AVG(relevance_score) as avg_relevance
//         FROM packages
//         WHERE environment_id = ?
//         GROUP BY is_direct_dependency, category
//       )
//       SELECT * FROM dependency_stats
//       ORDER BY dep_type, category
//     `;
//
//     return { sql, params: [environmentId] };
//   }
//
//   /**
//    * Add regex filtering to query
//    */
//   private static addRegexFilter(sql: string, filter: string, params: unknown[]): string {
//     // SQLite uses GLOB for simple patterns, REGEXP for complex ones
//     // Check if it's a simple glob pattern or complex regex
//     if (this.isSimpleGlobPattern(filter)) {
//       sql += ' AND name GLOB ?';
//       params.push(filter);
//     } else {
//       sql += ' AND name REGEXP ?';
//       params.push(filter);
//     }
//     return sql;
//   }
//
//   /**
//    * Add sorting to query
//    */
//   private static addSorting(sql: string, options: PackageQueryOptions): string {
//     const sortBy = options.sortBy ?? 'relevance';
//     const sortOrder = (options.sortOrder ?? 'desc').toUpperCase();
//
//     switch (sortBy) {
//       case 'relevance':
//         sql += ` ORDER BY relevance_score ${sortOrder}, name ASC`;
//         break;
//       case 'popularity':
//         sql += ` ORDER BY popularity_score ${sortOrder}, name ASC`;
//         break;
//       case 'name':
//         sql += ` ORDER BY name ${sortOrder}`;
//         break;
//       default:
//         sql += ` ORDER BY relevance_score DESC, name ASC`;
//     }
//
//     return sql;
//   }
//
//   /**
//    * Add pagination to query
//    */
//   private static addPagination(
//     sql: string,
//     options: PackageQueryOptions,
//     params: unknown[],
//   ): string {
//     if (options.limit) {
//       sql += ' LIMIT ?';
//       params.push(options.limit);
//     }
//
//     if (options.offset) {
//       sql += ' OFFSET ?';
//       params.push(options.offset);
//     }
//
//     return sql;
//   }
//
//   /**
//    * Check if pattern is simple glob (*, ?) vs complex regex
//    */
//   private static isSimpleGlobPattern(pattern: string): boolean {
//     // Simple glob patterns only use * and ? wildcards
//     return /^[a-zA-Z0-9@/_*?-]+$/.test(pattern);
//   }
//
//   /**
//    * Generate similar patterns for fuzzy matching
//    */
//   private static generateSimilarPatterns(name: string): string[] {
//     const patterns: string[] = [];
//
//     // Common typos and variations
//     patterns.push(`${name}%`); // Starts with
//     patterns.push(`%${name}`); // Ends with
//     patterns.push(`%${name}%`); // Contains
//
//     // Handle scoped packages
//     if (name.includes('/')) {
//       const [scope, pkg] = name.split('/');
//       patterns.push(`${scope}/%${pkg}%`);
//       patterns.push(`%/${pkg}`);
//     }
//
//     // Handle common separators
//     if (name.includes('-')) {
//       patterns.push(name.replace(/-/g, '_'));
//       patterns.push(name.replace(/-/g, '.'));
//     }
//
//     return patterns;
//   }
//
//   /**
//    * Build an EXPLAIN QUERY PLAN statement for debugging
//    */
//   static buildExplainQuery(query: string): string {
//     return `EXPLAIN QUERY PLAN ${query}`;
//   }
// }
