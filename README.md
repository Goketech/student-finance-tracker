# Student Finance Tracker

A responsive, accessible web application for tracking student expenses with advanced regex search, multi-currency support, and comprehensive budget management.

## Live Demo
[GitHub Pages URL]

## Features
- ✅ Add, edit, delete transactions
- ✅ Real-time regex search with pattern highlighting
- ✅ Multi-currency support (USD, EUR, GBP) with live conversion
- ✅ Budget cap with live notifications and progress bar
- ✅ Sortable data table with visual sort indicators
- ✅ Dashboard with statistics and 7-day trend chart
- ✅ Smart JSON import with duplicate detection
- ✅ CSV Export functionality
- ✅ Light/Dark theme toggle
- ✅ Toast notifications (success, warning, error)
- ✅ Offline-first with Service Worker
- ✅ Full keyboard accessibility
- ✅ Responsive mobile-first design

## Regex Catalog

### Validation Patterns
1. **Description**: `/^\S(?:.*\S)?$/` - No leading/trailing spaces
2. **Amount**: `/^(0|[1-9]\d*)(\.\d{1,2})?$/` - Valid decimal (max 2 places)
3. **Date**: `/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/` - YYYY-MM-DD format
4. **Category**: `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/` - Letters, spaces, hyphens

### Advanced Patterns
5. **Duplicate Words**: `/\b(\w+)\s+\1\b/i` - Back-reference to catch duplicates
6. **Currency Detection**: `/(?=.*\d)(?=.*[.,]\d{2})\d+[.,]\d{2}/` - Lookahead for currency patterns

### Search Patterns
7. **Cents Filter**: `/\.\d{2}\b/` - Transactions with exact cents
8. **Beverage Keywords**: `/(coffee|tea|juice|soda)/i` - Beverage-related expenses

## Keyboard Navigation
- **Tab / Shift+Tab**: Navigate through interactive elements
- **Enter / Space**: Activate buttons and links
- **Escape**: Close modals, cancel operations
- **Arrow Keys**: Navigate table rows (when focused)

## Accessibility Features
- Semantic HTML5 landmarks and headings
- ARIA live regions for dynamic updates
- Skip-to-content link
- Visible focus indicators
- Proper label associations
- Color contrast: WCAG AA compliant
- Screen reader tested

## Setup & Installation
1. Clone repository
2. Serve files using a local server (e.g., Live Server in VS Code)
3. Open `http://localhost:5500` or your server URL
4. Optional: Import `seed.json` or `sample-import.json` for sample data

## Quick Start
1. Add your first transaction using the form
2. Try the regex search feature
3. Switch between currencies to see live conversion
4. Set a budget cap to track spending
5. Import sample data to explore features

## Technologies
- **Frontend**: Vanilla JavaScript (ES6 modules)
- **Styling**: CSS3 (Flexbox, Grid, Custom Properties, Animations)
- **Markup**: HTML5 (Semantic markup, ARIA attributes)
- **Storage**: LocalStorage API for data persistence
- **Offline**: Service Worker API for offline functionality
- **Currency**: Intl.NumberFormat for currency formatting
- **Charts**: Custom SVG-based chart generation

## Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Project Structure
```
student-finance-tracker/
├── index.html              # Main application entry point
├── styles/
│   ├── main.css           # Core styles and components
│   ├── layout.css         # Responsive layout and mobile styles
│   └── theme.css          # Light/dark theme variables
├── scripts/
│   ├── main.js            # Application initialization and event handling
│   ├── state.js           # State management and data operations
│   ├── ui.js              # UI rendering and toast notifications
│   ├── storage.js         # LocalStorage operations and data persistence
│   ├── validators.js      # Form validation and input sanitization
│   ├── search.js          # Regex search functionality
│   ├── stats.js           # Statistics calculations and chart generation
│   └── currency.js        # Currency conversion and formatting
├── assets/
│   └── icons/             # Icon assets (if any)
├── seed.json              # Sample data with 15 transactions
├── sample-import.json     # Simple sample data with 5 transactions
└── sw.js                  # Service Worker for offline functionality
```

## Key Features Explained

### Multi-Currency Support
- All transactions stored in USD (base currency)
- Live conversion to EUR, GBP based on exchange rates
- Customizable exchange rates in Settings
- Real-time amount conversion in all views

### Smart Import System
- Merges imported data with existing transactions
- Automatic duplicate detection by transaction ID
- Visual feedback with colored toast notifications
- Supports both individual and bulk imports

### Advanced Search
- Regex pattern matching across all fields
- Case-sensitive toggle option
- Real-time filtering as you type
- Pattern examples provided in UI

### Responsive Design
- Mobile-first approach with card layout
- Desktop table view with sort indicators
- Touch-friendly buttons and inputs
- Accessible navigation patterns

## License
Academic Project - Student Finance Tracker © 2025
