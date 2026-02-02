<?php
/**
 * Environment configuration for GitHub Stats PHP
 */

// GitHub Personal Access Token (required for API requests)
// Get one from: https://github.com/settings/tokens
// NOTE: Replace 'your_github_token_here' with your actual token!
$GITHUB_TOKEN = getenv('GITHUB_TOKEN') ?: 'your_github_token_here';

// Set the token in environment for the app to use
$_ENV['GITHUB_TOKEN'] = $GITHUB_TOKEN;

// Cache settings
$CACHE_ENABLED = true;
$CACHE_TTL = 1800; // 30 minutes

// Error reporting (set to false in production)
$DEBUG_MODE = getenv('DEBUG_MODE') === 'true' || true;

// Memory limit (increase if needed for large repositories)
$MEMORY_LIMIT = '128M';

// Timeout for GitHub API calls (seconds)
$API_TIMEOUT = 10;

// Default theme if none specified
$DEFAULT_THEME = 'dark';

// Set memory limit
ini_set('memory_limit', $MEMORY_LIMIT);

// Error reporting - ON for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set timezone
date_default_timezone_set('UTC');
