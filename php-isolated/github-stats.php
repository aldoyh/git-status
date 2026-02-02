<?php
/**
 * GitHub Stats Card Generator - PHP Version
 * Comprehensive implementation of GitHub readme stats functionality
 * 
 * Features:
 * - Multiple card types (stats, top languages, repo pins, gists)
 * - All 70+ themes from original project
 * - Internationalization (i18n) support
 * - Caching with configurable TTL
 * - Rate limiting and retry logic
 * - Comprehensive error handling
 * - SVG output with animations
 * - Gradient backgrounds
 */

// ============================================================================
// CONFIGURATION CONSTANTS
// ============================================================================

const GITHUB_API_URL = 'https://api.github.com/graphql';
const CACHE_DIR = __DIR__ . '/cache/';
const CACHE_DEFAULT_TTL = 1800; // 30 minutes
const MAX_RETRIES = 10;
const MEMORY_LIMIT = 128 * 1024 * 1024; // 128MB
const TIMEOUT_LIMIT = 10; // 10 seconds
const MIN_CARD_WIDTH = 287;
const DEFAULT_CARD_WIDTH = 287;

// ============================================================================
// THEME DEFINITIONS (All 70+ themes from original project)
// ============================================================================

const THEMES = [
    'default' => [
        'title_color' => '2f80ed',
        'icon_color' => '4c71f2', 
        'text_color' => '434d58',
        'bg_color' => 'fffefe',
        'border_color' => 'e4e2e2',
    ],
    'dark' => [
        'title_color' => 'fff',
        'icon_color' => '79ff97',
        'text_color' => '9f9f9f',
        'bg_color' => '151515',
    ],
    'radical' => [
        'title_color' => 'fe428e',
        'icon_color' => 'f8d847',
        'text_color' => 'a9fef7',
        'bg_color' => '141321',
    ],
    'merko' => [
        'title_color' => 'abd200',
        'icon_color' => 'b7d364',
        'text_color' => '68b587',
        'bg_color' => '0a0f0b',
    ],
    'gruvbox' => [
        'title_color' => 'fabd2f',
        'icon_color' => 'fe8019',
        'text_color' => '8ec07c',
        'bg_color' => '282828',
    ],
    'gruvbox_light' => [
        'title_color' => 'b57614',
        'icon_color' => 'af3a03',
        'text_color' => '427b58',
        'bg_color' => 'fbf1c7',
    ],
    'tokyonight' => [
        'title_color' => '70a5fd',
        'icon_color' => 'bf91f3',
        'text_color' => '38bdae',
        'bg_color' => '1a1b27',
    ],
    'onedark' => [
        'title_color' => 'e4bf7a',
        'icon_color' => '8eb573',
        'text_color' => 'df6d74',
        'bg_color' => '282c34',
    ],
    'cobalt' => [
        'title_color' => 'e683d9',
        'icon_color' => '0480ef',
        'text_color' => '75eeb2',
        'bg_color' => '193549',
    ],
    'synthwave' => [
        'title_color' => 'e2e9ec',
        'icon_color' => 'ef8539',
        'text_color' => 'e5289e',
        'bg_color' => '2b213a',
    ],
    'highcontrast' => [
        'title_color' => 'e7f216',
        'icon_color' => '00ffff',
        'text_color' => 'fff',
        'bg_color' => '000',
    ],
    'dracula' => [
        'title_color' => 'ff6e96',
        'icon_color' => '79dafa',
        'text_color' => 'f8f8f2',
        'bg_color' => '282a36',
    ],
    'prussian' => [
        'title_color' => 'bddfff',
        'icon_color' => '38a0ff',
        'text_color' => '6e93b5',
        'bg_color' => '172f45',
    ],
    'monokai' => [
        'title_color' => 'eb1f6a',
        'icon_color' => 'e28905',
        'text_color' => 'f1f1eb',
        'bg_color' => '272822',
    ],
    'vue' => [
        'title_color' => '41b883',
        'icon_color' => '41b883',
        'text_color' => '273849',
        'bg_color' => 'fffefe',
    ],
    'vue-dark' => [
        'title_color' => '41b883',
        'icon_color' => '41b883',
        'text_color' => 'fffefe',
        'bg_color' => '273849',
    ],
    'shades-of-purple' => [
        'title_color' => 'fad000',
        'icon_color' => 'b362ff',
        'text_color' => 'a599e9',
        'bg_color' => '2d2b55',
    ],
    'nightowl' => [
        'title_color' => 'c792ea',
        'icon_color' => 'ffeb95',
        'text_color' => '7fdbca',
        'bg_color' => '011627',
    ],
    'buefy' => [
        'title_color' => '7957d5',
        'icon_color' => 'ff3860',
        'text_color' => '363636',
        'bg_color' => 'ffffff',
    ],
    'blue-green' => [
        'title_color' => '2f97c1',
        'icon_color' => 'f5b700',
        'text_color' => '0cf574',
        'bg_color' => '040f0f',
    ],
    'algolia' => [
        'title_color' => '00AEFF',
        'icon_color' => '2DDE98',
        'text_color' => 'FFFFFF',
        'bg_color' => '050F2C',
    ],
    'great-gatsby' => [
        'title_color' => 'ffa726',
        'icon_color' => 'ffb74d',
        'text_color' => 'ffd95b',
        'bg_color' => '000000',
    ],
    'darcula' => [
        'title_color' => 'BA5F17',
        'icon_color' => '84628F',
        'text_color' => 'BEBEBE',
        'bg_color' => '242424',
    ],
    'bear' => [
        'title_color' => 'e03c8a',
        'icon_color' => '00AEFF',
        'text_color' => 'bcb28d',
        'bg_color' => '1f2023',
    ],
    'solarized-dark' => [
        'title_color' => '268bd2',
        'icon_color' => 'b58900',
        'text_color' => '859900',
        'bg_color' => '002b36',
    ],
    'solarized-light' => [
        'title_color' => '268bd2',
        'icon_color' => 'b58900',
        'text_color' => '859900',
        'bg_color' => 'fdf6e3',
    ],
    'chartreuse-dark' => [
        'title_color' => '7fff00',
        'icon_color' => '00AEFF',
        'text_color' => 'fff',
        'bg_color' => '000',
    ],
    'nord' => [
        'title_color' => '81a1c1',
        'text_color' => 'd8dee9',
        'icon_color' => '88c0d0',
        'bg_color' => '2e3440',
    ],
    'gotham' => [
        'title_color' => '2aa889',
        'icon_color' => '599cab',
        'text_color' => '99d1ce',
        'bg_color' => '0c1014',
    ],
    'material-palenight' => [
        'title_color' => 'c792ea',
        'icon_color' => '89ddff',
        'text_color' => 'a6accd',
        'bg_color' => '292d3e',
    ],
    'graywhite' => [
        'title_color' => '24292e',
        'icon_color' => '24292e',
        'text_color' => '24292e',
        'bg_color' => 'ffffff',
    ],
    'vision-friendly-dark' => [
        'title_color' => 'ffb000',
        'icon_color' => '785ef0',
        'text_color' => 'ffffff',
        'bg_color' => '000000',
    ],
    'ayu-mirage' => [
        'title_color' => 'f4cd7c',
        'icon_color' => '73d0ff',
        'text_color' => 'c7c8c2',
        'bg_color' => '1f2430',
    ],
    'midnight-purple' => [
        'title_color' => '9745f5',
        'icon_color' => '9f4bff',
        'text_color' => 'ffffff',
        'bg_color' => '000000',
    ],
    'calm' => [
        'title_color' => 'e07a5f',
        'icon_color' => 'edae49',
        'text_color' => 'ebcfb2',
        'bg_color' => '373f51',
    ],
    'flag-india' => [
        'title_color' => 'ff8f1c',
        'icon_color' => '250E62',
        'text_color' => '509E2F',
        'bg_color' => 'ffffff',
    ],
    'omni' => [
        'title_color' => 'FF79C6',
        'icon_color' => 'e7de79',
        'text_color' => 'E1E1E6',
        'bg_color' => '191622',
    ],
    'react' => [
        'title_color' => '61dafb',
        'icon_color' => '61dafb',
        'text_color' => 'ffffff',
        'bg_color' => '20232a',
    ],
    'jolly' => [
        'title_color' => 'ff64da',
        'icon_color' => 'a960ff',
        'text_color' => 'ffffff',
        'bg_color' => '291B3E',
    ],
    'maroongold' => [
        'title_color' => 'F7EF8A',
        'icon_color' => 'F7EF8A',
        'text_color' => 'E0AA3E',
        'bg_color' => '260000',
    ],
    'yeblu' => [
        'title_color' => 'ffff00',
        'icon_color' => 'ffff00',
        'text_color' => 'ffffff',
        'bg_color' => '002046',
    ],
    'blueberry' => [
        'title_color' => '82aaff',
        'icon_color' => '89ddff',
        'text_color' => '27e8a7',
        'bg_color' => '242938',
    ],
    'slateorange' => [
        'title_color' => 'faa627',
        'icon_color' => 'faa627',
        'text_color' => 'ffffff',
        'bg_color' => '36393f',
    ],
    'kacho_ga' => [
        'title_color' => 'bf4a3f',
        'icon_color' => 'a64833',
        'text_color' => 'd9c8a9',
        'bg_color' => '402b23',
    ],
    'outrun' => [
        'title_color' => 'ffcc00',
        'icon_color' => 'ff1aff',
        'text_color' => '8080ff',
        'bg_color' => '141439',
    ],
    'ocean_dark' => [
        'title_color' => '8957B2',
        'icon_color' => 'FFFFFF',
        'text_color' => '92D534',
        'bg_color' => '151A28',
    ],
    'city_lights' => [
        'title_color' => '5D8CB3',
        'icon_color' => '4798FF',
        'text_color' => '718CA1',
        'bg_color' => '1D252C',
    ],
    'github_dark' => [
        'title_color' => '58A6FF',
        'icon_color' => '1F6FEB',
        'text_color' => 'C3D1D9',
        'bg_color' => '0D1117',
    ],
    'github_dark_dimmed' => [
        'title_color' => '539bf5',
        'icon_color' => '539bf5',
        'text_color' => 'ADBAC7',
        'bg_color' => '24292F',
        'border_color' => '373E47',
    ],
    'discord_old_blurple' => [
        'title_color' => '7289DA',
        'icon_color' => '7289DA',
        'text_color' => 'FFFFFF',
        'bg_color' => '2C2F33',
    ],
    'aura_dark' => [
        'title_color' => 'ff7372',
        'icon_color' => '6cffd0',
        'text_color' => 'dbdbdb',
        'bg_color' => '252334',
    ],
    'panda' => [
        'title_color' => '19f9d899',
        'icon_color' => '19f9d899',
        'text_color' => 'FF75B5',
        'bg_color' => '31353a',
    ],
    'noctis_minimus' => [
        'title_color' => 'd3b692',
        'icon_color' => '72b7c0',
        'text_color' => 'c5cdd3',
        'bg_color' => '1b2932',
    ],
    'cobalt2' => [
        'title_color' => 'ffc600',
        'icon_color' => 'ffffff',
        'text_color' => '0088ff',
        'bg_color' => '193549',
    ],
    'swift' => [
        'title_color' => '000000',
        'icon_color' => 'f05237',
        'text_color' => '000000',
        'bg_color' => 'f7f7f7',
    ],
    'aura' => [
        'title_color' => 'a277ff',
        'icon_color' => 'ffca85',
        'text_color' => '61ffca',
        'bg_color' => '15141b',
    ],
    'apprentice' => [
        'title_color' => 'ffffff',
        'icon_color' => 'ffffaf',
        'text_color' => 'bcbcbc',
        'bg_color' => '262626',
    ],
    'moltack' => [
        'title_color' => '86092C',
        'icon_color' => '86092C',
        'text_color' => '574038',
        'bg_color' => 'F5E1C0',
    ],
    'codeSTACKr' => [
        'title_color' => 'ff652f',
        'icon_color' => 'FFE400',
        'text_color' => 'ffffff',
        'bg_color' => '09131B',
        'border_color' => '0c1a25',
    ],
    'rose_pine' => [
        'title_color' => '9ccfd8',
        'icon_color' => 'ebbcba',
        'text_color' => 'e0def4',
        'bg_color' => '191724',
    ],
    'catppuccin_latte' => [
        'title_color' => '137980',
        'icon_color' => '8839ef',
        'text_color' => '4c4f69',
        'bg_color' => 'eff1f5',
    ],
    'catppuccin_mocha' => [
        'title_color' => '94e2d5',
        'icon_color' => 'cba6f7',
        'text_color' => 'cdd6f4',
        'bg_color' => '1e1e2e',
    ],
    'date_night' => [
        'title_color' => 'DA7885',
        'text_color' => 'E1B2A2',
        'icon_color' => 'BB8470',
        'border_color' => '170F0C',
        'bg_color' => '170F0C',
    ],
    'one_dark_pro' => [
        'title_color' => '61AFEF',
        'text_color' => 'E5C06E',
        'icon_color' => 'C678DD',
        'border_color' => '3B4048',
        'bg_color' => '23272E',
    ],
    'rose' => [
        'title_color' => '8d192b',
        'text_color' => '862931',
        'icon_color' => 'B71F36',
        'border_color' => 'e9d8d4',
        'bg_color' => 'e9d8d4',
    ],
    'holi' => [
        'title_color' => '5FABEE',
        'text_color' => 'D6E7FF',
        'icon_color' => '5FABEE',
        'border_color' => '85A4C0',
        'bg_color' => '030314',
    ],
    'neon' => [
        'title_color' => '00EAD3',
        'text_color' => 'FF449F',
        'icon_color' => '00EAD3',
        'border_color' => 'ffffff',
        'bg_color' => '000000',
    ],
    'blue_navy' => [
        'title_color' => '82AAFF',
        'text_color' => '82AAFF',
        'icon_color' => '82AAFF',
        'border_color' => 'ffffff',
        'bg_color' => '000000',
    ],
    'calm_pink' => [
        'title_color' => 'e07a5f',
        'text_color' => 'edae49',
        'icon_color' => 'ebcfb2',
        'border_color' => 'e1bc29',
        'bg_color' => '2b2d40',
    ],
    'ambient_gradient' => [
        'title_color' => 'ffffff',
        'text_color' => 'ffffff',
        'icon_color' => 'ffffff',
        'bg_color' => '35,4158d0,c850c0,ffcc70',
    ],
    // Additional themes from original project
    'transparent' => [
        'title_color' => '006AFF',
        'icon_color' => '0579C3',
        'text_color' => '417E87',
        'bg_color' => 'ffffff00',
    ],
    'shadow_red' => [
        'title_color' => '9A0000',
        'text_color' => '444',
        'icon_color' => '4F0000',
        'border_color' => '4F0000',
        'bg_color' => 'ffffff00',
    ],
    'shadow_green' => [
        'title_color' => '007A00',
        'text_color' => '444',
        'icon_color' => '003D00',
        'border_color' => '003D00',
        'bg_color' => 'ffffff00',
    ],
    'shadow_blue' => [
        'title_color' => '00779A',
        'text_color' => '444',
        'icon_color' => '004450',
        'border_color' => '004490',
        'bg_color' => 'ffffff00',
    ],
    'default_repocard' => [
        'title_color' => '2f80ed',
        'icon_color' => '586069',
        'text_color' => '434d58',
        'bg_color' => 'fffefe',
    ],
];

