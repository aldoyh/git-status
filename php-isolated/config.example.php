<?php
/**
 * Environment configuration for GitHub Stats PHP
 * 
 * Copy this file to config.php and update with your settings
 */

// GitHub Personal Access Token (optional but recommended)
// Get one from: https://github.com/settings/tokens
$GITHUB_TOKEN = getenv('GITHUB_TOKEN') ?: '';

// Cache settings
$CACHE_ENABLED = true;
$CACHE_TTL = 1800; // 30 minutes

// Error reporting (set to false in production)
$DEBUG_MODE = getenv('DEBUG_MODE') === 'true';

// Memory limit (increase if needed for large repositories)
$MEMORY_LIMIT = '128M';

// Timeout for GitHub API calls (seconds)
$API_TIMEOUT = 10;

// Default theme if none specified
$DEFAULT_THEME = 'default';

// Available card widths
$MIN_CARD_WIDTH = 287;
$MAX_CARD_WIDTH = 1000;

// Rate limiting (requests per hour)
$MAX_REQUESTS_PER_HOUR = 1000;

// Set memory limit
ini_set('memory_limit', $MEMORY_LIMIT);

// Error reporting
if ($DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Set timezone (adjust as needed)
date_default_timezone_set('UTC');