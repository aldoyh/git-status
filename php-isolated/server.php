<?php
/**
 * Simple PHP built-in server test for GitHub Stats
 */

$host = 'localhost';
$port = 8080;

echo "Starting PHP development server on http://{$host}:{$port}\n";
echo "Press Ctrl+C to stop the server\n\n";

$command = sprintf('php -S %s:%d -t .', $host, $port);
passthru($command);