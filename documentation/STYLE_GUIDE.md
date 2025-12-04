# Agent Dashboard Style Guide
*Based on spy/command-center aesthetic with terminal interface design*

---

## Table of Contents
1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Layout & Spacing](#layout--spacing)
4. [Component Library](#component-library)
5. [Visual Effects & Animations](#visual-effects--animations)
6. [Iconography & Graphics](#iconography--graphics)
7. [Data Visualization](#data-visualization)
8. [Interaction Patterns](#interaction-patterns)

---

## Color Palette

### Background Colors
```css
--bg-primary: #0a0a0a;           /* Main background - deep black */
--bg-secondary: #131313;          /* Card/panel background - slightly lighter black */
--bg-tertiary: #1a1a1a;           /* Elevated elements */
--bg-overlay: rgba(0, 0, 0, 0.9); /* Modal/overlay background */
```

### Text Colors
```css
--text-primary: #e8e8e8;          /* Main content text - off-white */
--text-secondary: #8a8a8a;        /* Secondary text - medium gray */
--text-tertiary: #5a5a5a;         /* Tertiary/disabled text - dark gray */
--text-dim: #3a3a3a;              /* Heavily dimmed text */
--text-highlight: #ffffff;        /* Emphasized text - pure white */
```

### Accent Colors
```css
--accent-primary: #00d9ff;        /* Cyan - primary interactive elements */
--accent-secondary: #00b8d4;      /* Darker cyan - hover states */
--accent-glow: rgba(0, 217, 255, 0.3); /* Cyan glow effect */
```

### Status Colors
```css
--status-success: #00ff88;        /* Bright green - completed/active */
--status-warning: #ffaa00;        /* Orange - warnings */
--status-error: #ff4444;          /* Red - errors/failed */
--status-info: #00d9ff;           /* Cyan - information */
--status-neutral: #666666;        /* Gray - inactive/neutral */
```

### Border Colors
```css
--border-primary: #2a2a2a;        /* Main borders - subtle gray */
--border-secondary: #1f1f1f;      /* Lighter borders */
--border-accent: #00d9ff;         /* Highlighted borders - cyan */
--border-dim: #151515;            /* Very subtle borders */
```

### Wireframe/Graphics Colors
```css
--wireframe-primary: #00d9ff;     /* Main wireframe lines - cyan */
--wireframe-secondary: rgba(0, 217, 255, 0.4); /* Secondary wireframe - transparent cyan */
--wireframe-grid: rgba(0, 217, 255, 0.15);     /* Grid lines - very transparent */
```

---

## Typography

### Font Families
```css
--font-mono: 'Courier New', 'Consolas', 'Monaco', 'Andale Mono', monospace;
--font-display: 'Courier New', monospace; /* For headers and important text */
--font-body: 'Courier New', monospace;    /* For body text */
```

**Note**: The entire interface uses monospace fonts to achieve the terminal/command-center aesthetic. Consider using specialized terminal fonts like:
- `'Fira Code'` (with ligatures disabled)
- `'JetBrains Mono'`
- `'IBM Plex Mono'`
- `'Source Code Pro'`

### Font Sizes
```css
--text-xs: 0.65rem;    /* 10.4px - timestamps, metadata */
--text-sm: 0.75rem;    /* 12px - secondary text */
--text-base: 0.875rem; /* 14px - body text */
--text-lg: 1rem;       /* 16px - emphasized body */
--text-xl: 1.125rem;   /* 18px - section headers */
--text-2xl: 1.5rem;    /* 24px - card titles */
--text-3xl: 2rem;      /* 32px - large numbers/stats */
--text-4xl: 3rem;      /* 48px - hero numbers */
```

### Font Weights
```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

**Usage**:
- Headers: `font-weight: 600-700` (semibold to bold)
- Body text: `font-weight: 400` (normal)
- De-emphasized text: `font-weight: 300` (light)

### Line Heights
```css
--leading-tight: 1.2;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
--leading-loose: 2;
```

### Letter Spacing
```css
--tracking-tighter: -0.05em;
--tracking-tight: -0.025em;
--tracking-normal: 0;
--tracking-wide: 0.025em;
--tracking-wider: 0.05em;
--tracking-widest: 0.1em;
```

**Usage**:
- Headers (especially uppercase): `letter-spacing: 0.05em` to `0.1em`
- Body text: `letter-spacing: 0`
- Large numbers/stats: `letter-spacing: -0.025em`

### Text Transformations
```css
.text-uppercase {
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.text-lowercase {
  text-transform: lowercase;
}

.text-capitalize {
  text-transform: capitalize;
}
```

**Usage Pattern**:
- **Section headers**: UPPERCASE with wide letter-spacing
- **Labels**: UPPERCASE
- **Body content**: Mixed case (normal capitalization)
- **Timestamps**: Uppercase for date, normal for time

---

## Layout & Spacing

### Container Widths
```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;
--container-full: 100%;
```

### Spacing Scale
```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

### Grid System
The interface uses a **flexible grid layout** with clearly defined sections:

```css
.dashboard-grid {
  display: grid;
  grid-template-columns: 350px 1fr 400px;
  grid-template-rows: 80px 1fr;
  gap: 1px; /* Minimal gap, borders create visual separation */
  min-height: 100vh;
  background: var(--bg-primary);
}

.header {
  grid-column: 1 / -1;
  grid-row: 1;
  border-bottom: 1px solid var(--border-primary);
}

.sidebar-left {
  grid-column: 1;
  grid-row: 2;
  border-right: 1px solid var(--border-primary);
}

.main-content {
  grid-column: 2;
  grid-row: 2;
  border-right: 1px solid var(--border-primary);
}

.sidebar-right {
  grid-column: 3;
  grid-row: 2;
}
```

### Panel Spacing
```css
.panel {
  padding: var(--space-6); /* 24px */
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
}

.panel-header {
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-4);
  border-bottom: 1px dashed var(--border-primary);
}

.panel-section {
  margin-bottom: var(--space-8);
}

.panel-section:last-child {
  margin-bottom: 0;
}
```

### Border Styles
```css
--border-width-thin: 1px;
--border-width-medium: 2px;
--border-width-thick: 3px;

--border-radius-none: 0;
--border-radius-sm: 2px;
--border-radius-md: 4px;
--border-radius-lg: 8px;
```

**Usage**: The interface primarily uses **sharp corners** (no border radius) for that terminal aesthetic. Only use border-radius sparingly for specific interactive elements.

```css
.border-solid {
  border-style: solid;
}

.border-dashed {
  border-style: dashed;
  border-width: 1px;
}

.border-dotted {
  border-style: dotted;
}
```

---

## Component Library

### 1. Header Component
```jsx
<header className="dashboard-header">
  <div className="header-content">
    <button className="back-button" aria-label="Back">
      &lt;&lt;
    </button>
    <h1 className="header-title">AGENT DATA OVERVIEW</h1>
    <div className="header-meta">
      <span className="last-update">Last Update 05/06/2025 20:00</span>
    </div>
    <div className="header-tabs">
      <button className="tab-button active">JM</button>
      <button className="tab-button">SW</button>
      <button className="tab-button">RW</button>
    </div>
    <div className="header-actions">
      <button className="icon-button" aria-label="Refresh">↻</button>
      <button className="icon-button" aria-label="Share">↗</button>
      <button className="icon-button" aria-label="Settings">⊙</button>
    </div>
  </div>
</header>
```

**Styling**:
```css
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-6);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
}

.header-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--text-primary);
  text-align: center;
  flex: 1;
}

.header-meta {
  position: absolute;
  top: var(--space-2);
  right: 50%;
  transform: translateX(50%);
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.back-button {
  font-size: var(--text-xl);
  color: var(--text-primary);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: var(--space-2) var(--space-4);
  transition: color 0.2s ease;
}

.back-button:hover {
  color: var(--accent-primary);
}

.header-tabs {
  display: flex;
  gap: var(--space-2);
}

.tab-button {
  padding: var(--space-2) var(--space-4);
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-button:hover {
  color: var(--text-primary);
  border-color: var(--border-accent);
}

.tab-button.active {
  color: var(--text-primary);
  background: var(--bg-tertiary);
  border-color: var(--accent-primary);
  box-shadow: 0 0 10px var(--accent-glow);
}

.icon-button {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--border-primary);
  color: var(--text-secondary);
  font-size: var(--text-lg);
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-button:hover {
  color: var(--accent-primary);
  border-color: var(--accent-primary);
  box-shadow: 0 0 8px var(--accent-glow);
}
```

### 2. Stat Card Component
```jsx
<div className="stat-card">
  <div className="stat-value">190</div>
  <div className="stat-label">Active Field..</div>
</div>
```

**Styling**:
```css
.stat-card {
  padding: var(--space-6);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  text-align: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: var(--accent-primary);
  box-shadow: 0 0 15px var(--accent-glow);
}

.stat-value {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  letter-spacing: var(--tracking-tight);
  margin-bottom: var(--space-2);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
}
```

### 3. Data Table Component
```jsx
<div className="data-table">
  <div className="table-header">
    <div className="table-header-cell">Agent ID</div>
    <div className="table-header-cell">Agent Identifier</div>
  </div>
  <div className="table-body">
    <div className="table-row">
      <div className="table-cell">G-078W</div>
      <div className="table-cell">VENGEFUL SPIRIT</div>
    </div>
    {/* More rows */}
  </div>
</div>
```

**Styling**:
```css
.data-table {
  width: 100%;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

.table-header {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-primary);
}

.table-header-cell {
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
}

.table-row {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border-dim);
  transition: background 0.2s ease;
}

.table-row:hover {
  background: var(--bg-tertiary);
}

.table-cell {
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table-cell:first-child {
  color: var(--text-secondary);
}
```

### 4. Activity Log Component
```jsx
<div className="activity-log">
  <div className="log-entry">
    <div className="log-timestamp">25/06/2025 09:29</div>
    <div className="log-message">
      - Agent <span className="log-highlight">gh0st Fire</span> 
      <span className="log-dim">completed mission in</span> 
      <span className="log-location">Berlin</span> 
      <span className="log-dim">with agent</span> 
      <span className="log-highlight">zer0 Nigh</span>
    </div>
  </div>
  {/* More entries */}
</div>
```

**Styling**:
```css
.activity-log {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.log-entry {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--border-dim);
}

.log-entry:last-child {
  border-bottom: none;
}

.log-timestamp {
  color: var(--text-secondary);
  margin-bottom: var(--space-2);
  font-size: var(--text-xs);
}

.log-message {
  color: var(--text-primary);
  line-height: var(--leading-relaxed);
}

.log-highlight {
  color: var(--accent-primary);
  font-weight: var(--font-medium);
}

.log-dim {
  color: var(--text-tertiary);
}

.log-location {
  color: var(--text-primary);
  font-weight: var(--font-semibold);
}
```

### 5. Section Header Component
```jsx
<div className="section-header">
  <h2 className="section-title">AGENT ALLOCATION</h2>
  <div className="section-divider"></div>
</div>
```

**Styling**:
```css
.section-header {
  margin-bottom: var(--space-6);
}

.section-title {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: var(--tracking-widest);
  margin-bottom: var(--space-4);
}

.section-divider {
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    var(--border-primary) 20%,
    var(--border-primary) 80%,
    transparent
  );
}
```

### 6. Chart/Graph Component
```jsx
<div className="chart-container">
  <div className="chart-header">
    <h3 className="chart-title">Mission Activity Overview</h3>
  </div>
  <div className="chart-canvas">
    {/* Chart rendering - line graph with dual lines */}
    <svg className="activity-chart">
      {/* Solid line for primary metric */}
      <path className="chart-line-solid" />
      {/* Dashed line for secondary metric */}
      <path className="chart-line-dashed" />
      {/* Axis and labels */}
    </svg>
  </div>
  <div className="chart-legend">
    <div className="legend-item">
      <div className="legend-line solid"></div>
      <span>Active Missions</span>
    </div>
    <div className="legend-item">
      <div className="legend-line dashed"></div>
      <span>Completed Missions</span>
    </div>
  </div>
</div>
```

**Styling**:
```css
.chart-container {
  padding: var(--space-6);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
}

.chart-header {
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-4);
  border-bottom: 1px dashed var(--border-primary);
}

.chart-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
}

.chart-canvas {
  height: 250px;
  position: relative;
  margin-bottom: var(--space-6);
}

.activity-chart {
  width: 100%;
  height: 100%;
}

.chart-line-solid {
  stroke: var(--text-primary);
  stroke-width: 2px;
  fill: none;
}

.chart-line-dashed {
  stroke: var(--text-secondary);
  stroke-width: 2px;
  stroke-dasharray: 5, 5;
  fill: none;
}

.chart-axis {
  stroke: var(--border-primary);
  stroke-width: 1px;
}

.chart-label {
  fill: var(--text-secondary);
  font-size: var(--text-xs);
  font-family: var(--font-mono);
}

.chart-legend {
  display: flex;
  gap: var(--space-6);
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.legend-line {
  width: 30px;
  height: 2px;
  background: var(--text-primary);
}

.legend-line.solid {
  background: var(--text-primary);
}

.legend-line.dashed {
  background: repeating-linear-gradient(
    to right,
    var(--text-secondary) 0,
    var(--text-secondary) 5px,
    transparent 5px,
    transparent 10px
  );
}
```

### 7. Status Indicator Component
```jsx
<div className="status-indicator success">
  <div className="status-dot"></div>
  <span className="status-label">ACTIVE</span>
</div>
```

**Styling**:
```css
.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  font-size: var(--text-xs);
  font-family: var(--font-mono);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.status-indicator.success .status-dot {
  background: var(--status-success);
  box-shadow: 0 0 8px var(--status-success);
}

.status-indicator.warning .status-dot {
  background: var(--status-warning);
  box-shadow: 0 0 8px var(--status-warning);
}

.status-indicator.error .status-dot {
  background: var(--status-error);
  box-shadow: 0 0 8px var(--status-error);
}

.status-indicator.neutral .status-dot {
  background: var(--status-neutral);
}

.status-label {
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
  font-weight: var(--font-semibold);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
```

### 8. Mission Stats Component
```jsx
<div className="mission-stats">
  <div className="stats-section">
    <div className="stats-icon">▶</div>
    <h4 className="stats-title">Successful Missions</h4>
    <div className="stats-breakdown">
      <div className="stat-item">
        <span className="stat-label">High Risk Mission</span>
        <span className="stat-value">190</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Medium Risk Mission</span>
        <span className="stat-value">426</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Low Risk Mission</span>
        <span className="stat-value">920</span>
      </div>
    </div>
  </div>
  
  <div className="stats-section">
    <div className="stats-icon error">▶</div>
    <h4 className="stats-title">Failed Missions</h4>
    <div className="stats-breakdown">
      {/* Similar structure */}
    </div>
  </div>
</div>
```

**Styling**:
```css
.mission-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-8);
  padding: var(--space-6);
}

.stats-section {
  position: relative;
}

.stats-icon {
  font-size: var(--text-lg);
  color: var(--status-success);
  margin-bottom: var(--space-3);
}

.stats-icon.error {
  color: var(--status-error);
}

.stats-title {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  margin-bottom: var(--space-4);
}

.stats-breakdown {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

.stat-label {
  color: var(--text-secondary);
}

.stat-value {
  color: var(--text-primary);
  font-weight: var(--font-bold);
  font-size: var(--text-lg);
}
```

### 9. Wireframe Sphere Component
```jsx
<div className="wireframe-container">
  <svg className="wireframe-sphere" viewBox="0 0 300 300">
    {/* Sphere wireframe with lat/long lines */}
    <circle className="sphere-outline" cx="150" cy="150" r="140" />
    {/* Latitude lines */}
    <ellipse className="lat-line" cx="150" cy="150" rx="140" ry="40" />
    <ellipse className="lat-line" cx="150" cy="150" rx="140" ry="80" />
    <ellipse className="lat-line" cx="150" cy="150" rx="140" ry="120" />
    {/* Longitude lines */}
    <ellipse className="lon-line" cx="150" cy="150" rx="40" ry="140" />
    <ellipse className="lon-line" cx="150" cy="150" rx="80" ry="140" />
    <ellipse className="lon-line" cx="150" cy="150" rx="120" ry="140" />
  </svg>
  <div className="wireframe-label">Encrypted Chat Activity</div>
</div>
```

**Styling**:
```css
.wireframe-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-8);
}

.wireframe-sphere {
  width: 250px;
  height: 250px;
  filter: drop-shadow(0 0 10px var(--accent-glow));
}

.sphere-outline {
  fill: none;
  stroke: var(--wireframe-primary);
  stroke-width: 1.5px;
  opacity: 0.8;
}

.lat-line,
.lon-line {
  fill: none;
  stroke: var(--wireframe-secondary);
  stroke-width: 1px;
  opacity: 0.6;
}

.wireframe-label {
  margin-top: var(--space-4);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
}
```

### 10. Timestamp Component
```jsx
<div className="timestamp-block">
  <div className="timestamp-marker">#</div>
  <div className="timestamp-content">
    <div className="timestamp-date">2025-06-17 14:23 UTC</div>
    <div className="timestamp-message">
      > [AGENT:ghostFire] :: INIT >> ΔΔΔ loading secure channel
    </div>
  </div>
</div>
```

**Styling**:
```css
.timestamp-block {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-3) 0;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  border-bottom: 1px solid var(--border-dim);
}

.timestamp-marker {
  color: var(--accent-primary);
  font-weight: var(--font-bold);
  flex-shrink: 0;
}

.timestamp-content {
  flex: 1;
}

.timestamp-date {
  color: var(--text-secondary);
  margin-bottom: var(--space-1);
}

.timestamp-message {
  color: var(--text-primary);
  line-height: var(--leading-relaxed);
}

.timestamp-message .command {
  color: var(--accent-primary);
}

.timestamp-message .status {
  color: var(--status-warning);
}
```

---

## Visual Effects & Animations

### Glow Effects
```css
.glow-cyan {
  box-shadow: 0 0 10px var(--accent-glow);
}

.glow-success {
  box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
}

.glow-error {
  box-shadow: 0 0 10px rgba(255, 68, 68, 0.3);
}

.glow-pulse {
  animation: glowPulse 2s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% {
    box-shadow: 0 0 5px var(--accent-glow);
  }
  50% {
    box-shadow: 0 0 20px var(--accent-glow);
  }
}
```

### Hover Transitions
```css
.hover-border-glow {
  transition: all 0.3s ease;
}

.hover-border-glow:hover {
  border-color: var(--accent-primary);
  box-shadow: 0 0 15px var(--accent-glow);
}

.hover-text-glow {
  transition: all 0.2s ease;
}

.hover-text-glow:hover {
  color: var(--accent-primary);
  text-shadow: 0 0 10px var(--accent-glow);
}
```

### Scan Line Effect
```css
.scan-line-container {
  position: relative;
  overflow: hidden;
}

.scan-line-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    to right,
    transparent,
    var(--accent-primary),
    transparent
  );
  animation: scan 4s linear infinite;
  opacity: 0.3;
}

@keyframes scan {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(100vh);
  }
}
```

### Typing Effect (Terminal Style)
```css
.typing-effect {
  overflow: hidden;
  border-right: 2px solid var(--accent-primary);
  white-space: nowrap;
  animation: typing 3s steps(40) 1s 1 normal both,
             blink 0.75s step-end infinite;
}

@keyframes typing {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

@keyframes blink {
  50% {
    border-color: transparent;
  }
}
```

### Fade In Animations
```css
.fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Grid Background Effect
```css
.grid-background {
  background-image: 
    linear-gradient(var(--wireframe-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--wireframe-grid) 1px, transparent 1px);
  background-size: 20px 20px;
  position: relative;
}

.grid-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    circle at center,
    transparent 0%,
    var(--bg-primary) 100%
  );
  pointer-events: none;
}
```

---

## Iconography & Graphics

### Icon Style Guidelines
- Use simple geometric shapes and ASCII-style characters
- Prefer symbols over complex icons: `▶`, `◀`, `↻`, `↗`, `⊙`, `✓`, `✗`, `▲`, `▼`
- Monochrome with accent colors on hover/active states
- Size: 16px to 24px for UI icons, 32px+ for feature icons

### Common Icons
```css
.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: var(--text-lg);
  color: var(--text-secondary);
  transition: color 0.2s ease;
}

.icon:hover {
  color: var(--accent-primary);
}

/* Specific icon styles */
.icon-arrow-right::before { content: '→'; }
.icon-arrow-left::before { content: '←'; }
.icon-arrow-up::before { content: '↑'; }
.icon-arrow-down::before { content: '↓'; }
.icon-refresh::before { content: '↻'; }
.icon-external::before { content: '↗'; }
.icon-settings::before { content: '⊙'; }
.icon-play::before { content: '▶'; }
.icon-pause::before { content: '⏸'; }
.icon-check::before { content: '✓'; }
.icon-cross::before { content: '✗'; }
.icon-menu::before { content: '☰'; }
.icon-close::before { content: '×'; }
```

### Wireframe Graphics
For 3D wireframe elements (like the sphere), use SVG with:
- Thin strokes (1-2px)
- Cyan color with transparency
- Grid/mesh patterns
- Perspective effects

### Border Corner Decorations
```css
.corner-decorations {
  position: relative;
}

.corner-decorations::before,
.corner-decorations::after {
  content: '';
  position: absolute;
  width: 10px;
  height: 10px;
  border: 1px solid var(--accent-primary);
}

.corner-decorations::before {
  top: -1px;
  left: -1px;
  border-right: none;
  border-bottom: none;
}

.corner-decorations::after {
  bottom: -1px;
  right: -1px;
  border-left: none;
  border-top: none;
}
```

---

## Data Visualization

### Chart Guidelines

#### Color Scheme for Charts
```css
--chart-primary: #ffffff;      /* Main data line - white */
--chart-secondary: #666666;    /* Comparison/secondary line - gray */
--chart-accent: #00d9ff;       /* Highlighted data points - cyan */
--chart-grid: #1a1a1a;         /* Grid lines - dark gray */
--chart-axis: #2a2a2a;         /* Axis lines */
```

#### Line Chart Styles
```css
.line-chart {
  --line-solid-width: 2px;
  --line-dashed-width: 2px;
  --line-dashed-pattern: 5, 5; /* 5px dash, 5px gap */
}

.chart-line-primary {
  stroke: var(--chart-primary);
  stroke-width: var(--line-solid-width);
  fill: none;
}

.chart-line-secondary {
  stroke: var(--chart-secondary);
  stroke-width: var(--line-dashed-width);
  stroke-dasharray: var(--line-dashed-pattern);
  fill: none;
}

.chart-data-point {
  fill: var(--chart-accent);
  stroke: var(--bg-primary);
  stroke-width: 2px;
  r: 4px;
}

.chart-data-point:hover {
  r: 6px;
  filter: drop-shadow(0 0 8px var(--accent-glow));
}
```

#### Grid and Axes
```css
.chart-grid-line {
  stroke: var(--chart-grid);
  stroke-width: 1px;
  stroke-dasharray: 2, 4;
}

.chart-axis {
  stroke: var(--chart-axis);
  stroke-width: 1px;
}

.chart-axis-label {
  fill: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  text-anchor: middle;
}

.chart-value-label {
  fill: var(--text-primary);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
}
```

### Bar Chart Styles (if needed)
```css
.bar-chart-bar {
  fill: var(--bg-tertiary);
  stroke: var(--border-primary);
  stroke-width: 1px;
  transition: all 0.3s ease;
}

.bar-chart-bar:hover {
  fill: var(--accent-primary);
  opacity: 0.8;
}

.bar-chart-bar.success {
  fill: var(--status-success);
  opacity: 0.3;
}

.bar-chart-bar.error {
  fill: var(--status-error);
  opacity: 0.3;
}
```

### Numeric Display Formatting
```css
.large-number {
  font-family: var(--font-mono);
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
  line-height: 1;
}

.number-with-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

.number-value {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.number-label {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
}
```

---

## Interaction Patterns

### Button States
```css
.btn {
  padding: var(--space-3) var(--space-6);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
  background: transparent;
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.btn:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  box-shadow: 0 0 15px var(--accent-glow);
}

.btn:active {
  transform: translateY(1px);
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  border-color: var(--border-dim);
  color: var(--text-dim);
}

.btn-primary {
  background: var(--accent-primary);
  color: var(--bg-primary);
  border-color: var(--accent-primary);
}

.btn-primary:hover {
  background: var(--accent-secondary);
  box-shadow: 0 0 20px var(--accent-glow);
}

.btn-danger {
  border-color: var(--status-error);
  color: var(--status-error);
}

.btn-danger:hover {
  background: var(--status-error);
  color: var(--text-primary);
  box-shadow: 0 0 15px rgba(255, 68, 68, 0.5);
}
```

### Input Fields
```css
.input {
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  outline: none;
  transition: all 0.2s ease;
}

.input:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 10px var(--accent-glow);
}

.input::placeholder {
  color: var(--text-tertiary);
  font-style: italic;
}

.input:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: var(--bg-tertiary);
}

.input-error {
  border-color: var(--status-error);
}

.input-error:focus {
  box-shadow: 0 0 10px rgba(255, 68, 68, 0.3);
}
```

### Select/Dropdown
```css
.select {
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="8"><path fill="%238a8a8a" d="M0 0l6 8 6-8z"/></svg>');
  background-repeat: no-repeat;
  background-position: right var(--space-3) center;
  padding-right: var(--space-8);
}

.select:hover {
  border-color: var(--accent-primary);
}

.select:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 10px var(--accent-glow);
}
```

### Checkbox/Toggle
```css
.checkbox-container {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
}

.checkbox {
  width: 18px;
  height: 18px;
  border: 1px solid var(--border-primary);
  background: var(--bg-primary);
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.checkbox:hover {
  border-color: var(--accent-primary);
}

.checkbox.checked {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
}

.checkbox.checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--bg-primary);
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
}

.checkbox-label {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--text-primary);
  user-select: none;
}
```

### Tabs
```css
.tabs-container {
  border-bottom: 1px solid var(--border-primary);
}

