const calculateShannonEntropy = (data) => {
  if (!data || data.length === 0) return 0;

  const freq = {};
  for (let i = 0; i < data.length; i++) {
    const char = data[i];
    freq[char] = (freq[char] || 0) + 1;
  }

  let entropy = 0;
  const len = data.length;
  for (const char in freq) {
    const probability = freq[char] / len;
    entropy -= probability * Math.log2(probability);
  }

  return entropy;
};

module.exports = { calculateShannonEntropy };
