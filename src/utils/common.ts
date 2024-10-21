const maskedId = (idCard: string) => {
  return idCard.slice(0, 10) + '****' + idCard.slice(14);
};

export { maskedId };