.tabs-list {
  display: flex;
  gap: var(--space-2);
}

.tab {
  padding: var(--space-3) var(--space-6);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
  background: transparent;
  border: 1px solid var(--border-primary);
  border-bottom: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  top: 1px;
}

.tab:hover {
  color: var(--text-primary);
  border-color: var(--accent-primary);
}

.tab.active {
  color: var(--text-primary);
  background: var(--bg-secondary);
  border-color: var(--accent-primary);
  border-bottom-color: var(--bg-secondary);
  box-shadow: 0 0 10px var(--accent-glow);
}

.tab-panel {
  padding: var(--space-6);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-top: none;
}
```

### Modal/Dialog
```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.modal {
  background: var(--bg-secondary);
  border: 2px solid var(--accent-primary);
  box-shadow: 0 0 30px var(--accent-glow);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow: auto;
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-family: var(--font-mono);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: var(--tracking-widest);
  color: var(--text-primary);
}

.modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--border-primary);
  color: var(--text-secondary);
  font-size: var(--text-xl);
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close:hover {
  color: var(--status-error);
  border-color: var(--status-error);
}

.modal-body {
  padding: var(--space-6);
}

.modal-footer {
  padding: var(--space-6);
  border-top: 1px solid var(--border-primary);
  display: flex;
  gap: var(--space-4);
  justify-content: flex-end;
}
```

### Tooltips
```css
.tooltip-trigger {
  position: relative;
  cursor: help;
}

.tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--bg-tertiary);
  border: 1px solid var(--accent-primary);
  box-shadow: 0 0 10px var(--accent-glow);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-primary);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 100;
}

.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: var(--accent-primary);
}

.tooltip-trigger:hover .tooltip {
  opacity: 1;
}
```

### Loading States
```css
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-primary);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-dots {
  display: flex;
  gap: var(--space-2);
}

.loading-dot {
  width: 8px;
  height: 8px;
  background: var(--accent-primary);
  border-radius: 50%;
  animation: loadingDotPulse 1.4s ease-in-out infinite;
}

.loading-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes loadingDotPulse {
  0%, 80%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}

.loading-bar {
  width: 100%;
  height: 2px;
  background: var(--border-primary);
  position: relative;
  overflow: hidden;
}

.loading-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 40%;
  background: var(--accent-primary);
  box-shadow: 0 0 10px var(--accent-glow);
  animation: loadingBarSlide 1.5s ease-in-out infinite;
}

@keyframes loadingBarSlide {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(350%);
  }
}
```

---

## Responsive Breakpoints

```css
/* Mobile First Approach */
--breakpoint-sm: 640px;   /* Small devices */
--breakpoint-md: 768px;   /* Medium devices */
--breakpoint-lg: 1024px;  /* Large devices */
--breakpoint-xl: 1280px;  /* Extra large devices */
--breakpoint-2xl: 1536px; /* 2X large devices */
```

### Responsive Grid Layout
```css
/* Mobile: Single column stack */
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }
  
  .sidebar-left,
  .sidebar-right {
    border-right: none;
    border-bottom: 1px solid var(--border-primary);
  }
}

