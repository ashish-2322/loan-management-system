export const formatLoanTerm = (loan) => {
  const months = loan?.loanTermMonths ?? loan?.loanTerm;
  if (months == null || months === '') {
    return '-';
  }
  return `${months} Months`;
};
