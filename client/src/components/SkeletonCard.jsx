import React from "react";

const SkeletonCard = ({ lines = 3, height = "auto" }) => {
  return (
    <div className="skeleton-card" style={{ height }}>
      <div className="skeleton-header">
        <div className="skeleton-line title" />
        <div className="skeleton-badge" />
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton-line"
          style={{ width: `${80 - i * 10}%` }}
        />
      ))}
      <div className="skeleton-btn" />
    </div>
  );
};

export default SkeletonCard;
