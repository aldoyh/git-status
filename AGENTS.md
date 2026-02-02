# AGENTS.md - GitHub Readme Stats Development Guide

This document provides essential information for agents working in this repository.

## Project Overview

**github-readme-stats** is a service that dynamically generates GitHub stats cards (SVG) for README files. It runs as serverless functions on Vercel and uses GitHub GraphQL API to fetch user statistics, then renders them as customizable SVG cards.

### Key Technologies
- **Runtime**: Node.js 22+ (ES modules)
- **Framework**: Express.js (for local development)
- **Deployment**: Vercel (serverless functions)
- **API**: GitHub GraphQL API
- **Testing**: Jest
- **Code Quality**: ESLint (flat config), Prettier

## Essential Commands

### Setup & Installation
```bash
nvm use 22                      # Use Node.js 22 (see .nvmrc)
npm install                     # Install dependencies
```

### Development & Testing
```bash
npm test                        # Run all unit tests with coverage
npm run test:watch            # Run tests in watch mode
npm run test:update:snapshot   # Update Jest snapshots
npm run test:e2e              # Run end-to-end tests
npm run bench                 # Run benchmark tests
npm run format                # Format code with Prettier
npm run format:check          # Check Prettier formatting
npm run lint                  # Run ESLint (max-warnings=0, strict)
```

### Build & Deployment
```bash
vercel dev                    # Start local dev server (requires Vercel CLI)
vercel                        # Deploy to Vercel
```

### Utilities & Scripts
```bash
npm run theme-readme-gen           # Generate theme documentation
npm run preview-theme              # Preview themes
npm run close-stale-theme-prs      # Close stale theme PRs
npm run generate-langs-json        # Generate language colors JSON
```

## Code Organization

### Directory Structure

```
src/
├── index.js              # Main export barrel
├── cards/                # Card render functions
│   ├── stats.js         # GitHub stats card renderer
│   ├── repo.js          # Repository card renderer
│   ├── top-languages.js # Language stats card renderer
│   ├── gist.js          # Gist card renderer
│   ├── wakatime.js      # WakaTime card renderer
│   └── types.d.ts       # TypeScript type definitions
├── fetchers/             # Data fetching logic
│   ├── stats.js         # GitHub user stats fetcher
│   ├── repo.js          # Repository info fetcher
│   ├── top-languages.js # Language stats fetcher
│   ├── gist.js          # Gist stats fetcher
│   ├── wakatime.js      # WakaTime API fetcher
│   └── types.d.ts       # Fetcher type definitions
├── common/               # Shared utilities
│   ├── Card.js          # Base Card class (SVG rendering)
│   ├── I18n.js          # Internationalization
│   ├── access.js        # Access control & validation
│   ├── blacklist.js     # User blacklist management
│   ├── cache.js         # Caching utilities
│   ├── color.js         # Color parsing & theme handling
│   ├── error.js         # Error classes (CustomError, MissingParamError)
│   ├── fmt.js           # Text formatting utilities
│   ├── html.js          # HTML encoding
│   ├── http.js          # HTTP request wrapper
│   ├── icons.js         # SVG icons
│   ├── ops.js           # Operations (parseArray, parseBoolean, etc.)
│   ├── render.js        # SVG rendering helpers (flexLayout, etc.)
│   ├── retryer.js       # Retry logic for API calls
│   ├── log.js           # Logging utilities
│   ├── envs.js          # Environment variable management
│   ├── languageColors.json # Color mappings for programming languages
│   └── index.js         # Common utilities barrel export
├── calculateRank.js      # Rank calculation algorithm
└── translations.js       # i18n translations & locale strings

api/
├── index.js             # Stats endpoint handler
├── pin.js               # Repository pin endpoint handler
├── top-langs.js         # Top languages endpoint handler
├── gist.js              # Gist endpoint handler
├── wakatime.js          # WakaTime endpoint handler
└── status/
    ├── up.js            # Service status checker
    └── pat-info.js      # PAT (Personal Access Token) info endpoint

tests/
├── *.test.js            # Unit tests (one per src module)
├── e2e/                 # End-to-end tests
├── bench/               # Benchmark tests
└── __snapshots__/       # Jest snapshot files

express.js              # Local Express server for development
vercel.json             # Vercel deployment config
```

### Key Architectural Patterns

