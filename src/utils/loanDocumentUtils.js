export const LOAN_DOCUMENT_CONFIG = {
  PERSONAL_LOAN: { type: 'SALARY_SLIP', label: 'Salary Slip' },
  HOME_LOAN: { type: 'PROPERTY_DOCUMENT', label: 'Property Document' },
  VEHICLE_LOAN: { type: 'VEHICLE_QUOTATION', label: 'Vehicle Quotation' },
};

export const getLoanDocumentConfig = (loanType) => LOAN_DOCUMENT_CONFIG[loanType] || null;

export const getDisplayFileName = (document) => {
  if (!document?.fileName) return 'document';
  const underscore = document.fileName.indexOf('_');
  if (underscore >= 0 && underscore < document.fileName.length - 1) {
    return document.fileName.substring(underscore + 1);
  }
  return document.fileName;
};
