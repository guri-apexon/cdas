export const getUrl = (apiPath) => {
  return (
    window.location.protocol +
    "//" +
    window.location.hostname +
    ":4000" +
    apiPath
  );
};
