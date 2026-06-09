import React from "react";

const SkeletonKpi = ({ count = 4 }) => {
  return (
    <div className="skeleton-kpi-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-kpi-card">
          <div className="skeleton-line short" />
          <div className="skeleton-line value" />
        </div>
      ))}
    </div>
  );
};

export default SkeletonKpi;
