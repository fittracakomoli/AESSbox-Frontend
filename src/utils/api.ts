const API_BASE_URL: string =
    import.meta.env.VITE_API_BASE_URL ?? "https://api-sbox.vercel.app";

export const apiEndpoints = {
    status: `${API_BASE_URL}/status`,
    generateSbox: `${API_BASE_URL}/generate-sbox`,
    checkSbox: `${API_BASE_URL}/check-sbox`,
    analyzeSbox: `${API_BASE_URL}/analyze-sbox`,
    uploadSbox: `${API_BASE_URL}/upload-sbox`,
    downloadSbox: `${API_BASE_URL}/download`,
    encrypt: `${API_BASE_URL}/encrypt`,
    decrypt: `${API_BASE_URL}/decrypt`,
    encryptImage: `${API_BASE_URL}/encrypt-image`,
    decryptImage: `${API_BASE_URL}/decrypt-image`,
    aesStandard: `${API_BASE_URL}/aes-standard-sbox`,
};

export { API_BASE_URL };
