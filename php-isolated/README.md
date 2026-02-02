# GitHub Stats PHP Version

This is a PHP implementation of the GitHub readme stats functionality, isolated in its own folder for easy deployment and testing.

## Features

- ✅ All 70+ themes from the original project
- ✅ SVG card generation for GitHub user statistics
- ✅ Caching system with configurable TTL
- ✅ Error handling with custom exception classes
- ✅ Rank calculation algorithm
- ✅ Parameter validation and sanitization
- ✅ Theme support with color gradients
- ✅ No external dependencies (pure PHP)

## Quick Start

### 1. Using PHP Built-in Server

```bash
cd php-isolated
php -S localhost:8080
```

Then visit: http://localhost:8080/github-stats.php?username=yourusername

### 2. Using a Real GitHub Token (Optional)

Set the `GITHUB_TOKEN` environment variable for better rate limits:

```bash
export GITHUB_TOKEN=your_github_personal_access_token
php -S localhost:8080
```

### 3. Testing Without Server

```bash
cd php-isolated
php test.php
```

## Usage Examples

### Basic Usage
```
/github-stats.php?username=octocat
```

### With Theme
```
/github-stats.php?username=octocat&theme=dark
```

### Hide Specific Stats
```
/github-stats.php?username=octocat&hide=stars,commits
```

### Custom Colors
```
/github-stats.php?username=octocat&title_color=ff0000&bg_color=000000
```

### Include All Commits (All Time)
```
/github-stats.php?username=octocat&include_all_commits=true
```

## Available Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `username` | GitHub username (required) | - |
| `theme` | Theme name | `default` |
| `hide` | Comma-separated list of stats to hide | - |
| `hide_title` | Hide the card title | `false` |
| `hide_border` | Hide the card border | `false` |
| `hide_rank` | Hide the rank circle | `false` |
| `show_icons` | Show icons next to stats | `false` |
| `include_all_commits` | Include all-time commits | `false` |
| `card_width` | Card width in pixels | `287` |
| `title_color` | Title color (hex) | Theme default |
| `text_color` | Text color (hex) | Theme default |
| `icon_color` | Icon color (hex) | Theme default |
| `bg_color` | Background color (hex) | Theme default |
| `border_color` | Border color (hex) | Theme default |
| `ring_color` | Rank ring color (hex) | Theme default |
| `border_radius` | Border radius | `4.5` |

## Available Themes

All themes from the original project are supported:

- `default`, `dark`, `radical`, `merko`, `gruvbox`, `gruvbox_light`
- `tokyonight`, `onedark`, `cobalt`, `synthwave`, `highcontrast`, `dracula`
- `prussian`, `monokai`, `vue`, `vue-dark`, `shades-of-purple`, `nightowl`
- `buefy`, `blue-green`, `algolia`, `great-gatsby`, `darcula`, `bear`
- `solarized-dark`, `solarized-light`, `chartreuse-dark`, `nord`, `gotham`
- `material-palenight`, `graywhite`, `vision-friendly-dark`, `ayu-mirage`
- `midnight-purple`, `calm`, `flag-india`, `omni`, `react`, `jolly`
- `maroongold`, `yeblu`, `blueberry`, `slateorange`, `kacho_ga`, `outrun`
- `ocean_dark`, `city_lights`, `github_dark`, `github_dark_dimmed`
- `discord_old_blurple`, `aura_dark`, `panda`, `noctis_minimus`, `cobalt2`
- `swift`, `aura`, `apprentice`, `moltack`, `codeSTACKr`, `rose_pine`
- `catppuccin_latte`, `catppuccin_mocha`, `date_night`, `one_dark_pro`
- `rose`, `holi`, `neon`, `blue_navy`, `calm_pink`, `ambient_gradient`
- And many more...

## Testing

Run the test suite:

```bash
cd php-isolated
php test.php
```

This will test:
- ✅ PHP syntax validation
- ✅ Theme loading
- ✅ Utility functions
- ✅ Error card rendering
- ✅ Cache functionality
- ✅ Rank calculation

## Deployment

### Apache/Nginx

1. Copy the `php-isolated` folder to your web server
2. Ensure the `cache` directory is writable by the web server
3. Access via: `http://yourdomain.com/php-isolated/github-stats.php?username=octocat`

### Docker

```dockerfile
FROM php:8.0-apache
COPY php-isolated/ /var/www/html/
RUN mkdir -p /var/www/html/cache && chmod 755 /var/www/html/cache
```

### Environment Variables

- `GITHUB_TOKEN`: GitHub personal access token for better rate limits

## Differences from Node.js Version

This PHP version maintains feature parity with the original Node.js implementation:

- ✅ Same theme definitions and color schemes
- ✅ Identical rank calculation algorithm
- ✅ Same SVG output format
- ✅ Similar error handling patterns
- ✅ Compatible query parameter API

## Troubleshooting

### Common Issues

1. **Cache directory not writable**
   ```bash
   chmod 755 cache
   ```

2. **GitHub API rate limits**
   - Set a `GITHUB_TOKEN` environment variable
   - Use a personal access token from GitHub

3. **PHP version compatibility**
   - Requires PHP 7.4 or higher
   - Tested on PHP 8.0+

### Debug Mode

Add debug output by modifying the error handling in `github-stats.php`.

## Security Notes

- Input parameters are sanitized and validated
- No direct file system access beyond cache directory
- GitHub token is optional (for better rate limits)
- Cache files are stored with hashed names

## License

Same as the original project - MIT License