/* Tablet: Two columns */
@media (min-width: 769px) and (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 300px 1fr;
  }
  
  .sidebar-right {
    grid-column: 1 / -1;
    border-top: 1px solid var(--border-primary);
    border-right: none;
  }
}

/* Desktop: Three columns (default) */
@media (min-width: 1025px) {
  .dashboard-grid {
    grid-template-columns: 350px 1fr 400px;
  }
}
```

---

## Accessibility Considerations

### Focus States
```css
:focus {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

:focus:not(:focus-visible) {
  outline: none;
}

:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}
```

### Screen Reader Text
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Implementation Notes

### Tailwind CSS Configuration
If using Tailwind CSS, extend the default theme:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0a0a',
          secondary: '#131313',
          tertiary: '#1a1a1a',
        },
        text: {
          primary: '#e8e8e8',
          secondary: '#8a8a8a',
          tertiary: '#5a5a5a',
        },
        accent: {
          primary: '#00d9ff',
          secondary: '#00b8d4',
        },
        status: {
          success: '#00ff88',
          warning: '#ffaa00',
          error: '#ff4444',
        },
      },
      fontFamily: {
        mono: ['Courier New', 'Consolas', 'Monaco', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 10px rgba(0, 217, 255, 0.3)',
        'glow-success': '0 0 10px rgba(0, 255, 136, 0.3)',
        'glow-error': '0 0 10px rgba(255, 68, 68, 0.3)',
      },
    },
  },
}
```

