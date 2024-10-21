const maskedId = (idCard: string) => {
  return idCard.slice(0, 10) + '****' + idCard.slice(14);
};

const getStationSpacing = (stationText: string): number => {
  if (stationText.length == 4) {
    return -6;
  } else if (stationText.length == 3) {
    return 10;
  } else {
    return 65;
  }
}
export { maskedId, getStationSpacing };