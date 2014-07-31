var parsers = {};
parsers.hostname = function (hostname) {
  var hostPieces = hostname.split('.');
  return {
    region: hostPieces.pop(),
    name: hostPieces.pop(),
    subDomain: hostPieces.pop(),
    thirdDomain: hostPieces.pop()
  };
};
module.exports = parsers;