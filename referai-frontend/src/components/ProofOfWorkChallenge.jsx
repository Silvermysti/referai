const ProofOfWorkChallenge = ({ candidate, onSubmit, isJudgeActive }) => {
  const missingSkill = candidate.skills_matrix.find(s => s.status === "MISSING");

  const codeTemplate = `import asyncio
from typing import Dict, Any
from enum import Enum

class OperationState(Enum):
    PENDING = "pending"
    COMMITTED = "committed"
    IDEMPOTENT = "idempotent"

class IdempotentTransaction:
    """Implements double-spend prevention via txn_id tracking"""
    
    def __init__(self):
        self.committed_txns: Dict[str, Any] = {}
        self.lock = asyncio.Lock()
    
    async def execute(self, txn_id: str, operation: callable):
        async with self.lock:
            if txn_id in self.committed_txns:
                return self.committed_txns[txn_id]
            
            result = await operation()
            self.committed_txns[txn_id] = result
            return result
    
    async def safe_payment_flow(self, user_id: str, amount: float):
        """Concrete implementation for payment safety"""
        txn_id = f"{user_id}:{amount}:{int(time.time())}"
        
        async def atomic_debit():
            return await self.debit_account(user_id, amount)
        
        return await self.execute(txn_id, atomic_debit)`;

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      {/* Phase Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-white mb-2">Phase 3: Proof-of-Work Challenge</h2>
        <p className="text-muted-secondary text-sm">
          Pending validation gap: <span className="font-semibold text-brand-blue">{missingSkill?.name}</span>
        </p>
      </div>

      {/* Challenge Description Card */}
      <div className="bg-card-surface bg-opacity-70 backdrop-blur-md rounded-lg p-5 mb-6" style={{ border: "1px solid rgba(226, 232, 240, 0.06)" }}>
        <p className="text-sm text-muted-primary leading-relaxed">
          <span className="font-semibold text-white">Micro-Challenge Brief: </span>
          {missingSkill?.proof_of_work}
        </p>
      </div>

      {/* Code Sandbox */}
      <div className="bg-canvas rounded-xl overflow-hidden mb-6 shadow-glow-purple" style={{ border: "1px solid rgba(226, 232, 240, 0.06)" }}>
        {/* Sandbox Header */}
        <div className="bg-card-surface bg-opacity-70 px-6 py-4 flex items-center justify-between" style={{ border: "1px solid rgba(226, 232, 240, 0.06)", borderBottom: "1px solid rgba(226, 232, 240, 0.06)" }}>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-xs text-muted-secondary font-mono">Python 3.11 • Monaco IDE</span>
        </div>

        {/* Code Display */}
        <div className="p-6 font-mono text-xs overflow-x-auto">
          <table className="w-full">
            <tbody>
              {codeTemplate.split('\n').map((line, idx) => (
                <tr key={idx} className="hover:bg-card-surface hover:bg-opacity-40 transition-colors">
                  <td className="text-muted-secondary select-none pr-4 text-right min-w-fit pt-0.5 pb-0.5" style={{ color: "#475569" }}>
                    {String(idx + 1).padStart(2, ' ')}
                  </td>
                  <td className="text-slate-300 pt-0.5 pb-0.5 whitespace-pre">{line || ' '}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Validation Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card-surface bg-opacity-70 backdrop-blur-md rounded-lg p-4" style={{ border: "1px solid rgba(226, 232, 240, 0.06)" }}>
          <p className="text-xs text-muted-secondary mb-2">Code Quality</p>
          <p className="text-sm font-semibold text-white">Type-Safe</p>
        </div>
        <div className="bg-card-surface bg-opacity-70 backdrop-blur-md rounded-lg p-4" style={{ border: "1px solid rgba(226, 232, 240, 0.06)" }}>
          <p className="text-xs text-muted-secondary mb-2">Concurrency Model</p>
          <p className="text-sm font-semibold text-white">Async/Await</p>
        </div>
        <div className="bg-card-surface bg-opacity-70 backdrop-blur-md rounded-lg p-4" style={{ border: "1px solid rgba(226, 232, 240, 0.06)" }}>
          <p className="text-xs text-muted-secondary mb-2">Architecture Pattern</p>
          <p className="text-sm font-semibold text-white">Idempotent Service</p>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={onSubmit}
        disabled={isJudgeActive}
        className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold text-base hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isJudgeActive ? "Processing Verification Block..." : "Submit Verification Block"}
      </button>
    </div>
  );
};

export default ProofOfWorkChallenge;
