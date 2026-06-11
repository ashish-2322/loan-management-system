export const inferMimeType = (fileName) => {
  if (!fileName) return 'application/octet-stream';
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  return 'application/octet-stream';
};

export const getBlobFromResponse = (response, fileName) => {
  const contentType =
    response.headers['content-type'] || inferMimeType(fileName) || 'application/octet-stream';
  return new Blob([response.data], { type: contentType });
};

export const openBlobPreview = (blob) => {
  const url = window.URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  setTimeout(() => window.URL.revokeObjectURL(url), 60000);
};