### CSS Variables Setup
```css
/* globals.css or root styles */
:root {
  /* Copy all CSS variables from Color Palette section */
  --bg-primary: #0a0a0a;
  /* ... etc */
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-mono);
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: var(--leading-normal);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--border-primary);
  border: 1px solid var(--bg-secondary);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--accent-primary);
}
```

### Performance Considerations
- Use `will-change` sparingly for frequently animated elements
- Optimize SVG graphics for performance
- Use CSS transforms for animations instead of position properties
- Lazy load images and heavy components
- Consider virtualization for long lists (activity logs, agent tables)

---

## Brand Voice & Tone

### Design Philosophy
The interface embodies:
- **Military/Intelligence Aesthetic**: Command center, surveillance, classified operations
- **Technical Precision**: Monospace fonts, exact measurements, data-driven
- **Cyberpunk/Future Noir**: Neon accents, dark backgrounds, wireframe graphics
- **Terminal Interface**: Text-based origins, command-line heritage
- **Minimalist Brutalism**: No unnecessary decoration, function over form

### Content Guidelines
- Use uppercase for headers and labels to evoke official documents
- Timestamps should be precise and use military/UTC format
- Agent identifiers should be alphanumeric codes (e.g., G-078W)
- Agent names should be UPPERCASE CODENAMES (e.g., VENGEFUL SPIRIT)
- Status messages use terminal-style syntax with symbols (>>, ::, ΔΔΔ)
- Numbers should be formatted consistently (no decimals unless necessary)