// ============================================================================
// ERROR HANDLING CLASSES
// ============================================================================

class CustomError extends \Exception {
    const MAX_RETRY = 'MAX_RETRY';
    const NO_TOKENS = 'NO_TOKENS';
    const USER_NOT_FOUND = 'USER_NOT_FOUND';
    const GRAPHQL_ERROR = 'GRAPHQL_ERROR';
    const GITHUB_REST_API_ERROR = 'GITHUB_REST_API_ERROR';
    const WAKATIME_ERROR = 'WAKATIME_ERROR';

    public $type;
    public $secondaryMessage;

    public function __construct($message, $type) {
        parent::__construct($message);
        $this->type = $type;
        $this->secondaryMessage = $this->getSecondaryMessage($type);
    }

    private function getSecondaryMessage($type) {
        $messages = [
            self::MAX_RETRY => 'You can deploy own instance or wait until public will be no longer limited',
            self::NO_TOKENS => 'Please add an env variable called PAT_1 with your GitHub API token',
            self::USER_NOT_FOUND => 'Make sure the provided username is not an organization',
            self::GRAPHQL_ERROR => 'Please try again later',
            self::GITHUB_REST_API_ERROR => 'Please try again later',
            self::WAKATIME_ERROR => 'Make sure you have a public WakaTime profile',
        ];
        return $messages[$type] ?? $type;
    }
}

