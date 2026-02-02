#!/bin/bash

# Quick setup script for PHP GitHub Stats

echo "🚀 Setting up PHP GitHub Stats..."
echo "================================"

# Check if PHP is available
if ! command -v php &> /dev/null; then
    echo "❌ PHP is not installed. Please install PHP first."
    exit 1
fi

# Check PHP version
PHP_VERSION=$(php -r "echo PHP_VERSION;")
echo "📍 PHP version: $PHP_VERSION"

# Create cache directory
echo "📁 Creating cache directory..."
mkdir -p cache
chmod 755 cache

# Test the implementation
echo "🧪 Testing implementation..."
php test.php > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ All tests passed!"
else
    echo "❌ Tests failed. Check the output above."
    exit 1
fi

# Start server
echo "🌐 Starting PHP development server..."
echo "====================================="
echo "Server will be available at: http://localhost:8080"
echo ""
echo "Example URLs:"
echo "  • http://localhost:8080/github-stats.php?username=octocat"
echo "  • http://localhost:8080/github-stats.php?username=octocat&theme=dark"
echo "  • http://localhost:8080/github-stats.php?username=octocat&hide=stars,commits"
echo ""
echo "Press Ctrl+C to stop the server"
echo "====================================="

php -S localhost:8080