#### 1. **Card System**
- Each card type has:
  - **Fetcher** (`src/fetchers/*.js`) - Retrieves data from GitHub/external APIs
  - **Renderer** (`src/cards/*.js`) - Converts data to SVG
  - **API Handler** (`api/*.js`) - Express route handler with parameter validation

Example flow: API request → Parameter validation → Fetcher (with retry) → Renderer → SVG response

#### 2. **Base Card Class**
The `Card` class (`src/common/Card.js`) is the foundation for all SVG rendering:
- Manages dimensions, colors, padding, border radius
- Provides `getAnimations()` and `render()` methods
- Handles CSS injection and accessibility attributes

#### 3. **Error Handling**
- `CustomError` - For known errors with secondary messages (GraphQL errors, missing PAT, etc.)
- `MissingParamError` - For missing URL query parameters
- All errors render user-friendly SVG error cards

#### 4. **Caching Strategy**
- Cached response headers set via `setCacheHeaders()` and `setErrorCacheHeaders()`
- Cache TTL controlled via `cache_seconds` query parameter or `CACHE_TTL` constant
- Environment variable: `NODE_ENV=development` disables caching locally

#### 5. **Internationalization**
- Locales defined in `src/translations.js`
- Card labels/titles translated per locale
- `I18n` class handles locale validation and string lookups
- Supports RTL detection where needed

## Code Conventions & Patterns

### JavaScript Style
- **Module system**: ES modules only (`import`/`export`)
- **JSDoc comments**: Mandatory for functions (see eslint rule in `eslint.config.mjs`)
- **Type annotations**: JSDoc `@ts-check` at file top, inline `@type` annotations
- **Naming**: camelCase for variables/functions, snake_case for query parameters
- **Formatting**: Prettier (trailingComma=all, no tabs, auto line endings)

### Parameter Handling
Query parameters follow snake_case pattern (e.g., `card_width`, `hide_title`, `text_color`). Parameters are parsed and validated in API handlers:
```javascript
const { username, hide, theme, cache_seconds } = req.query;
```

### Error Handling Pattern
Always validate before processing:
```javascript
const access = guardAccess({ res, id: username, type: "username", colors: {...} });
if (!access.isPassed) {
  return access.result;  // Returns error response
}
```

### Retry Logic
Sensitive to rate limiting. Use `retryer()` for API calls that might fail:
```javascript
import { retryer } from "../common/retryer.js";
const result = await retryer(fetcher, [...args]);
```

### SVG Rendering
Cards render SVG using the `Card` class methods. Utilities like `flexLayout()` and `measureText()` handle positioning:
```javascript
const card = new Card({ width, height, colors: {...} });
card.render();
```

## Testing Conventions

### Test Structure
- **Unit tests** are co-located with modules they test (e.g., `tests/stats.test.js` for `src/fetchers/stats.js`)
- **Mocking**: Use `axios-mock-adapter` for HTTP requests, `jest.mock()` for modules
- **Snapshots**: Used for SVG output validation (see `tests/__snapshots__/`)

### Example Pattern
```javascript
import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

describe("Module", () => {
  let mockAxios;
  
  beforeEach(() => {
    mockAxios = new MockAdapter(axios);
  });
  
  afterEach(() => {
    mockAxios.reset();
  });
  
  it("does something", async () => {
    // Test implementation
  });
});
```

### Test Coverage
- All changes should include tests
- Run `npm test` to verify coverage
- Snapshot tests update with `npm run test:update:snapshot`

## Important Non-Obvious Patterns & Gotchas

### 1. **Token Management**
- Multiple tokens supported via `PAT_1`, `PAT_2`, etc. environment variables
- Token rotation happens automatically when rate limits are hit
- Missing tokens trigger `CustomError.NO_TOKENS` error

### 2. **GitHub GraphQL Pagination**
- Some queries are paginated (e.g., repository list fetching)
- Use `after` cursor for pagination; see `GRAPHQL_REPOS_QUERY` in `src/fetchers/stats.js`
- The fetcher handles pagination internally

### 3. **Cache Header Behavior**
- Local development (`NODE_ENV=development`) always disables caching
- Production cache TTL is configurable per request via `cache_seconds` parameter
- Error responses get shorter cache TTL (see `setErrorCacheHeaders()`)

### 4. **Language Colors**
- Language colors come from `src/common/languageColors.json`
- User-provided colors via URL parameters override defaults
- Theme colors support gradient via pipe separator (e.g., `bg_color=bg1|bg2`)