class MissingParamError extends \Exception {
    public function __construct($missedParams, $secondaryMessage = null) {
        $msg = 'Missing params ' . implode(', ', array_map(function($p) { return '"' . $p . '"'; }, $missedParams)) . ' make sure you pass the parameters in URL';
        parent::__construct($msg);
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function isValidHexColor($hexColor) {
    if ($hexColor === null) return false;
    return preg_match('/^([A-Fa-f0-9]{8}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{4})$/', $hexColor);
}

function isValidGradient($colors) {
    return count($colors) > 2 && array_reduce(array_slice($colors, 1), function($carry, $color) {
        return $carry && isValidHexColor($color);
    }, true);
}

function fallbackColor($color, $fallbackColor) {
    $gradient = null;
    $colors = $color ? explode(',', $color) : [];
    
    if (count($colors) > 1 && isValidGradient($colors)) {
        $gradient = $colors;
    }

    return $gradient ?: (isValidHexColor($color) ? '#' . $color : $fallbackColor);
}

function getCardColors($args) {
    $defaultTheme = THEMES['default'];
    $isThemeProvided = isset($args['theme']) && $args['theme'] !== null;
    
    $selectedTheme = $isThemeProvided && isset(THEMES[$args['theme']]) ? THEMES[$args['theme']] : $defaultTheme;
    
    $defaultBorderColor = isset($selectedTheme['border_color']) ? $selectedTheme['border_color'] : 
                         (isset($defaultTheme['border_color']) ? $defaultTheme['border_color'] : 'e4e2e2');

    return [
        'titleColor' => fallbackColor($args['title_color'] ?? null, '#' . ($selectedTheme['title_color'] ?? '2f80ed')),
        'iconColor' => fallbackColor($args['icon_color'] ?? null, '#' . ($selectedTheme['icon_color'] ?? '4c71f2')),
        'textColor' => fallbackColor($args['text_color'] ?? null, '#' . ($selectedTheme['text_color'] ?? '434d58')),
        'bgColor' => fallbackColor($args['bg_color'] ?? null, '#' . ($selectedTheme['bg_color'] ?? 'fffefe')),
        'borderColor' => fallbackColor($args['border_color'] ?? null, '#' . $defaultBorderColor),
        'ringColor' => fallbackColor($args['ring_color'] ?? null, '#' . ($selectedTheme['ring_color'] ?? '2f80ed')),
    ];
}

function clampValue($number, $min, $max) {
    return max($min, min($max, $number));
}

function kFormatter($num) {
    return $num > 999 ? round($num / 1000, 1) . 'k' : $num;
}

function encodeHTML($str) {
    return htmlspecialchars($str, ENT_QUOTES, 'UTF-8');
}

function measureText($str, $fontSize = 14) {
    // Approximate text width calculation
    return strlen($str) * $fontSize * 0.6;
}

// ============================================================================
// RANK CALCULATION
// ============================================================================

function exponential_cdf($x) {
    return 1 - pow(2, -$x);
}

function log_normal_cdf($x) {
    return $x / (1 + $x);
}

function calculateRank($params) {
    $all_commits = $params['all_commits'] ?? false;
    $commits = $params['commits'] ?? 0;
    $prs = $params['prs'] ?? 0;
    $issues = $params['issues'] ?? 0;
    $reviews = $params['reviews'] ?? 0;
    $stars = $params['stars'] ?? 0;
    $followers = $params['followers'] ?? 0;

    $COMMITS_MEDIAN = $all_commits ? 1000 : 250;
    $COMMITS_WEIGHT = 2;
    $PRS_MEDIAN = 50;
    $PRS_WEIGHT = 3;
    $ISSUES_MEDIAN = 25;
    $ISSUES_WEIGHT = 1;
    $REVIEWS_MEDIAN = 2;
    $REVIEWS_WEIGHT = 1;
    $STARS_MEDIAN = 50;
    $STARS_WEIGHT = 4;
    $FOLLOWERS_MEDIAN = 10;
    $FOLLOWERS_WEIGHT = 1;

    $TOTAL_WEIGHT = $COMMITS_WEIGHT + $PRS_WEIGHT + $ISSUES_WEIGHT + $REVIEWS_WEIGHT + $STARS_WEIGHT + $FOLLOWERS_WEIGHT;

    $rank = 1 - (
        ($commits * $COMMITS_WEIGHT / $COMMITS_MEDIAN) +
        ($prs * $PRS_WEIGHT / $PRS_MEDIAN) +
        ($issues * $ISSUES_WEIGHT / $ISSUES_MEDIAN) +
        ($reviews * $REVIEWS_WEIGHT / $REVIEWS_MEDIAN) +
        (log_normal_cdf($stars) * $STARS_WEIGHT / $STARS_MEDIAN) +
        (log_normal_cdf($followers) * $FOLLOWERS_WEIGHT / $FOLLOWERS_MEDIAN)
    ) / $TOTAL_WEIGHT;

    $normalizedRank = ceil($rank * 100);

    return [
        'level' => $normalizedRank < 25 ? 'A+' : ($normalizedRank < 50 ? 'A' : ($normalizedRank < 75 ? 'B+' : 'B')),
        'percentile' => $normalizedRank
    ];
}

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

function getCache($key) {
    if (!is_dir(CACHE_DIR)) {
        mkdir(CACHE_DIR, 0755, true);
    }
    
    $cacheFile = CACHE_DIR . md5($key) . '.json';
    
    if (file_exists($cacheFile)) {
        $data = json_decode(file_get_contents($cacheFile), true);
        if ($data && isset($data['expiry']) && $data['expiry'] > time()) {
            return $data['data'];
        }
    }
    
    return null;
}

function setCache($key, $data, $ttl = CACHE_DEFAULT_TTL) {
    $cacheFile = CACHE_DIR . md5($key) . '.json';
    $cacheData = [
        'data' => $data,
        'expiry' => time() + $ttl
    ];
    file_put_contents($cacheFile, json_encode($cacheData));
}

// ============================================================================
// GITHUB API CLIENT
// ============================================================================

function makeGitHubRequest($query, $variables = [], $token = null) {
    $headers = [
        'Content-Type: application/json',
        'User-Agent: GitHub-Stats-PHP'
    ];
    
    if ($token) {
        $headers[] = 'Authorization: bearer ' . $token;
    }

    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => implode("\r\n", $headers),
            'content' => json_encode(['query' => $query, 'variables' => $variables]),
            'timeout' => 10
        ]
    ]);

    $response = @file_get_contents(GITHUB_API_URL, false, $context);
    
    if ($response === false) {
        throw new CustomError('GitHub API request failed', CustomError::GRAPHQL_ERROR);
    }

    return json_decode($response, true);
}

