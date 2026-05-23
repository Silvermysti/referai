import { useState, useEffect } from "react";

const NetworkGraph = ({ candidate, alumnus, isVisible }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setTimeout(() => setIsAnimating(true), 100);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const candidateLabel = candidate?.anonymous_id || "Candidate";
  const alumnusLabel = alumnus?.alumnus_name || "Alumni Hub";
  const targetLabel = alumnus?.alumnus_company || candidate?.target_company || "Target Corp";

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      {/* Section Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">Topological Affinity Graph</h3>
        <p className="text-xs text-muted-secondary">Routing optimized based on historical referral success patterns</p>
      </div>

      {/* Graph Container */}
      <div className="bg-card-surface bg-opacity-70 backdrop-blur-md rounded-xl p-8" style={{ border: "1px solid rgba(226, 232, 240, 0.06)" }}>
        {/* SVG Visualization */}
        <svg viewBox="0 0 600 300" className="w-full h-auto">
          {/* Connection Line */}
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>

          {/* Animated Path */}
          <line
            x1="80"
            y1="150"
            x2="520"
            y2="150"
            stroke="url(#lineGradient)"
            strokeWidth="2"
            opacity={isAnimating ? 1 : 0}
            style={{
              transition: "opacity 600ms ease-out",
              strokeDasharray: 440,
              strokeDashoffset: isAnimating ? 0 : 440,
              transitionProperty: "stroke-dashoffset",
              transitionDuration: "800ms"
            }}
          />

          {/* Candidate Node (Left) */}
          <g>
            <circle
              cx="80"
              cy="150"
              r="24"
              fill="#111827"
              stroke="#4F46E5"
              strokeWidth="2"
              opacity={isAnimating ? 1 : 0}
              style={{ transition: "opacity 400ms ease-out" }}
            />
            <text
              x="80"
              y="155"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="12"
              fontWeight="bold"
              opacity={isAnimating ? 1 : 0}
              style={{ transition: "opacity 400ms ease-out" }}
            >
              C
            </text>
          </g>

          {/* Alumni Hub (Center) */}
          <g>
            <circle
              cx="300"
              cy="150"
              r="28"
              fill="#111827"
              stroke="#7C3AED"
              strokeWidth="2"
              opacity={isAnimating ? 1 : 0}
              style={{ transition: "opacity 500ms ease-out" }}
            />
            <circle
              cx="300"
              cy="150"
              r="20"
              fill="none"
              stroke="#7C3AED"
              strokeWidth="1"
              opacity={isAnimating ? 0.3 : 0}
              style={{
                transition: "opacity 500ms ease-out",
                animation: isAnimating ? "pulse 2s infinite" : "none"
              }}
            />
            <text
              x="300"
              y="155"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="12"
              fontWeight="bold"
              opacity={isAnimating ? 1 : 0}
              style={{ transition: "opacity 500ms ease-out" }}
            >
              A
            </text>
          </g>

          {/* Target Node (Right) */}
          <g>
            <circle
              cx="520"
              cy="150"
              r="24"
              fill="#111827"
              stroke="#2563EB"
              strokeWidth="2"
              opacity={isAnimating ? 1 : 0}
              style={{ transition: "opacity 600ms ease-out" }}
            />
            <text
              x="520"
              y="155"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="12"
              fontWeight="bold"
              opacity={isAnimating ? 1 : 0}
              style={{ transition: "opacity 600ms ease-out" }}
            >
              T
            </text>
          </g>

          {/* Labels */}
          <text
            x="80"
            y="190"
            textAnchor="middle"
            fill="#94A3B8"
            fontSize="11"
            opacity={isAnimating ? 1 : 0}
            style={{ transition: "opacity 400ms ease-out 200ms" }}
          >
            {candidateLabel}
          </text>

          <text
            x="300"
            y="190"
            textAnchor="middle"
            fill="#94A3B8"
            fontSize="11"
            opacity={isAnimating ? 1 : 0}
            style={{ transition: "opacity 500ms ease-out 300ms" }}
          >
            {alumnusLabel}
          </text>

          <text
            x="520"
            y="190"
            textAnchor="middle"
            fill="#94A3B8"
            fontSize="11"
            opacity={isAnimating ? 1 : 0}
            style={{ transition: "opacity 600ms ease-out 400ms" }}
          >
            {targetLabel}
          </text>

          {/* Tier Badge */}
          <rect
            x="220"
            y="110"
            width="160"
            height="24"
            rx="12"
            fill="#111827"
            stroke="#4F46E5"
            opacity={isAnimating ? 0.8 : 0}
            style={{ transition: "opacity 700ms ease-out 400ms" }}
          />
          <text
            x="300"
            y="128"
            textAnchor="middle"
            fill="#93C5FD"
            fontSize="10"
            fontWeight="bold"
            opacity={isAnimating ? 1 : 0}
            style={{ transition: "opacity 700ms ease-out 400ms" }}
          >
            Tier 1 (High-Conversion Path)
          </text>
        </svg>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { r: 20; opacity: 0.3; }
          50% { r: 24; opacity: 0.1; }
        }
      `}</style>
    </div>
  );
};

export default NetworkGraph;
