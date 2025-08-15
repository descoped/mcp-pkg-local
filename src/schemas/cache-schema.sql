-- SQLite Cache Schema for mcp-pkg-local
-- Version: 0.1.1
-- Date: 2025-08-15

-- Enable foreign key constraints and performance optimizations
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA temp_store = MEMORY;
PRAGMA mmap_size = 268435456; -- 256MB mmap

-- Schema version tracking
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY,
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial schema version
INSERT OR IGNORE INTO schema_version (version) VALUES (1);

-- Environment tracking table
-- Stores metadata for each scanned environment (project)
CREATE TABLE IF NOT EXISTS environments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  partition_key TEXT UNIQUE NOT NULL,         -- e.g., "nodejs-/path/to/project"
  project_path TEXT NOT NULL,                 -- absolute path to project root
  language TEXT NOT NULL CHECK (language IN ('python', 'javascript')),
  package_manager TEXT,                       -- npm, poetry, pip, etc.
  last_scan DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  scan_duration_ms INTEGER,                   -- milliseconds taken for last scan
  metadata BLOB,                              -- MessagePack encoded EnvironmentInfo
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Package information table
-- Stores individual package metadata for each environment
CREATE TABLE IF NOT EXISTS packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  environment_id INTEGER NOT NULL,
  name TEXT NOT NULL,                         -- package name (e.g., "typescript", "@types/node")
  version TEXT NOT NULL,                      -- semantic version string
  location TEXT NOT NULL,                     -- relative path from project root
  language TEXT NOT NULL CHECK (language IN ('python', 'javascript')),
  category TEXT CHECK (category IN ('production', 'development')), -- NULL for transitive
  relevance_score INTEGER DEFAULT 0,         -- 0-1000 score for smart prioritization
  popularity_score INTEGER DEFAULT 0,        -- 0-100 score for general popularity
  file_count INTEGER,                         -- number of files in package
  size_bytes INTEGER,                         -- total package size
  main_file TEXT,                             -- entry point file path
  has_types BOOLEAN DEFAULT 0,                -- has TypeScript definitions
  is_direct_dependency BOOLEAN DEFAULT 0,     -- declared in project config
  metadata BLOB,                              -- MessagePack encoded PackageInfo
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (environment_id) REFERENCES environments(id) ON DELETE CASCADE,
  UNIQUE(environment_id, name)
);

-- Package file cache (optional, for performance)
-- Stores frequently accessed file contents
CREATE TABLE IF NOT EXISTS package_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  package_id INTEGER NOT NULL,
  file_path TEXT NOT NULL,                    -- relative path within package
  content_hash TEXT NOT NULL,                 -- SHA-256 hash of content
  content BLOB,                               -- compressed file content
  content_type TEXT DEFAULT 'text',           -- text, binary, json, etc.
  size_bytes INTEGER,
  last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
  UNIQUE(package_id, file_path)
);

-- Indexes for performance optimization

-- Environment lookups by partition key
CREATE INDEX IF NOT EXISTS idx_environments_partition 
ON environments(partition_key);

-- Environment lookups by path and language
CREATE INDEX IF NOT EXISTS idx_environments_path_lang 
ON environments(project_path, language);

-- Environment age for cleanup
CREATE INDEX IF NOT EXISTS idx_environments_last_scan 
ON environments(last_scan);

-- Package lookups by environment and name (most common query)
CREATE INDEX IF NOT EXISTS idx_packages_env_name 
ON packages(environment_id, name);

-- Package filtering by category
CREATE INDEX IF NOT EXISTS idx_packages_env_category 
ON packages(environment_id, category);

-- Smart sorting by relevance score (descending)
CREATE INDEX IF NOT EXISTS idx_packages_env_relevance 
ON packages(environment_id, relevance_score DESC);

-- Filtering by direct dependencies
CREATE INDEX IF NOT EXISTS idx_packages_env_direct 
ON packages(environment_id, is_direct_dependency);

