/**
 * Memory Monitor Utility
 * 
 * Helps detect memory leaks during development by periodically logging
 * memory usage and React state sizes.
 */

export interface MemoryStats {
  heapUsed: number;
  heapTotal: number;
  heapLimit: number;
  percentUsed: number;
  timestamp: string;
}

export class MemoryMonitor {
  private intervalId: NodeJS.Timeout | null = null;
  private stats: MemoryStats[] = [];
  private readonly maxStats = 100; // Keep last 100 measurements

  /**
   * Start monitoring memory usage
   * @param intervalMs How often to check memory (default: 30 seconds)
   */
  start(intervalMs: number = 30000) {
    if (typeof window === 'undefined') return;
    if (this.intervalId) return; // Already running

    // Check if Performance Memory API is available (Chrome/Edge)
    if (!('memory' in performance)) {
      console.warn('⚠️  Memory monitoring not available in this browser');
      return;
    }

    console.log('🔍 Memory monitoring started (interval:', intervalMs / 1000, 'seconds)');

    this.intervalId = setInterval(() => {
      this.checkMemory();
    }, intervalMs);

    // Initial check
    this.checkMemory();
  }

  /**
   * Stop monitoring
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 Memory monitoring stopped');
    }
  }

  /**
   * Get current memory stats
   */
  private checkMemory() {
    if (typeof window === 'undefined' || !('memory' in performance)) return;

    const memory = (performance as any).memory;
    
    const stats: MemoryStats = {
      heapUsed: memory.usedJSHeapSize,
      heapTotal: memory.totalJSHeapSize,
      heapLimit: memory.jsHeapSizeLimit,
      percentUsed: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      timestamp: new Date().toISOString(),
    };

    // Store stats
    this.stats.push(stats);
    if (this.stats.length > this.maxStats) {
      this.stats.shift();
    }

    // Log summary
    const mb = (bytes: number) => (bytes / 1024 / 1024).toFixed(2);
    
    console.log(
      `📊 Memory: ${mb(stats.heapUsed)}MB / ${mb(stats.heapLimit)}MB (${stats.percentUsed.toFixed(1)}%)`
    );

    // Warn if memory usage is high
    if (stats.percentUsed > 80) {
      console.warn(
        `⚠️  HIGH MEMORY USAGE: ${stats.percentUsed.toFixed(1)}% - Potential memory leak!`
      );
    }

    // Detect rapid growth (potential leak)
    if (this.stats.length >= 10) {
      const recent10 = this.stats.slice(-10);
      const firstUsage = recent10[0].heapUsed;
      const lastUsage = recent10[recent10.length - 1].heapUsed;
      const growthMB = (lastUsage - firstUsage) / 1024 / 1024;
      
      if (growthMB > 50) {
        console.warn(
          `⚠️  RAPID MEMORY GROWTH: +${growthMB.toFixed(2)}MB in last 10 checks - Likely memory leak!`
        );
      }
    }
  }

  /**
   * Get memory growth trend
   */
  getTrend(): { growthRate: number; isLeaking: boolean } {
    if (this.stats.length < 5) {
      return { growthRate: 0, isLeaking: false };
    }

    const recent = this.stats.slice(-5);
    const first = recent[0].heapUsed;
    const last = recent[recent.length - 1].heapUsed;
    const growthRate = (last - first) / 1024 / 1024; // MB

    return {
      growthRate,
      isLeaking: growthRate > 20, // More than 20MB growth is suspicious
    };
  }

  /**
   * Get all collected stats
   */
  getStats(): MemoryStats[] {
    return [...this.stats];
  }

  /**
   * Clear collected stats
   */
  clearStats() {
    this.stats = [];
  }
}

// Singleton instance
let monitorInstance: MemoryMonitor | null = null;

/**
 * Get or create the global memory monitor instance
 */
export function getMemoryMonitor(): MemoryMonitor {
  if (!monitorInstance) {
    monitorInstance = new MemoryMonitor();
  }
  return monitorInstance;
}

/**
 * Enable memory monitoring in development mode
 */
export function enableMemoryMonitoring(intervalMs: number = 30000) {
  if (process.env.NODE_ENV === 'development') {
    const monitor = getMemoryMonitor();
    monitor.start(intervalMs);
    
    // Stop monitoring when page unloads
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        monitor.stop();
      });
    }
  }
}

