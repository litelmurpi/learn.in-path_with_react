import { useEffect } from "react";

export const usePerformanceMonitor = (componentName) => {
  useEffect(() => {
    if (!import.meta.env.DEV) return;

    // Mark component mount
    performance.mark(`${componentName}-mount-start`);

    return () => {
      // Mark component unmount
      performance.mark(`${componentName}-mount-end`);

      // Measure component lifecycle
      performance.measure(
        `${componentName}-mount`,
        `${componentName}-mount-start`,
        `${componentName}-mount-end`
      );

      // Log performance data
      const measure = performance.getEntriesByName(`${componentName}-mount`)[0];
      if (measure) {
        console.log(
          `⚡ ${componentName} mounted in ${measure.duration.toFixed(2)}ms`
        );
      }

      // Clean up marks
      performance.clearMarks(`${componentName}-mount-start`);
      performance.clearMarks(`${componentName}-mount-end`);
      performance.clearMeasures(`${componentName}-mount`);
    };
  }, [componentName]);
};