---

## Quick Reference: Color Usage

| Element | Color Variable | Hex Value |
|---------|---------------|-----------|
| Main Background | `--bg-primary` | `#0a0a0a` |
| Card Background | `--bg-secondary` | `#131313` |
| Primary Text | `--text-primary` | `#e8e8e8` |
| Secondary Text | `--text-secondary` | `#8a8a8a` |
| Interactive Elements | `--accent-primary` | `#00d9ff` |
| Success/Active | `--status-success` | `#00ff88` |
| Error/Failed | `--status-error` | `#ff4444` |
| Warning | `--status-warning` | `#ffaa00` |
| Borders | `--border-primary` | `#2a2a2a` |
| Wireframe Graphics | `--wireframe-primary` | `#00d9ff` |

---

## Example Page Layout

```jsx
<div className="dashboard-grid">
  {/* Header */}
  <header className="dashboard-header">
    <button className="back-button">&lt;&lt;</button>
    <h1 className="header-title">AGENT DATA OVERVIEW</h1>
    <span className="header-meta">Last Update 05/06/2025 20:00</span>
    <div className="header-tabs">
      <button className="tab-button active">JM</button>
      <button className="tab-button">SW</button>
      <button className="tab-button">RW</button>
    </div>
    <div className="header-actions">
      <button className="icon-button">↻</button>
      <button className="icon-button">↗</button>
      <button className="icon-button">⊙</button>
    </div>
  </header>

  {/* Left Sidebar */}
  <aside className="sidebar-left">
    <section className="panel">
      <div className="section-header">
        <h2 className="section-title">AGENT ALLOCATION</h2>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">190</div>
          <div className="stat-label">Active Field..</div>
        </div>
        {/* More stat cards */}
      </div>
      
      <div className="data-table">
        {/* Agent table */}
      </div>
    </section>
  </aside>

  {/* Main Content */}
  <main className="main-content">
    <section className="panel">
      <div className="section-header">
        <h2 className="section-title">ACTIVITY LOG</h2>
      </div>
      
      <div className="activity-log">
        {/* Log entries */}
      </div>
      
      <div className="chart-container">
        {/* Mission Activity Chart */}
      </div>
      
      <div className="mission-stats">
        {/* Successful/Failed missions */}
      </div>
    </section>
  </main>

  {/* Right Sidebar */}
  <aside className="sidebar-right">
    <section className="panel">
      <div className="section-header">
        <h2 className="section-title">ENCRYPTED CHAT ACTIVITY</h2>
      </div>
      
      <div className="wireframe-container">
        {/* Wireframe sphere */}
      </div>
      
      <div className="timestamp-log">
        {/* Encrypted messages log */}
      </div>
    </section>
  </aside>
</div>
```