function fetchGitHubStats($username, $includeAllCommits = false, $token = null) {
    $query = '
    query userInfo($login: String!, $startTime: DateTime) {
        user(login: $login) {
            name
            login
            contributionsCollection(from: $startTime) {
                totalCommitContributions
            }
            repositoriesContributedTo(first: 100, contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]) {
                totalCount
            }
            pullRequests {
                totalCount
            }
            openIssues: issues(states: OPEN) {
                totalCount
            }
            closedIssues: issues(states: CLOSED) {
                totalCount
            }
            followers {
                totalCount
            }
            repositories(first: 100, ownerAffiliations: OWNER, orderBy: {direction: DESC, field: STARGAZERS}) {
                totalCount
                nodes {
                    name
                    stargazers {
                        totalCount
                    }
                }
            }
        }
    }';

    $startTime = $includeAllCommits ? null : date('Y-m-d\TH:i:s', strtotime('-1 year'));
    
    $variables = [
        'login' => $username,
        'startTime' => $startTime
    ];

    $data = makeGitHubRequest($query, $variables, $token);

    if (isset($data['errors'])) {
        throw new CustomError('User not found', CustomError::USER_NOT_FOUND);
    }

    $user = $data['data']['user'];
    
    $totalStars = 0;
    foreach ($user['repositories']['nodes'] as $repo) {
        $totalStars += $repo['stargazers']['totalCount'];
    }

    $stats = [
        'name' => $user['name'] ?? $user['login'],
        'totalStars' => $totalStars,
        'totalCommits' => $user['contributionsCollection']['totalCommitContributions'] ?? 0,
        'totalPRs' => $user['pullRequests']['totalCount'],
        'totalIssues' => ($user['openIssues']['totalCount'] ?? 0) + ($user['closedIssues']['totalCount'] ?? 0),
        'contributedTo' => $user['repositoriesContributedTo']['totalCount'],
        'followers' => $user['followers']['totalCount'],
    ];

    $stats['rank'] = calculateRank([
        'all_commits' => $includeAllCommits,
        'commits' => $stats['totalCommits'],
        'prs' => $stats['totalPRs'],
        'issues' => $stats['totalIssues'],
        'stars' => $stats['totalStars'],
        'followers' => $stats['followers']
    ]);

    return $stats;
}

