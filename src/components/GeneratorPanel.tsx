import React, { useState } from 'react';
import { Sparkles, Download, Grid3x3 } from 'lucide-react';
// import { generateAffineSBox } from '../utils/sboxCrypto';
import { motion } from 'motion/react';
import { apiEndpoints } from '../utils/api';

interface GeneratorPanelProps {
  activeSBox: number[] | null;
  setActiveSBox: (sbox: number[]) => void;
  matrix: number[][] | null;
  setMatrix: (matrix: number[][] | null) => void;
  vector: number[] | null;
  setVector: (vector: number[] | null) => void;
}

export function GeneratorPanel({
  activeSBox,
  setActiveSBox,
  matrix,
  setMatrix,
  vector,
  setVector
}: GeneratorPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'xlsx' | 'txt'>('json');

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(apiEndpoints.generateSbox);
      const data = await res.json();
      setActiveSBox(data.sbox);
      setMatrix(data.affine_matrix ?? data.matrix ?? null);
      setVector(data.affine_vector ?? data.vector ?? null);
    } catch (err) {
      alert("Gagal mengambil S-box dari backend");
    }
    setIsGenerating(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoadError(null);
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
        setMatrix(data.affine_matrix ?? data.matrix ?? null);
        setVector(data.affine_vector ?? data.vector ?? null);
        setLoadError(null);
      } else {
        setLoadError('Invalid S-Box format. Expected 256 values.');
      }
    } catch (error) {
      setLoadError('Error parsing file: ' + (error as Error).message);
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleDownload = async () => {
    if (!activeSBox) return;

    try {
      const payload: {
        sbox: number[];
        format: typeof exportFormat;
        affine_matrix?: number[][];
        affine_vector?: number[];
      } = {
        sbox: activeSBox,
        format: exportFormat
      };
      if (exportFormat === 'json') {
        if (matrix) payload.affine_matrix = matrix;
        if (vector) payload.affine_vector = vector;
      }

      const res = await fetch(apiEndpoints.downloadSbox, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
                : 'Gagal download dari backend.';
        throw new Error(message);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const contentDisposition = res.headers.get('Content-Disposition') || '';
      const fileNameMatch = contentDisposition.match(/filename="([^"]+)"/);
      const fileName =
        fileNameMatch?.[1] || `cosmic-sbox-${Date.now()}.${exportFormat}`;

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setLoadError('Error download file: ' + (error as Error).message);
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl tracking-[0.2em] text-slate-100 mb-3">S-BOX GENERATOR</h2>
        <p className="text-slate-400/70 tracking-wide">
          Generate cryptographically strong substitution boxes using affine transformations
        </p>
      </div>

      {/* Generate Button */}
      <div className="flex justify-center gap-4 flex-wrap">
        <motion.button
          onClick={handleGenerate}
          disabled={isGenerating}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`group relative px-8 py-3 rounded-lg bg-gradient-to-r from-amber-500/20 to-amber-600/20 
            border border-amber-500/30 hover:border-amber-400/50
            transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <div className="flex items-center gap-3">
            <Sparkles className={`w-4 h-4 text-amber-400 ${isGenerating ? 'animate-spin' : ''}`} />
            <span className="text-sm tracking-wider text-slate-200">
              {isGenerating ? 'Generating...' : 'Generate New S-Box'}
            </span>
          </div>
        </motion.button>

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
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-cyan-500/10 to-cyan-600/10 
              border border-cyan-500/30 hover:border-cyan-400/50
              rounded-lg transition-all duration-500 text-slate-200 text-sm"
          >
            <Download className="w-3.5 h-3.5" />
            {isUploading ? 'Uploading...' : 'Use Uploaded S-Box'}
          </motion.div>
        </label>
      </div>

      {loadError && (
        <div className="text-center text-sm text-red-400/80">{loadError}</div>
      )}

      {/* Results */}
      {activeSBox && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Affine Matrix */}
          {matrix && (
            <div className="bg-white/5 rounded-lg p-6 border border-cyan-400/20">
              <div className="flex items-center gap-2 mb-4">
                <Grid3x3 className="w-4 h-4 text-cyan-400/60" />
                <h3 className="text-sm text-cyan-300/80 tracking-wider uppercase">Affine Matrix (8×8)</h3>
              </div>
              <div className="grid grid-cols-8 gap-1 font-mono text-xs">
                {matrix.map((row, i) => (
                  row.map((val, j) => (
                    <div
                      key={`${i}-${j}`}
                      className="bg-black/30 border border-cyan-500/10 p-2 text-center rounded text-cyan-200/70 
                        hover:border-cyan-400/30 hover:bg-cyan-500/5 transition-all"
                    >
                      {val}
                    </div>
                  ))
                ))}
              </div>
            </div>
          )}

          {/* Vector */}
          {vector && (
            <div className="bg-white/5 rounded-lg p-6 border border-blue-400/20">
              <h3 className="text-sm text-blue-300/80 tracking-wider uppercase mb-4">Affine Vector (8-bit)</h3>
              <div className="grid grid-cols-8 gap-2 font-mono text-sm">
                {vector.map((val, i) => (
                  <div
                    key={i}
                    className="bg-black/30 border border-blue-500/10 p-3 text-center rounded text-blue-200/70
                      hover:border-blue-400/30 hover:bg-blue-500/5 transition-all"
                  >
                    {val}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* S-Box Grid */}
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-cyan-300/80 tracking-wider uppercase">Generated S-Box (16x16)</h3>
              <div className="flex items-center gap-2">
                <select
                  aria-label="Export format"
                  value={exportFormat}
                  onChange={(event) => setExportFormat(event.target.value as typeof exportFormat)}
                  className="bg-black/40 border border-cyan-500/30 text-cyan-100/80 text-xs rounded-md px-2 py-1
                    focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                  <option value="xlsx">Excel (.xlsx)</option>
                  <option value="txt">TXT</option>
                </select>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30
                    rounded-lg hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all duration-300 text-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <div className="grid grid-cols-16 gap-0.5 font-mono text-xs min-w-max">
                {activeSBox.map((val, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.001 }}
                    className="bg-black/30 border border-white/5 p-2 text-center 
                      hover:border-cyan-400/40 hover:bg-cyan-500/5 
                      transition-all duration-200 text-cyan-100/60"
                  >
                    {val.toString(16).toUpperCase().padStart(2, '0')}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {!activeSBox && (
        <div className="text-center py-16 text-cyan-300/30">
          <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-sm">No S-Box generated yet</p>
        </div>
      )}
    </div>
  );
}