---

## Additional Critical Design Details

### 1. Outer Frame with Corner Brackets
The entire dashboard has a distinctive outer frame with L-shaped corner brackets:

```css
.dashboard-container {
  position: relative;
  border: 2px solid var(--border-primary);
  min-height: 100vh;
}

/* Corner brackets - top-left */
.dashboard-container::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  width: 30px;
  height: 30px;
  border-top: 3px solid var(--accent-primary);
  border-left: 3px solid var(--accent-primary);
}

/* Corner brackets - top-right */
.dashboard-container::after {
  content: '';
  position: absolute;
  top: -2px;
  right: -2px;
  width: 30px;
  height: 30px;
  border-top: 3px solid var(--accent-primary);
  border-right: 3px solid var(--accent-primary);
}

/* Add similar pseudo-elements for bottom corners on a child wrapper element */
.dashboard-inner::before {
  content: '';
  position: absolute;
  bottom: -2px;
  left: -2px;
  width: 30px;
  height: 30px;
  border-bottom: 3px solid var(--accent-primary);
  border-left: 3px solid var(--accent-primary);
}

.dashboard-inner::after {
  content: '';
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 30px;
  height: 30px;
  border-bottom: 3px solid var(--accent-primary);
  border-right: 3px solid var(--accent-primary);
}
```

### 2. Subtle Texture Overlay (Optional)
Add a very subtle noise/grain texture for that surveillance monitor feel:

```css
.dashboard-container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/></filter><rect width="100" height="100" filter="url(%23noise)" opacity="0.03"/></svg>');
  pointer-events: none;
  z-index: 9999;
}
```

### 3. Vignette Effect
Darker at the edges, creating focus on the center:

```css
.dashboard-container {
  position: relative;
}

.dashboard-container::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 0%,
    transparent 60%,
    rgba(0, 0, 0, 0.3) 100%
  );
  pointer-events: none;
  z-index: 9998;
}
```

### 4. Terminal Command Syntax Patterns
Specific formatting for terminal-style messages:

```jsx
// Pattern: > [AGENT:name] :: STATUS >> symbol message
<div className="terminal-message">
  <span className="prompt">&gt;</span>
  <span className="bracket">[</span>
  <span className="label">AGENT:</span>
  <span className="agent-name">ghostFire</span>
  <span className="bracket">]</span>
  <span className="separator"> :: </span>
  <span className="status">INIT</span>
  <span className="arrow"> &gt;&gt; </span>
  <span className="symbol">ΔΔΔ</span>
  <span className="message"> loading secure channel</span>
</div>
```

**Styling**:
```css
.terminal-message {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  line-height: var(--leading-relaxed);
}

.prompt {
  color: var(--accent-primary);
  margin-right: var(--space-1);
}

.bracket {
  color: var(--text-tertiary);
}

.label {
  color: var(--text-secondary);
  text-transform: uppercase;
}

.agent-name {
  color: var(--accent-primary);
  font-weight: var(--font-semibold);
}

.separator {
  color: var(--text-tertiary);
}

.status {
  color: var(--status-warning);
  font-weight: var(--font-bold);
  text-transform: uppercase;
}

.arrow {
  color: var(--text-tertiary);
}

.symbol {
  color: var(--accent-primary);
  margin-right: var(--space-1);
}

.message {
  color: var(--text-primary);
}
```

### 5. Agent ID Format Pattern
Consistent format: `Letter-Digits-Letter` (e.g., G-078W, G-079X)

```javascript
// Generate agent ID
const generateAgentId = () => {
  const letter1 = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
  const numbers = String(Math.floor(Math.random() * 1000)).padStart(3, '0'); // 000-999
  const letter2 = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
  return `${letter1}-${numbers}${letter2}`;
};
```

### 6. Ellipsis Truncation Style
Use exactly two periods for truncated text (not three):

```css
.truncate-text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* Or manually add two dots */
.manual-truncate::after {
  content: '..';
  color: var(--text-secondary);
}
```

### 7. Number Alignment in Tables
Right-align numerical data:

```css
.table-cell.numeric {
  text-align: right;
  font-variant-numeric: tabular-nums; /* Use monospace numbers */
  font-feature-settings: 'tnum'; /* Tabular numbers */
}
```

### 8. CRT Monitor Scanline Effect (Optional)
For authentic surveillance monitor feel:

```css
.scanline-effect {
  position: relative;
}

.scanline-effect::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15),
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  z-index: 10000;
}

.scanline-effect::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(
    rgba(18, 16, 16, 0) 50%,
    rgba(0, 0, 0, 0.25) 50%
  );
  background-size: 100% 4px;
  animation: scanlineMove 10s linear infinite;
  pointer-events: none;
  z-index: 10001;
}

@keyframes scanlineMove {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(100%);
  }
}
```

### 9. CRT Screen Glow/Bloom Effect
Subtle glow around bright elements:

```css
.crt-glow {
  position: relative;
}

.crt-glow::before {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  color: var(--accent-primary);
  filter: blur(4px);
  opacity: 0.5;
  z-index: -1;
}
```

### 10. Border Hierarchy
Very specific border thickness throughout:

```css
/* Outer container - thickest */
.dashboard-frame {
  border: 2px solid var(--border-primary);
}

/* Major section dividers */
.section-divider {
  border-right: 1px solid var(--border-primary);
}

/* Internal dividers - very subtle */
.internal-divider {
  border-bottom: 1px solid var(--border-dim);
}

/* Dashed dividers for subsections */
.subsection-divider {
  border-bottom: 1px dashed var(--border-primary);
}
```

### 11. Zero Gap Grid Layout
Sections touch with no visible gap - borders create the separation:

