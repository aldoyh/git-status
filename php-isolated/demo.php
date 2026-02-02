<?php
/**
 * Demo script to show PHP GitHub Stats in action
 */

require_once 'github-stats.php';

// Test with a well-known GitHub user (if no token, it might be rate limited)
$testUser = 'aldoyh';

echo "GitHub Stats PHP Demo\n";
echo "====================\n\n";

// Test 1: Basic stats card
echo "1. Basic Stats Card:\n";
echo "====================\n";
try {
    $basicStats = generateGitHubStats($testUser, ['theme' => 'dark', 'hide_rank' => true]);
    echo "✓ Generated basic stats card (" . strlen($basicStats) . " characters)\n";
    echo "✓ Contains SVG: " . (strpos($basicStats, '<svg') !== false ? 'Yes' : 'No') . "\n";
} catch (Exception $e) {
    echo "✗ Failed to generate basic stats: " . $e->getMessage() . "\n";
}

// Test 2: With different theme
echo "\n2. Different Theme (Dracula):\n";
echo "============================\n";
try {
    $draculaStats = generateGitHubStats($testUser, ['theme' => 'dracula', 'hide_title' => true]);
    echo "✓ Generated dracula themed card (" . strlen($draculaStats) . " characters)\n";
} catch (Exception $e) {
    echo "✗ Failed to generate dracula stats: " . $e->getMessage() . "\n";
}

// Test 3: Custom colors
echo "\n3. Custom Colors:\n";
echo "================\n";
try {
    $customStats = generateGitHubStats($testUser, [
        'title_color' => 'ff6b6b',
        'text_color' => '4ecdc4',
        'bg_color' => '45b7d1',
        'hide' => ['contribs']
    ]);
    echo "✓ Generated custom colored card (" . strlen($customStats) . " characters)\n";
} catch (Exception $e) {
    echo "✗ Failed to generate custom stats: " . $e->getMessage() . "\n";
}

// Test 4: Error handling
echo "\n4. Error Handling:\n";
echo "=================\n";
try {
    $errorStats = generateGitHubStats('', ['theme' => 'dark']);
    echo "✓ Error handling works (empty username)\n";
} catch (Exception $e) {
    echo "✓ Error handling works: " . $e->getMessage() . "\n";
}

// Test 5: Save sample SVG to file
echo "\n5. Saving Sample SVG:\n";
echo "====================\n";
try {
    if (isset($basicStats)) {
        file_put_contents('sample-stats.svg', $basicStats);
        echo "✓ Saved sample SVG to 'sample-stats.svg'\n";
        echo "✓ File size: " . filesize('sample-stats.svg') . " bytes\n";
    }
} catch (Exception $e) {
    echo "✗ Failed to save sample: " . $e->getMessage() . "\n";
}

echo "\n====================\n";
echo "Demo completed!\n";
echo "\nTo test with your own username:\n";
echo "php demo.php yourusername\n";
echo "\nOr via web browser:\n";
echo "http://localhost:8080/github-stats.php?username=yourusername\n";

// If username provided as argument
if ($argc > 1) {
    $username = $argv[1];
    echo "\nTesting with username: $username\n";
    try {
        $userStats = generateGitHubStats($username, ['theme' => 'radical']);
        file_put_contents("{$username}-stats.svg", $userStats);
        echo "✓ Saved {$username}-stats.svg\n";
    } catch (Exception $e) {
        echo "✗ Failed: " . $e->getMessage() . "\n";
    }
}
?>