-- Package search by name patterns (for regex filtering)
CREATE INDEX IF NOT EXISTS idx_packages_name 
ON packages(name);

-- Package filtering by language
CREATE INDEX IF NOT EXISTS idx_packages_env_language 
ON packages(environment_id, language);

-- Combined index for common query patterns
CREATE INDEX IF NOT EXISTS idx_packages_env_cat_score 
ON packages(environment_id, category, relevance_score DESC);

-- File cache lookups
CREATE INDEX IF NOT EXISTS idx_package_files_package_path 
ON package_files(package_id, file_path);

-- File cache cleanup by access time
CREATE INDEX IF NOT EXISTS idx_package_files_accessed 
ON package_files(last_accessed);

-- Package cleanup by update time
CREATE INDEX IF NOT EXISTS idx_packages_updated 
ON packages(updated_at);

-- Triggers for automatic timestamp updates

-- Update environments.updated_at on row modification
CREATE TRIGGER IF NOT EXISTS update_environments_timestamp 
AFTER UPDATE ON environments
BEGIN
  UPDATE environments 
  SET updated_at = CURRENT_TIMESTAMP 
  WHERE id = NEW.id;
END;

-- Update packages.updated_at on row modification
CREATE TRIGGER IF NOT EXISTS update_packages_timestamp 
AFTER UPDATE ON packages
BEGIN
  UPDATE packages 
  SET updated_at = CURRENT_TIMESTAMP 
  WHERE id = NEW.id;
END;

-- Update package_files.last_accessed on content access
CREATE TRIGGER IF NOT EXISTS update_files_access_timestamp 
AFTER UPDATE OF content ON package_files
BEGIN
  UPDATE package_files 
  SET last_accessed = CURRENT_TIMESTAMP 
  WHERE id = NEW.id;
END;

-- Views for common queries

-- Active environments (scanned within last 7 days)
CREATE VIEW IF NOT EXISTS active_environments AS
SELECT 
  id,
  partition_key,
  project_path,
  language,
  package_manager,
  last_scan,
  (julianday('now') - julianday(last_scan)) * 24 * 60 * 60 AS age_seconds
FROM environments 
WHERE last_scan > datetime('now', '-7 days')
ORDER BY last_scan DESC;

-- Package summary by environment
CREATE VIEW IF NOT EXISTS package_summary AS
SELECT 
  e.id as environment_id,
  e.partition_key,
  e.language,
  COUNT(p.id) as total_packages,
  COUNT(CASE WHEN p.category = 'production' THEN 1 END) as production_packages,
  COUNT(CASE WHEN p.category = 'development' THEN 1 END) as development_packages,
  COUNT(CASE WHEN p.is_direct_dependency = 1 THEN 1 END) as direct_packages,
  AVG(p.relevance_score) as avg_relevance_score,
  SUM(p.size_bytes) as total_size_bytes
FROM environments e
LEFT JOIN packages p ON e.id = p.environment_id
GROUP BY e.id, e.partition_key, e.language;

-- Top packages by relevance (for quick access)
CREATE VIEW IF NOT EXISTS top_packages AS
SELECT 
  p.*,
  e.partition_key,
  e.language as env_language
FROM packages p
JOIN environments e ON p.environment_id = e.id
WHERE p.relevance_score > 500
ORDER BY p.environment_id, p.relevance_score DESC;

-- Performance statistics
CREATE VIEW IF NOT EXISTS cache_stats AS
SELECT 
  'environments' as table_name,
  COUNT(*) as row_count,
  AVG(scan_duration_ms) as avg_scan_duration,
  MAX(last_scan) as latest_scan
FROM environments
UNION ALL
SELECT 
  'packages' as table_name,
  COUNT(*) as row_count,
  AVG(relevance_score) as avg_relevance,
  MAX(updated_at) as latest_update
FROM packages
UNION ALL
SELECT 
  'package_files' as table_name,
  COUNT(*) as row_count,
  AVG(size_bytes) as avg_file_size,
  MAX(last_accessed) as latest_access
FROM package_files;