```css
.tight-grid {
  display: grid;
  grid-template-columns: 350px 1fr 400px;
  gap: 0; /* No gap - use borders instead */
}

.tight-grid > * {
  border-right: 1px solid var(--border-primary);
}

.tight-grid > *:last-child {
  border-right: none;
}
```

### 12. Specific Special Characters
Terminal-style symbols to use throughout:

```
Prompts/Commands:
> prompt symbol
>> double arrow
:: double colon separator

Status/Symbols:
▶ play/active indicator
◀ back/reverse indicator
● bullet/status dot
○ empty bullet
▲ up indicator
▼ down indicator
△ empty up triangle
▽ empty down triangle
⬡ hexagon
⬢ filled hexagon

Technical Symbols:
ΔΔΔ delta symbols (change/loading)
… ellipsis (exactly three dots for continuation)
.. two dots for truncation
--- dash line
=== equals line
┌─┐ box drawing characters
│ │ vertical bars
└─┘ bottom corners
├─┤ T-junctions

Navigation:
↑ ↓ ← → arrows
↻ ↺ circular arrows
↗ ↖ ↙ ↘ diagonal arrows
⇧ ⇩ ⇦ ⇨ double arrows

Interface:
× close/multiply
+ plus/add
- minus/subtract
✓ checkmark
✗ x-mark
⊙ target/settings
☰ menu (hamburger)
```

### 13. Date/Time Format Specification
Consistent timestamp formatting:

```javascript
// Format 1: Date with slashes, time with colon
// 25/06/2025 09:29
const formatDateTime = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

// Format 2: ISO-style with UTC
// 2025-06-17 14:23 UTC
const formatDateTimeUTC = (date) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes} UTC`;
};
```

### 14. Graph Line Dash Pattern
Specific dash pattern for secondary line:

```css
.chart-line-dashed {
  stroke: var(--text-secondary);
  stroke-width: 2px;
  stroke-dasharray: 8, 4; /* 8px dash, 4px gap - very specific ratio */
  fill: none;
  opacity: 0.8;
}
```

### 15. Text Shadow vs Box Shadow
**Important**: Never use text-shadow or drop-shadow. Only use glows via box-shadow:

```css
/* ✅ CORRECT - Glow effect */
.glowing-element {
  box-shadow: 0 0 10px var(--accent-glow);
}

/* ❌ INCORRECT - No drop shadows */
.no-drop-shadow {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5); /* DON'T USE */
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8); /* DON'T USE */
}
```

### 16. Fade-Edge Dividers
Section dividers that fade at the edges:

```css
.fade-divider {
  height: 1px;
  background: linear-gradient(
    to right,
    transparent 0%,
    var(--border-primary) 5%,
    var(--border-primary) 95%,
    transparent 100%
  );
  margin: var(--space-6) 0;
}

/* Alternative with shorter fade */
.fade-divider-short {
  height: 1px;
  background: linear-gradient(
    to right,
    transparent 0%,
    var(--border-primary) 10%,
    var(--border-primary) 90%,
    transparent 100%
  );
}
```

### 17. Minimal Padding on Dense Sections
Agent allocation and data sections are very compact:

```css
.dense-section {
  padding: var(--space-4); /* 16px - very tight */
}

.dense-row {
  padding: var(--space-2) var(--space-3); /* 8px vertical, 12px horizontal */
  line-height: 1.3; /* Tighter line height */
}

.dense-table-cell {
  padding: var(--space-2); /* 8px all around */
}
```

### 18. Monospace Number Styling
Ensure perfect alignment of numbers:

```css
.monospace-numbers {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum', 'zero'; /* Tabular nums + slashed zero */
  letter-spacing: 0;
}

/* Large display numbers */
.display-number {
  font-family: var(--font-mono);
  font-weight: var(--font-bold);
  font-variant-numeric: lining-nums tabular-nums;
  letter-spacing: -0.02em; /* Slight tightening for large sizes */
}
```

### 19. Activity Log Dash Syntax
Consistent dash prefix for log entries:

```jsx
<div className="log-entry">
  <div className="log-timestamp">25/06/2025 09:29</div>
  <div className="log-message">
    - Agent <span className="agent-highlight">gh0st Fire</span>{' '}
    <span className="log-action">completed mission in</span>{' '}
    <span className="location">Berlin</span>{' '}
    <span className="log-action">with agent</span>{' '}
    <span className="agent-highlight">zer0 Nigh</span>
  </div>
</div>
```

```css
.log-message {
  color: var(--text-primary);
  line-height: 1.6;
}

.log-message::before {
  content: '- ';
  color: var(--text-secondary);
  margin-right: var(--space-1);
}

.agent-highlight {
  color: var(--accent-primary);
  font-weight: var(--font-medium);
}

.log-action {
  color: var(--text-tertiary);
}

.location {
  color: var(--text-primary);
  font-weight: var(--font-semibold);
}
```

### 20. Hash Prefix for Chat/System Messages
Terminal-style hash markers:

```css
.system-message::before {
  content: '# ';
  color: var(--accent-primary);
  margin-right: var(--space-2);
  font-weight: var(--font-bold);
}
```

---

## Conclusion

This style guide provides a comprehensive foundation for building a spy/agent-themed dashboard interface. The aesthetic prioritizes:
- **Dark, terminal-style interface** for reduced eye strain and professional appearance
- **Monospace typography** for technical precision and command-center feel
- **Cyan accent color** for interactive elements and data visualization
- **Minimalist design** with clear hierarchy and functional layouts
- **Wireframe graphics** for sophisticated visual interest
- **Status indicators** with appropriate color coding
- **Corner bracket frame** for that tactical display/surveillance monitor aesthetic
- **Terminal command syntax** with specific symbols and formatting patterns
- **Zero drop shadows** - only glows and subtle effects
- **Tight, dense layouts** with minimal padding for information density
- **CRT monitor effects** (optional) for authentic retro-future feel

Remember to maintain consistency across all components, use the defined color palette, and adhere to the spacing and typography scales for a cohesive user experience.

