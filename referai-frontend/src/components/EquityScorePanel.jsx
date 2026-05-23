import { useEffect, useState } from "react";

const EquityScorePanel = ({ trustScore, skillMatch, networkScore, isDeiActive }) => {
  const [animatedValues, setAnimatedValues] = useState({ pow: 0, network: 0, skill: 0 });

  // Calculate proof of work score
  const proofOfWorkScore = Math.round(trustScore * 10);

  // Calculate weighted total
  const weights = {
    pow: 0.4,
    network: 0.35,
    skill: 0.25,
  };

  const totalScore = Math.round(
    proofOfWorkScore * weights.pow +
    networkScore * weights.network +
    skillMatch * weights.skill
  );

  // Animate bars on mount
  useEffect(() => {
    const timings = [100, 250, 400];
    const keys = ['pow', 'network', 'skill'];
    const values = [proofOfWorkScore, networkScore, skillMatch];

    timings.forEach((timing, idx) => {
      setTimeout(() => {
        setAnimatedValues(prev => ({
          ...prev,
          [keys[idx]]: values[idx]
        }));
      }, timing);
    });
  }, [proofOfWorkScore, networkScore, skillMatch]);

  // Bar component
  const BarItem = ({ label, animatedValue, weight, deiHighlight, icon }) => {
    const isHighlighted = isDeiActive && deiHighlight;

    return (
      <div className={`mb-6 transition-opacity duration-300 ${isHighlighted ? 'opacity-100' : isDeiActive ? 'opacity-40' : 'opacity-100'}`}>
        <div className="flex items-end justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-light-text">{label}</span>
            {isHighlighted && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                {icon} Bias-Free Signal
              </span>
            )}
          </div>
          <span className="text-lg font-bold text-brand-blue">{animatedValue}/100</span>
        </div>

        {/* Bar background */}
        <div className="w-full h-3 bg-light-border rounded-full overflow-hidden">
          {/* Animated fill */}
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              deiHighlight && isDeiActive
                ? 'bg-gradient-to-r from-green-400 to-green-600'
                : 'bg-brand-blue'
            }`}
            style={{
              width: `${animatedValue}%`,
            }}
          />
        </div>

        <div className="text-xs text-light-muted mt-1">
          {weight && `Weight: ${Math.round(weight * 100)}%`}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-light-card border border-light-border rounded-xl p-8 shadow-light-md mb-8">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-light-text mb-1">Equity Score Breakdown</h3>
        <p className="text-sm text-light-muted">
          Weighted analysis of candidate qualification metrics
        </p>
      </div>

      {/* Bars */}
      <div className="mb-6">
        <BarItem
          label="Proof of Work"
          animatedValue={animatedValues.pow}
          weight={weights.pow}
          deiHighlight={true}
          icon="✓"
        />
        <BarItem
          label="Network Strength"
          animatedValue={animatedValues.network}
          weight={weights.network}
          deiHighlight={false}
          icon="◆"
        />
        <BarItem
          label="Skill Match"
          animatedValue={animatedValues.skill}
          weight={weights.skill}
          deiHighlight={false}
          icon="★"
        />
      </div>

      {/* Final Score */}
      <div className="pt-6 border-t border-light-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-light-muted mb-1">Total Equity Score</p>
            <p className="text-3xl font-bold text-brand-blue">{totalScore}/100</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-light-muted mb-2">Confidence Level</p>
            <div className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-50 border border-blue-200">
              <span className="text-sm font-semibold text-brand-blue">
                {totalScore >= 85
                  ? '🔥 Very High'
                  : totalScore >= 70
                    ? '✓ High'
                    : totalScore >= 50
                      ? '◐ Moderate'
                      : '○ Developing'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {isDeiActive && (
        <div className="mt-6 p-4 rounded-lg bg-green-50 border border-green-200">
          <p className="text-xs font-medium text-green-700">
            ✓ DEI Mode Active: Displaying bias-free competency metrics. Personal attributes are anonymized.
          </p>
        </div>
      )}
    </div>
  );
};

export default EquityScorePanel;