### 5. **Rank Calculation**
- Rank algorithm in `src/calculateRank.js` is complex; don't modify without understanding percentile math
- Rank includes commits, PRs, reviews, issues, stars, repos, followers
- Optional: `include_all_commits` flag includes all-time commits vs. 1-year window

### 6. **SVG Rendering Constraints**
- Cards have minimum/maximum widths (see `CARD_MIN_WIDTH`, `CARD_DEFAULT_WIDTH` in card renderers)
- Text overflow handled via `measureText()` and `wrapTextMultiline()`
- Animations defined in CSS within the SVG (not JS)

### 7. **Locale Length Handling**
- Long locales (like German, Russian) need extra card width to fit text
- See `LONG_LOCALES` array in `src/cards/stats.js` for examples
- Auto-expand card width if needed

### 8. **Vercel Constraints**
- Serverless functions have 10-second timeout (see `vercel.json`)
- Memory limit: 128MB per function
- GraphQL queries must be optimized to complete within timeout

### 9. **Type Definitions**
- TypeScript definitions in `src/fetchers/types.d.ts` and `src/cards/types.d.ts`
- Used for IDE autocomplete in `.test.js` files; full runtime is still vanilla JS

### 10. **Theme System**
- Themes are defined in `themes/` directory (mostly paused per CONTRIBUTING.md)
- Theme colors can be customized via URL parameters with highest priority
- See `getCardColors()` in `src/common/color.js` for color resolution order

## Development Workflow

### Making Changes
1. **Read first**: Always read the entire file before editing
2. **Test driven**: Write/update tests first when possible
3. **Run tests**: `npm test` after changes
4. **Lint & format**: `npm run lint` and `npm run format` must pass
5. **Check CI**: All checks must pass on pull request

### Adding a New Card Type
1. Create `src/fetchers/newcard.js` - fetches data
2. Create `src/cards/newcard.js` - renders SVG
3. Create `api/newcard.js` - Express route handler
4. Add route to `express.js` for local testing
5. Add comprehensive tests
6. Update `src/cards/index.js` and `src/fetchers/index.js` exports
7. Update documentation

### Adding New Language/Locale
1. Edit `src/translations.js`
2. Add translations for all card types (statCardLocales, langCardLocales, etc.)
3. Run `npm test` to verify no syntax errors
4. Update readme.md with new locale code

## Environment Variables

Required for deployment:
- `PAT_1`, `PAT_2`, ... - GitHub Personal Access Tokens (for API rate limiting)
- `WAKATIME_API_KEY` - WakaTime API key (optional, for WakaTime cards)
- `NODE_ENV=development` - Disables caching for local testing

## Git & CI/CD

### Branch & PR Guidelines
- Base branch: `master`
- CI checks (from `.github/workflows/test.yml`):
  - Unit tests (`npm test`)
  - ESLint (`npm run lint`) - max-warnings=0, strict
  - Benchmark tests (`npm run bench`)
  - Prettier check (`npm run format:check`)
- All checks must pass before merging
- Theme PR additions are paused per CONTRIBUTING.md

### Husky Pre-commit Hook
- Configured via `.husky/pre-commit`
- Runs Prettier on staged `.{js,css,md}` files
- Must pass before commit

## Performance Considerations

- **API calls**: Minimize GraphQL queries; batch where possible
- **SVG rendering**: Cache card calculations when possible
- **Images**: SVG only; no external image dependencies
- **Bundle size**: Not a concern (serverless context)
- **Memory**: 128MB limit; avoid loading large datasets in memory

## Useful Resources

- **GitHub GraphQL API**: https://docs.github.com/en/graphql
- **Vercel Docs**: https://vercel.com/docs/serverless-functions/overview
- **WakaTime API**: https://wakatime.com/developers
- **Project in-depth analysis**: https://codecrumbs.io/library/github-readme-stats (by Bogdan-Lyashenko)

## Common Debugging Tips

1. **Local development**: Run `vercel dev` after `npm install`
2. **View logs**: Check Vercel deployment logs for production errors
3. **GraphQL errors**: Use `logger` from `src/common/log.js` to debug API calls
4. **SVG rendering**: Inspect the returned SVG in browser DevTools
5. **Cache issues**: Add `?cache_seconds=0` to bypass cache during testing
