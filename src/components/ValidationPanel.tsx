import { useState, useEffect } from 'react';
import { Upload, CheckCircle, XCircle, Activity, Zap, Shield, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';
// import {
//   isBijective,
//   isBalanced,
//   calculateNonlinearity,
//   calculateSAC,
//   calculateDAP
// } from '../utils/sboxCrypto';
import { apiEndpoints } from '../utils/api';

interface ValidationPanelProps {
  activeSBox: number[] | null;
  setActiveSBox: (sbox: number[]) => void;
}

interface Metrics {
  nonlinearity: number;
  sac: number;
  dap: number;
  lap: number;
  bicNl: number;
  bicSac: number;
  du: number;
  ad: number;
  to: number;
  ci: number;
}

export function ValidationPanel({ activeSBox, setActiveSBox }: ValidationPanelProps) {
  const [isBijectiveValid, setIsBijectiveValid] = useState<boolean | null>(null);
  const [isBalancedValid, setIsBalancedValid] = useState<boolean | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (activeSBox) {
      analyzeActiveSBox();
    } else {
      resetValidation();
    }
  }, [activeSBox]);

  const resetValidation = () => {
    setIsBijectiveValid(null);
    setIsBalancedValid(null);
    setMetrics(null);
  };

  const analyzeActiveSBox = async () => {
    if (!activeSBox) return;
    setIsAnalyzing(true);
    try {
      // Validasi
      const resCheck = await fetch(apiEndpoints.checkSbox, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sbox: activeSBox })
      });
      const checkData = await resCheck.json();
      setIsBijectiveValid(checkData.is_bijective ?? checkData.bijective);
      setIsBalancedValid(checkData.is_balanced ?? checkData.balanced);

      // Analisis
      const resAnalysis = await fetch(apiEndpoints.analyzeSbox, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sbox: activeSBox })
      });
      const analysisData = await resAnalysis.json();
      setMetrics({
        nonlinearity: analysisData.nl ?? analysisData.nonlinearity ?? 0,
        sac: analysisData.sac ?? 0,
        dap: analysisData.dap ?? 0,
        lap: analysisData.lap ?? 0,
        bicNl: analysisData.bic_nl ?? analysisData.bicNl ?? 0,
        bicSac: analysisData.bic_sac ?? analysisData.bicSac ?? 0,
        du: analysisData.du ?? analysisData.differential_uniformity ?? 0,
        ad: analysisData.ad ?? analysisData.algebraic_degree ?? 0,
        to: analysisData.to ?? analysisData.transparency_order ?? 0,
        ci: analysisData.ci ?? analysisData.correlation_immunity ?? 0
      });
    } catch (err) {
      alert("Gagal validasi/analisis S-box dari backend");
    }
    setIsAnalyzing(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(apiEndpoints.uploadSbox, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const detail = errorData?.detail;
        const message =
          typeof detail === 'string'
            ? detail
            : detail
              ? JSON.stringify(detail)
              : errorData
                ? JSON.stringify(errorData)
                : 'Gagal memproses file di backend.';
        throw new Error(message);
      }

      const data = await res.json();
      if (Array.isArray(data?.sbox) && data.sbox.length === 256) {
        setActiveSBox(data.sbox);
      } else {
        setUploadError('Invalid S-Box format. Expected 256 values.');
      }
    } catch (error) {
      setUploadError('Error parsing file: ' + (error as Error).message);
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };


  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl tracking-[0.2em] text-slate-100 mb-3">S-BOX VALIDATION</h2>
        <p className="text-slate-400/70 tracking-wide">
          Analyze cryptographic properties and security metrics
        </p>
      </div>

      {/* Upload Section */}
      <div className="flex justify-center">
        <label className="cursor-pointer">
          <input
            type="file"
            accept=".json,.csv,.txt,.xlsx"
            onChange={handleFileUpload}
            className="hidden"
          />
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-500/20 to-amber-600/20 
              border border-amber-500/30 hover:border-amber-400/50
              rounded-lg transition-all duration-500"
          >
            <Upload className="w-4 h-4 text-amber-400" />
            <span className="text-sm tracking-wider text-slate-200">
              {isUploading ? 'Uploading...' : 'Upload S-Box'}
            </span>
          </motion.div>
        </label>
      </div>

      {uploadError && (
        <div className="text-center text-sm text-red-400/80">{uploadError}</div>
      )}

      {/* Validation Status */}
      {activeSBox && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 gap-4"
        >
          {/* Bijective Check */}
          <div className="bg-white/5 rounded-lg p-6 border border-cyan-400/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-cyan-300/80 tracking-wider uppercase mb-1">Bijective</h3>
                <p className="text-xs text-cyan-300/40">One-to-one mapping</p>
              </div>
              {isBijectiveValid !== null && (
                isBijectiveValid ? (
                  <CheckCircle className="w-6 h-6 text-green-400/80" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-400/80" />
                )
              )}
            </div>
          </div>

          {/* Balance Check */}
          <div className="bg-white/5 rounded-lg p-6 border border-blue-400/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-blue-300/80 tracking-wider uppercase mb-1">Balance</h3>
                <p className="text-xs text-blue-300/40">Equal bit distribution</p>
              </div>
              {isBalancedValid !== null && (
                isBalancedValid ? (
                  <CheckCircle className="w-6 h-6 text-green-400/80" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-400/80" />
                )
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Cryptographic Metrics */}
      {metrics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h3 className="text-center text-sm tracking-widest text-cyan-200/70 uppercase">
            Cryptographic Analysis
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Nonlinearity */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white/5 rounded-lg p-6 border border-cyan-400/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                  <Zap className="w-5 h-5 text-cyan-400/70" />
                </div>
              </div>
              <h4 className="text-xs text-cyan-300/70 tracking-wider uppercase mb-2">Nonlinearity</h4>
              <div className="text-2xl text-cyan-100/90 mb-2">{metrics.nonlinearity}</div>
              <p className="text-xs text-cyan-300/40 leading-relaxed">
                Linear cryptanalysis resistance
              </p>
              <div className="mt-3 h-1 bg-black/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(metrics.nonlinearity / 112) * 100}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-cyan-400/50 to-cyan-400"
                />
              </div>
            </motion.div>

            {/* SAC */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white/5 rounded-lg p-6 border border-blue-400/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <Activity className="w-5 h-5 text-blue-400/70" />
                </div>
              </div>
              <h4 className="text-xs text-blue-300/70 tracking-wider uppercase mb-2">SAC Score</h4>
              <div className="text-2xl text-blue-100/90 mb-2">{metrics.sac.toFixed(4)}</div>
              <p className="text-xs text-blue-300/40 leading-relaxed">
                Bit flip propagation
              </p>
              <div className="mt-3 h-1 bg-black/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${metrics.sac * 100}%` }}
                  transition={{ duration: 1, delay: 0.4 }}
                  className="h-full bg-gradient-to-r from-blue-400/50 to-blue-400"
                />
              </div>
            </motion.div>

            {/* DAP */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white/5 rounded-lg p-6 border border-sky-400/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                  <Shield className="w-5 h-5 text-sky-400/70" />
                </div>
              </div>
              <h4 className="text-xs text-sky-300/70 tracking-wider uppercase mb-2">DAP</h4>
              <div className="text-2xl text-sky-100/90 mb-2">{metrics.dap.toFixed(6)}</div>
              <p className="text-xs text-sky-300/40 leading-relaxed">
                Differential probability
              </p>
              <div className="mt-3 h-1 bg-black/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(1 - Math.min(metrics.dap, 0.2) / 0.2) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-sky-400/50 to-sky-400"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {metrics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-4"
        >
          <h3 className="text-center text-sm tracking-widest text-cyan-200/70 uppercase">
            Extended Metrics
          </h3>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-lg p-4 border border-cyan-400/20">
              <h4 className="text-xs text-cyan-300/70 tracking-wider uppercase mb-2">BIC-NL</h4>
              <div className="text-xl text-cyan-100/90">{metrics.bicNl}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-blue-400/20">
              <h4 className="text-xs text-blue-300/70 tracking-wider uppercase mb-2">BIC-SAC</h4>
              <div className="text-xl text-blue-100/90">{metrics.bicSac.toFixed(4)}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-sky-400/20">
              <h4 className="text-xs text-sky-300/70 tracking-wider uppercase mb-2">LAP</h4>
              <div className="text-xl text-sky-100/90">{metrics.lap.toFixed(6)}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-slate-400/20">
              <h4 className="text-xs text-slate-300/70 tracking-wider uppercase mb-2">DU</h4>
              <div className="text-xl text-slate-100/90">{metrics.du}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-emerald-400/20">
              <h4 className="text-xs text-emerald-300/70 tracking-wider uppercase mb-2">AD</h4>
              <div className="text-xl text-emerald-100/90">{metrics.ad}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-amber-400/20">
              <h4 className="text-xs text-amber-300/70 tracking-wider uppercase mb-2">TO</h4>
              <div className="text-xl text-amber-100/90">{metrics.to.toFixed(6)}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-fuchsia-400/20">
              <h4 className="text-xs text-fuchsia-300/70 tracking-wider uppercase mb-2">CI</h4>
              <div className="text-xl text-fuchsia-100/90">{metrics.ci}</div>
            </div>
          </div>
        </motion.div>
      )}

      {!activeSBox && (
        <div className="text-center py-16 text-cyan-300/30">
          <Shield className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-sm">No S-Box loaded</p>
        </div>
      )}

      {isAnalyzing && (
        <div className="text-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 mx-auto mb-4"
          >
            <Activity className="w-10 h-10 text-cyan-400/60" />
          </motion.div>
          <p className="text-sm text-cyan-300/50">Analyzing properties...</p>
        </div>
      )}
    </div>
  );
}