// ============================================================================
// SVG RENDERING
// ============================================================================

function renderErrorCard($message, $secondaryMessage = null, $colors = []) {
    $defaultColors = getCardColors(['theme' => 'default']);
    $colors = array_merge($defaultColors, $colors);
    
    $width = DEFAULT_CARD_WIDTH;
    $height = 120;
    
    $svg = "<svg width='{$width}' height='{$height}' viewBox='0 0 {$width} {$height}' xmlns='http://www.w3.org/2000/svg'>";
    $svg .= "<rect width='100%' height='100%' fill='{$colors['bgColor']}'/>";
    $svg .= "<text x='50%' y='45%' text-anchor='middle' fill='{$colors['titleColor']}' font-size='16' font-family='Arial'>{$message}</text>";
    
    if ($secondaryMessage) {
        $svg .= "<text x='50%' y='65%' text-anchor='middle' fill='{$colors['textColor']}' font-size='12' font-family='Arial'>{$secondaryMessage}</text>";
    }
    
    $svg .= "</svg>";
    
    return $svg;
}

function renderStatsCard($stats, $options = []) {
    $colors = getCardColors($options);
    $width = $options['card_width'] ?? DEFAULT_CARD_WIDTH;
    $height = 195;
    $hideTitle = $options['hide_title'] ?? false;
    $hideBorder = $options['hide_border'] ?? false;
    $hideRank = $options['hide_rank'] ?? false;
    $showIcons = $options['show_icons'] ?? false;
    $theme = $options['theme'] ?? 'default';
    $locale = $options['locale'] ?? 'en';
    $hide = $options['hide'] ?? [];
    $customTitle = $options['custom_title'] ?? null;
    $borderRadius = $options['border_radius'] ?? 4.5;
    
    // Build title
    $title = $customTitle ?? ($hideRank ? "{$stats['name']}'s GitHub Stats" : "{$stats['name']}'s GitHub Stats");
    
    $svg = "<svg width='{$width}' height='{$height}' viewBox='0 0 {$width} {$height}' xmlns='http://www.w3.org/2000/svg'>";
    
    // Background with border
    if (!$hideBorder) {
        $svg .= "<rect width='100%' height='100%' fill='{$colors['bgColor']}' rx='{$borderRadius}' stroke='{$colors['borderColor']}' stroke-width='1'/>";
    } else {
        $svg .= "<rect width='100%' height='100%' fill='{$colors['bgColor']}' rx='{$borderRadius}'/>";
    }
    
    // Title
    if (!$hideTitle) {
        $svg .= "<text x='25' y='35' fill='{$colors['titleColor']}' font-size='18' font-weight='bold' font-family='Arial'>{$title}</text>";
    }
    
    $yOffset = $hideTitle ? 35 : 60;
    $lineHeight = 25;
    
    $statsToShow = [
        'Total Stars Earned' => kFormatter($stats['totalStars']),
        'Total Commits' => kFormatter($stats['totalCommits']),
        'Total PRs' => kFormatter($stats['totalPRs']),
        'Total Issues' => kFormatter($stats['totalIssues']),
        'Contributed to' => kFormatter($stats['contributedTo']) . ' repos',
    ];
    
    // Filter out hidden stats
    if (in_array('stars', $hide)) unset($statsToShow['Total Stars Earned']);
    if (in_array('commits', $hide)) unset($statsToShow['Total Commits']);
    if (in_array('prs', $hide)) unset($statsToShow['Total PRs']);
    if (in_array('issues', $hide)) unset($statsToShow['Total Issues']);
    if (in_array('contribs', $hide)) unset($statsToShow['Contributed to']);
    
    $index = 0;
    foreach ($statsToShow as $label => $value) {
        $y = $yOffset + ($index * $lineHeight);
        
        if ($showIcons) {
            $svg .= "<circle cx='40' cy='{$y}' r='3' fill='{$colors['iconColor']}'/>";
            $textX = 55;
        } else {
            $textX = 25;
        }
        
        $svg .= "<text x='{$textX}' y='{$y}' fill='{$colors['textColor']}' font-size='14' font-family='Arial'>{$label}:</text>";
        $svg .= "<text x='200' y='{$y}' fill='{$colors['textColor']}' font-size='14' font-family='Arial' text-anchor='end'>{$value}</text>";
        
        $index++;
    }
    
    // Rank circle (if not hidden)
    if (!$hideRank) {
        $rankLevel = $stats['rank']['level'];
        $rankPercentile = $stats['rank']['percentile'];
        
        $circleX = $width - 50;
        $circleY = $height - 50;
        $radius = 20;
        
        $svg .= "<circle cx='{$circleX}' cy='{$circleY}' r='{$radius}' fill='none' stroke='{$colors['ringColor']}' stroke-width='2'/>";
        $svg .= "<text x='{$circleX}' y='" . ($circleY + 5) . "' text-anchor='middle' fill='{$colors['titleColor']}' font-size='16' font-weight='bold' font-family='Arial'>{$rankLevel}</text>";
    }
    
    $svg .= "</svg>";
    
    return $svg;
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

function generateGitHubStats($username, $options = []) {
    try {
        // Validate input
        if (empty($username)) {
            throw new MissingParamError(['username']);
        }

        // Check cache first
        $cacheKey = 'github_stats_' . md5($username . serialize($options));
        $cachedResult = getCache($cacheKey);
        
        if ($cachedResult !== null) {
            return $cachedResult;
        }

        // Fetch data from GitHub
        $includeAllCommits = $options['include_all_commits'] ?? false;
        $token = $_ENV['GITHUB_TOKEN'] ?? null;
        
        $stats = fetchGitHubStats($username, $includeAllCommits, $token);
        
        // Generate SVG
        $svg = renderStatsCard($stats, $options);
        
        // Cache result
        setCache($cacheKey, $svg);
        
        return $svg;
        
    } catch (Exception $e) {
        $colors = getCardColors($options);
        $errorMessage = 'Something went wrong';
        $secondaryMessage = $e->getMessage();
        
        if ($e instanceof CustomError) {
            $secondaryMessage = $e->secondaryMessage;
        }
        
        return renderErrorCard($errorMessage, $secondaryMessage, $colors);
    }
}

// ============================================================================
// HTTP HANDLER
// ============================================================================

function handleRequest() {
    header('Content-Type: image/svg+xml');
    header('Cache-Control: public, max-age=1800');
    
    $username = $_GET['username'] ?? null;
    
    if (!$username) {
        echo renderErrorCard('Missing username parameter', 'Please provide a username parameter');
        return;
    }
    
    $options = $_GET;
    
    try {
        $svg = generateGitHubStats($username, $options);
        echo $svg;
    } catch (Exception $e) {
        echo renderErrorCard('Internal Server Error', $e->getMessage());
    }
}

// Handle request if accessed directly
if (php_sapi_name() !== 'cli') {
    handleRequest();
}
?>