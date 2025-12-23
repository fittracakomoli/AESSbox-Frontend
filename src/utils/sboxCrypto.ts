// Semua S-box standard harus diambil dari backend
// export const AES_STANDARD_SBOX = [ ... ]; // Jangan gunakan array lokal

// Semua perhitungan, validasi, analisis S-box harus lewat backend
export function generateAffineSBox() {
  throw new Error('Use backend API for S-box generation');
}
export function isBijective() {
  throw new Error('Use backend API for S-box validation');
}
export function isBalanced() {
  throw new Error('Use backend API for S-box validation');
}
export function calculateNonlinearity() {
  throw new Error('Use backend API for S-box analysis');
}
export function calculateSAC() {
  throw new Error('Use backend API for S-box analysis');
}
export function calculateDAP() {
  throw new Error('Use backend API for S-box analysis');
}
