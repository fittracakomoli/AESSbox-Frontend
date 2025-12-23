import { useState, useEffect } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { motion } from 'motion/react';
// import { aesEncrypt, aesDecrypt } from '../utils/aes';
import { apiEndpoints } from '../utils/api';

interface CipherPanelProps {
  activeSBox: number[] | null;
}

export function CipherPanel({ activeSBox }: CipherPanelProps) {
  const [standardSBox, setStandardSBox] = useState<number[] | null>(null);
  // Fetch AES standard S-box from backend on mount
  useEffect(() => {
    fetch(apiEndpoints.aesStandard)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.sbox) && data.sbox.length === 256) {
          setStandardSBox(data.sbox);
        }
      })
      .catch(() => setStandardSBox(null));
  }, []);

  const [plaintext, setPlaintext] = useState('');
  const [encryptKey, setEncryptKey] = useState('');
  const [encryptCiphertext, setEncryptCiphertext] = useState('');

  const [decryptCiphertext, setDecryptCiphertext] = useState('');
  const [decryptKey, setDecryptKey] = useState('');
  const [decrypted, setDecrypted] = useState('');

  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [useCustomSBox, setUseCustomSBox] = useState(true);

  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [imageMimeType, setImageMimeType] = useState('image/png');
  const [imageFilename, setImageFilename] = useState('');
  const [imageFileSize, setImageFileSize] = useState<number | null>(null);
  const [imageEncryptKey, setImageEncryptKey] = useState('');
  const [imageEncryptedBase64, setImageEncryptedBase64] = useState('');
  const [imageEncryptedMimeType, setImageEncryptedMimeType] = useState('image/png');
  const [isImageEncrypting, setIsImageEncrypting] = useState(false);

  const [imageCiphertextBase64, setImageCiphertextBase64] = useState('');
  const [imageDecryptKey, setImageDecryptKey] = useState('');
  const [imageDecryptMimeType, setImageDecryptMimeType] = useState('image/png');
  const [imageDecryptedBase64, setImageDecryptedBase64] = useState('');
  const [encryptedPreviewUrl, setEncryptedPreviewUrl] = useState('');
  const [encryptedFilename, setEncryptedFilename] = useState('');
  const [encryptedFileSize, setEncryptedFileSize] = useState<number | null>(null);
  const [isImageDecrypting, setIsImageDecrypting] = useState(false);

  const handleImageSelect = (file: File | null) => {
    if (!file) {
      setImagePreviewUrl('');
      setImageBase64('');
      setImageFilename('');
      setImageFileSize(null);
      setImageEncryptedBase64('');
      setImageEncryptedMimeType('image/png');
      setImageCiphertextBase64('');
      setImageDecryptedBase64('');
      setEncryptedPreviewUrl('');
      setEncryptedFilename('');
      setEncryptedFileSize(null);
      return;
    }
    setImageFilename(file.name);
    setImageFileSize(file.size);
    setImageMimeType(file.type || 'image/png');
    setImageDecryptMimeType(file.type || 'image/png');
    setImageEncryptedBase64('');
    setImageEncryptedMimeType('image/png');
    setImageCiphertextBase64('');
    setImageDecryptedBase64('');
    setEncryptedPreviewUrl('');
    setEncryptedFilename('');
    setEncryptedFileSize(null);

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setImagePreviewUrl(result);
      const commaIndex = result.indexOf(',');
      setImageBase64(commaIndex >= 0 ? result.slice(commaIndex + 1) : '');
    };
    reader.readAsDataURL(file);
  };

  const formatBytes = (bytes: number | null) => {
    if (!bytes && bytes !== 0) return '-';
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  const downloadBase64File = (base64: string, filename: string, mimeType = 'application/octet-stream') => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleEncryptedImageSelect = (file: File | null) => {
    if (!file) {
      setEncryptedPreviewUrl('');
      setEncryptedFilename('');
      setEncryptedFileSize(null);
      setImageCiphertextBase64('');
      setImageDecryptedBase64('');
      return;
    }

    setEncryptedFilename(file.name);
    setEncryptedFileSize(file.size);
    setImageDecryptMimeType(file.type || 'image/png');
    setImageDecryptedBase64('');

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setEncryptedPreviewUrl(result);
      const commaIndex = result.indexOf(',');
      setImageCiphertextBase64(commaIndex >= 0 ? result.slice(commaIndex + 1) : '');
    };
    reader.readAsDataURL(file);
  };

  const buildEncryptedFilename = (original: string) => {
    if (!original) return 'encrypted-image.png';
    const dotIndex = original.lastIndexOf('.');
    const base = dotIndex > 0 ? original.slice(0, dotIndex) : original;
    return `${base}-encrypted.png`;
  };

  const buildDecryptedFilename = (original: string) => {
    if (!original) return 'decrypted-image.png';
    const dotIndex = original.lastIndexOf('.');
    const base = dotIndex > 0 ? original.slice(0, dotIndex) : original;
    return `${base}-decrypted.png`;
  };

  const handleEncrypt = async () => {
    if (!plaintext || !encryptKey) {
      alert('Please provide both plaintext and key');
      return;
    }
    if (encryptKey.length !== 16) {
      alert('Key harus 16 karakter!');
      return;
    }
    setIsEncrypting(true);
    try {
      const selectedSBox = useCustomSBox ? activeSBox : standardSBox;
      if (!selectedSBox || selectedSBox.length !== 256) {
        alert('S-Box belum siap. Generate custom atau gunakan AES default dari backend.');
        setIsEncrypting(false);
        return;
      }
      const res = await fetch(apiEndpoints.encrypt, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plaintext,
          key: encryptKey,
          sbox: selectedSBox
        })
      });
      const data = await res.json();
      setEncryptCiphertext(data.result);
    } catch (err) {
      alert('Encryption error: ' + (err as Error).message);
    }
    setIsEncrypting(false);
  };

  const handleDecrypt = async () => {
    if (!decryptCiphertext || !decryptKey) {
      alert('Please provide both ciphertext and key');
      return;
    }
    if (decryptKey.length !== 16) {
      alert('Key harus 16 karakter!');
      return;
    }
    setIsDecrypting(true);
    try {
      const selectedSBox = useCustomSBox ? activeSBox : standardSBox;
      if (!selectedSBox || selectedSBox.length !== 256) {
        alert('S-Box belum siap. Generate custom atau gunakan AES default dari backend.');
        setIsDecrypting(false);
        return;
      }
      const res = await fetch(apiEndpoints.decrypt, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ciphertext: decryptCiphertext,
          key: decryptKey,
          sbox: selectedSBox
        })
      });
      const data = await res.json();
      setDecrypted(data.result);
    } catch (err) {
      alert('Decryption error: ' + (err as Error).message);
    }
    setIsDecrypting(false);
  };

  const handleImageEncrypt = async () => {
    if (!imageBase64 || !imageEncryptKey) {
      alert('Please provide an image and key');
      return;
    }
    if (imageEncryptKey.length !== 16) {
      alert('Key harus 16 karakter!');
      return;
    }
    setIsImageEncrypting(true);
    try {
      const selectedSBox = useCustomSBox ? activeSBox : standardSBox;
      if (!selectedSBox || selectedSBox.length !== 256) {
        alert('S-Box belum siap. Generate custom atau gunakan AES default dari backend.');
        setIsImageEncrypting(false);
        return;
      }
      const res = await fetch(apiEndpoints.encryptImage, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_base64: imageBase64,
          key: imageEncryptKey,
          sbox: selectedSBox,
          mime_type: imageMimeType,
          filename: imageFilename
        })
      });
      const data = await res.json();
      setImageEncryptedBase64(data.result);
      const nextMimeType = data.mime_type || 'image/png';
      setImageEncryptedMimeType(nextMimeType);
      setImageDecryptMimeType(nextMimeType);
    } catch (err) {
      alert('Image encryption error: ' + (err as Error).message);
    }
    setIsImageEncrypting(false);
  };

  const handleImageDecrypt = async () => {
    if (!imageCiphertextBase64 || !imageDecryptKey) {
      alert('Please provide ciphertext and key');
      return;
    }
    if (imageDecryptKey.length !== 16) {
      alert('Key harus 16 karakter!');
      return;
    }
    setIsImageDecrypting(true);
    try {
      const selectedSBox = useCustomSBox ? activeSBox : standardSBox;
      if (!selectedSBox || selectedSBox.length !== 256) {
        alert('S-Box belum siap. Generate custom atau gunakan AES default dari backend.');
        setIsImageDecrypting(false);
        return;
      }
      const res = await fetch(apiEndpoints.decryptImage, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ciphertext_base64: imageCiphertextBase64,
          key: imageDecryptKey,
          sbox: selectedSBox,
          mime_type: imageDecryptMimeType
        })
      });
      const data = await res.json();
      setImageDecryptedBase64(data.result);
      if (data.mime_type) {
        setImageDecryptMimeType(data.mime_type);
      }
    } catch (err) {
      alert('Image decryption error: ' + (err as Error).message);
    }
    setIsImageDecrypting(false);
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl tracking-[0.2em] text-slate-100 mb-3">CIPHER DEMO</h2>
        <p className="text-slate-400/70 tracking-wide">
          AES-128 encryption with custom S-Box support
        </p>
      </div>

      {/* S-Box Selector */}
      <div className="bg-white/5 rounded-lg p-6 border border-amber-500/20">
        <h3 className="text-sm text-amber-300/80 tracking-wider uppercase mb-4">S-Box Configuration</h3>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              checked={useCustomSBox}
              onChange={() => setUseCustomSBox(true)}
              disabled={!activeSBox}
              className="w-4 h-4 accent-amber-500"
            />
            <span className={`text-sm ${useCustomSBox ? 'text-slate-200' : 'text-slate-500'}`}>
              Custom S-Box {!activeSBox && '(Generate first)'}
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              checked={!useCustomSBox}
              onChange={() => setUseCustomSBox(false)}
              className="w-4 h-4 accent-amber-500"
            />
            <span className={`text-sm ${!useCustomSBox ? 'text-slate-200' : 'text-slate-500'}`}>
              AES Standard S-Box {!standardSBox && '(Backend required)'}
            </span>
          </label>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Encryption Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 rounded-lg p-6 border border-cyan-400/20"
        >
          <div className="flex items-center gap-2 mb-5">
            <Lock className="w-4 h-4 text-cyan-400/60" />
            <h3 className="text-sm text-cyan-300/80 tracking-wider uppercase">Encryption</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="plaintext-input" className="block text-xs text-slate-400/60 mb-2 uppercase tracking-wider">Plaintext</label>
              <textarea
                id="plaintext-input"
                value={plaintext}
                onChange={(e) => setPlaintext(e.target.value)}
                placeholder="Enter message to encrypt..."
                rows={3}
                className="w-full bg-black/30 border border-slate-600/20 rounded-lg px-4 py-3 text-sm text-slate-100/80 
                  placeholder-slate-500/30 focus:outline-none focus:border-cyan-400/40 
                  transition-all resize-none"
              />
            </div>

            <div>
              <label htmlFor="key-input" className="block text-xs text-slate-400/60 mb-2 uppercase tracking-wider">Key (16 characters)</label>
              <input
                id="key-input"
                type="text"
                value={encryptKey}
                onChange={(e) => setEncryptKey(e.target.value)}
                placeholder="Enter 16-character key..."
                maxLength={16}
                className="w-full bg-black/30 border border-slate-600/20 rounded-lg px-4 py-3 text-sm text-slate-100/80 
                  placeholder-slate-500/30 focus:outline-none focus:border-cyan-400/40 transition-all"
              />
              <div className="text-xs text-cyan-400/40 mt-1.5">{encryptKey.length}/16</div>
            </div>

            <motion.button
              onClick={handleEncrypt}
              disabled={isEncrypting || !plaintext || !encryptKey}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500/10 border border-cyan-500/30
                rounded-lg hover:bg-cyan-500/20 hover:border-cyan-400/40
                transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
            >
              <Lock className={`w-4 h-4 ${isEncrypting ? 'animate-pulse' : ''}`} />
              <span>{isEncrypting ? 'Encrypting...' : 'Encrypt'}</span>
            </motion.button>

            {encryptCiphertext && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <label htmlFor="ciphertext-output" className="block text-xs text-slate-400/60 mb-2 uppercase tracking-wider">Ciphertext</label>
                <div id="ciphertext-output" className="bg-black/40 border border-cyan-400/30 rounded-lg p-4 text-sm text-cyan-200/70 break-all font-mono">
                  {encryptCiphertext}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Decryption Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 rounded-lg p-6 border border-blue-400/20"
        >
          <div className="flex items-center gap-2 mb-5">
            <Unlock className="w-4 h-4 text-blue-400/60" />
            <h3 className="text-sm text-blue-300/80 tracking-wider uppercase">Decryption</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="ciphertext-input" className="block text-xs text-blue-300/60 mb-2 uppercase tracking-wider">Ciphertext</label>
              <textarea
                id="ciphertext-input"
                value={decryptCiphertext}
                onChange={(e) => setDecryptCiphertext(e.target.value)}
                placeholder="Paste ciphertext..."
                rows={3}
                className="w-full bg-black/30 border border-blue-500/20 rounded-lg px-4 py-3 text-sm text-blue-100/80 
                  placeholder-blue-500/20 focus:outline-none focus:border-blue-400/40 
                  transition-all resize-none font-mono"
              />
            </div>

            <div>
              <label htmlFor="key-input-dec" className="block text-xs text-blue-300/60 mb-2 uppercase tracking-wider">Key</label>
              <input
                id="key-input-dec"
                type="text"
                value={decryptKey}
                onChange={(e) => setDecryptKey(e.target.value)}
                placeholder="Same key used for encryption..."
                maxLength={16}
                className="w-full bg-black/30 border border-blue-500/20 rounded-lg px-4 py-3 text-sm text-blue-100/80 
                  placeholder-blue-500/20 focus:outline-none focus:border-blue-400/40 transition-all"
              />
              <div className="text-xs text-blue-400/40 mt-1.5">{decryptKey.length}/16</div>
            </div>

            <motion.button
              onClick={handleDecrypt}
              disabled={isDecrypting || !decryptCiphertext || !decryptKey}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500/10 border border-blue-500/30
                rounded-lg hover:bg-blue-500/20 hover:border-blue-400/40
                transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
            >
              <Unlock className={`w-4 h-4 ${isDecrypting ? 'animate-pulse' : ''}`} />
              <span>{isDecrypting ? 'Decrypting...' : 'Decrypt'}</span>
            </motion.button>

            {decrypted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <label htmlFor="plaintext-output" className="block text-xs text-blue-300/60 mb-2 uppercase tracking-wider">Plaintext</label>
                <div id="plaintext-output" className="bg-black/40 border border-blue-400/30 rounded-lg p-4 text-sm text-blue-200/70 break-all">
                  {decrypted}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Encryption Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 rounded-lg p-6 border border-cyan-400/20"
        >
          <div className="flex items-center gap-2 mb-5">
            <Lock className="w-4 h-4 text-cyan-400/60" />
            <h3 className="text-sm text-cyan-300/80 tracking-wider uppercase">Image Encryption</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="rounded-lg border border-cyan-400/20 bg-black/30 p-4">
                <input
                  id="image-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageSelect(e.target.files?.[0] ?? null)}
                  className="sr-only"
                />
                <label htmlFor="image-input" className="flex items-center justify-between gap-4 cursor-pointer">
                  <div className="text-xs text-slate-300/80">
                    <div className="uppercase tracking-wider text-cyan-200/70">Image File</div>
                    <div className="text-[11px] text-slate-400/70">Drop an image or click to browse</div>
                  </div>
                  <span className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-100 hover:bg-cyan-500/20 hover:border-cyan-400/40 transition-all">
                    Browse
                  </span>
                </label>

                <div className="mt-4 grid gap-4 sm:grid-cols-[120px_1fr]">
                  <div className="flex h-28 w-28 items-center justify-center rounded-md border border-cyan-400/20 bg-black/40">
                    {imagePreviewUrl ? (
                      <img src={imagePreviewUrl} alt="Preview" className="h-24 w-24 rounded object-contain" />
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider text-cyan-200/50">No preview</span>
                    )}
                  </div>
                  <div className="space-y-2 text-xs text-cyan-100/70">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-cyan-200/50">Name</span>
                      <span className="max-w-[220px] truncate text-right text-cyan-100/80">{imageFilename || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-cyan-200/50">Type</span>
                      <span className="text-cyan-100/80">{imageMimeType || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-cyan-200/50">Size</span>
                      <span className="text-cyan-100/80">{formatBytes(imageFileSize)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="image-key-input" className="block text-xs text-slate-400/60 mb-2 uppercase tracking-wider">Key (16 characters)</label>
              <input
                id="image-key-input"
                type="text"
                value={imageEncryptKey}
                onChange={(e) => setImageEncryptKey(e.target.value)}
                placeholder="Enter 16-character key..."
                maxLength={16}
                className="w-full bg-black/30 border border-slate-600/20 rounded-lg px-4 py-3 text-sm text-slate-100/80 
                  placeholder-slate-500/30 focus:outline-none focus:border-emerald-400/40 transition-all"
              />
              <div className="text-xs text-cyan-400/40 mt-1.5">{imageEncryptKey.length}/16</div>
            </div>

            <motion.button
              onClick={handleImageEncrypt}
              disabled={isImageEncrypting || !imageBase64 || !imageEncryptKey}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500/10 border border-cyan-500/30
                rounded-lg hover:bg-cyan-500/20 hover:border-cyan-400/40
                transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
            >
              <Lock className={`w-4 h-4 ${isImageEncrypting ? 'animate-pulse' : ''}`} />
              <span>{isImageEncrypting ? 'Encrypting...' : 'Encrypt Image'}</span>
            </motion.button>

            {imageEncryptedBase64 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 space-y-4"
              >
                <label className="block text-xs text-slate-400/60 uppercase tracking-wider">Encrypted Preview</label>
                <div className="rounded-lg border border-cyan-400/20 bg-black/30 p-3">
                  <img
                    src={`data:${imageEncryptedMimeType};base64,${imageEncryptedBase64}`}
                    alt="Encrypted preview"
                    className="max-h-40 w-auto rounded"
                  />
                </div>
                <motion.button
                  onClick={() => downloadBase64File(imageEncryptedBase64, buildEncryptedFilename(imageFilename), imageEncryptedMimeType)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500/10 border border-cyan-500/30
                    rounded-lg hover:bg-cyan-500/20 hover:border-cyan-400/40
                    transition-all duration-300 text-sm"
                >
                  Download Encrypted Image
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Image Decryption Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 rounded-lg p-6 border border-blue-400/20"
        >
          <div className="flex items-center gap-2 mb-5">
            <Unlock className="w-4 h-4 text-blue-400/60" />
            <h3 className="text-sm text-blue-300/80 tracking-wider uppercase">Image Decryption</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="rounded-lg border border-blue-400/20 bg-black/30 p-4">
                <input
                  id="encrypted-image-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleEncryptedImageSelect(e.target.files?.[0] ?? null)}
                  className="sr-only"
                />
                <label htmlFor="encrypted-image-input" className="flex items-center justify-between gap-4 cursor-pointer">
                  <div className="text-xs text-slate-300/80">
                    <div className="uppercase tracking-wider text-blue-200/70">Encrypted Image</div>
                    <div className="text-[11px] text-slate-400/70">Upload encrypted image (PNG)</div>
                  </div>
                  <span className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-100 hover:bg-blue-500/20 hover:border-blue-400/40 transition-all">
                    Browse
                  </span>
                </label>

                <div className="mt-4 grid gap-4 sm:grid-cols-[120px_1fr]">
                  <div className="flex h-28 w-28 items-center justify-center rounded-md border border-blue-400/20 bg-black/40">
                    {encryptedPreviewUrl ? (
                      <img src={encryptedPreviewUrl} alt="Encrypted preview" className="h-24 w-24 rounded object-contain" />
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider text-blue-200/50">No preview</span>
                    )}
                  </div>
                  <div className="space-y-2 text-xs text-blue-100/70">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-blue-200/50">Name</span>
                      <span className="max-w-[220px] truncate text-right text-blue-100/80">{encryptedFilename || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-blue-200/50">Type</span>
                      <span className="text-blue-100/80">{imageDecryptMimeType || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-blue-200/50">Size</span>
                      <span className="text-blue-100/80">{formatBytes(encryptedFileSize)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="image-key-input-dec" className="block text-xs text-blue-300/60 mb-2 uppercase tracking-wider">Key</label>
              <input
                id="image-key-input-dec"
                type="text"
                value={imageDecryptKey}
                onChange={(e) => setImageDecryptKey(e.target.value)}
                placeholder="Same key used for encryption..."
                maxLength={16}
                className="w-full bg-black/30 border border-blue-500/20 rounded-lg px-4 py-3 text-sm text-blue-100/80 
                  placeholder-blue-500/20 focus:outline-none focus:border-blue-400/40 transition-all"
              />
              <div className="text-xs text-blue-400/40 mt-1.5">{imageDecryptKey.length}/16</div>
            </div>

            <div>
              <label htmlFor="image-mime-input" className="block text-xs text-blue-300/60 mb-2 uppercase tracking-wider">Output MIME Type</label>
              <input
                id="image-mime-input"
                type="text"
                value={imageDecryptMimeType}
                onChange={(e) => setImageDecryptMimeType(e.target.value)}
                placeholder="image/png"
                className="w-full bg-black/30 border border-blue-500/20 rounded-lg px-4 py-3 text-xs text-blue-100/80 
                  placeholder-blue-500/20 focus:outline-none focus:border-blue-400/40 transition-all"
              />
            </div>

            <motion.button
              onClick={handleImageDecrypt}
              disabled={isImageDecrypting || !imageCiphertextBase64 || !imageDecryptKey}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500/10 border border-blue-500/30
                rounded-lg hover:bg-blue-500/20 hover:border-blue-400/40
                transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
            >
              <Unlock className={`w-4 h-4 ${isImageDecrypting ? 'animate-pulse' : ''}`} />
              <span>{isImageDecrypting ? 'Decrypting...' : 'Decrypt Image'}</span>
            </motion.button>

            {imageDecryptedBase64 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 space-y-4"
              >
                <label className="block text-xs text-blue-300/60 uppercase tracking-wider">Decrypted Preview</label>
                <div className="rounded-lg border border-blue-400/20 bg-black/30 p-3">
                  <img
                    src={`data:${imageDecryptMimeType || 'image/png'};base64,${imageDecryptedBase64}`}
                    alt="Decrypted"
                    className="max-h-40 w-auto rounded"
                  />
                </div>
                <motion.button
                  onClick={() => downloadBase64File(imageDecryptedBase64, buildDecryptedFilename(imageFilename || encryptedFilename), imageDecryptMimeType || 'image/png')}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500/10 border border-blue-500/30
                    rounded-lg hover:bg-blue-500/20 hover:border-blue-400/40
                    transition-all duration-300 text-sm"
                >
                  Download Decrypted Image
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white/5 rounded-lg p-5 border border-white/10"
      >
        <h4 className="text-xs text-cyan-300/70 tracking-wider uppercase mb-3">Implementation Details</h4>
        <div className="space-y-1.5 text-xs text-cyan-300/40 leading-relaxed">
          <p>• AES-128 with 10 rounds, 128-bit block and key size</p>
          <p>• Custom S-Box integration for substitution layer modification</p>
          <p>• Symmetric encryption requires identical key for decryption</p>
          <p>• Image encryption uses Base64 for transport and download</p>
        </div>
      </motion.div>
    </div>
  );
}
