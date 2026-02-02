<?php
/**
 * Test script for GitHub Stats PHP implementation
 */

// Test basic functionality without GitHub API calls
echo "Testing GitHub Stats PHP Implementation\n";
echo "========================================\n\n";

// Test 1: Check if main file exists and is readable
echo "1. Checking main file...\n";
if (file_exists('github-stats.php')) {
    echo "✓ github-stats.php exists\n";
} else {
    echo "✗ github-stats.php not found\n";
    exit(1);
}

// Test 2: Include the main file and check for syntax errors
echo "\n2. Testing PHP syntax...\n";
$output = shell_exec('php -l github-stats.php 2>&1');
if (strpos($output, 'No syntax errors') !== false) {
    echo "✓ No syntax errors found\n";
} else {
    echo "✗ Syntax errors found:\n";
    echo $output;
    exit(1);
}

// Test 3: Test theme functionality
echo "\n3. Testing theme functionality...\n";
require_once 'github-stats.php';

// Test theme colors
$testTheme = THEMES['dark'];
if (isset($testTheme['title_color']) && $testTheme['title_color'] === 'fff') {
    echo "✓ Theme 'dark' loaded correctly\n";
} else {
    echo "✗ Theme loading failed\n";
}

// Test 4: Test utility functions
echo "\n4. Testing utility functions...\n";

// Test kFormatter
$result = kFormatter(1500);
if ($result === '1.5k') {
    echo "✓ kFormatter works correctly\n";
} else {
    echo "✗ kFormatter failed: expected '1.5k', got '$result'\n";
}

// Test clampValue
$result = clampValue(150, 0, 100);
if ($result === 100) {
    echo "✓ clampValue works correctly\n";
} else {
    echo "✗ clampValue failed: expected 100, got $result\n";
}

// Test isValidHexColor
$result = isValidHexColor('ff0000');
if ($result === 1) {
    echo "✓ isValidHexColor works correctly\n";
} else {
    echo "✗ isValidHexColor failed\n";
}

// Test 5: Test error card rendering
echo "\n5. Testing error card rendering...\n";
try {
    $errorCard = renderErrorCard('Test Error', 'This is a test error');
    if (strpos($errorCard, '<svg') !== false) {
        echo "✓ Error card renders SVG correctly\n";
    } else {
        echo "✗ Error card does not contain SVG\n";
    }
} catch (Exception $e) {
    echo "✗ Error card rendering failed: " . $e->getMessage() . "\n";
}

// Test 6: Test cache functionality
echo "\n6. Testing cache functionality...\n";
try {
    $testData = ['test' => 'data'];
    setCache('test_key', $testData, 60);
    $retrieved = getCache('test_key');
    
    if ($retrieved && $retrieved['test'] === 'data') {
        echo "✓ Cache set and get work correctly\n";
    } else {
        echo "✗ Cache functionality failed\n";
    }
} catch (Exception $e) {
    echo "✗ Cache test failed: " . $e->getMessage() . "\n";
}

// Test 7: Test rank calculation
echo "\n7. Testing rank calculation...\n";
try {
    $rank = calculateRank([
        'commits' => 100,
        'prs' => 20,
        'issues' => 10,
        'stars' => 50,
        'followers' => 10
    ]);
    
    if (isset($rank['level']) && isset($rank['percentile'])) {
        echo "✓ Rank calculation works (Level: {$rank['level']}, Percentile: {$rank['percentile']})\n";
    } else {
        echo "✗ Rank calculation failed\n";
    }
} catch (Exception $e) {
    echo "✗ Rank calculation failed: " . $e->getMessage() . "\n";
}

echo "\n========================================\n";
echo "Testing completed!\n";
echo "\nTo test with a real GitHub username, you can:\n";
echo "1. Set up a web server and access: github-stats.php?username=yourusername\n";
echo "2. Or use PHP CLI: php -r 'include \"github-stats.php\"; echo generateGitHubStats(\"yourusername\");'\n";
?>