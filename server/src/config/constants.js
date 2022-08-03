module.exports = Object.freeze({
  // DB_SCHEMA_NAME: "cdascfg",
  // DB_HOST: "ca2updb249vd",
  // DB_USER: "ycdas1d",
  // DB_PASS: "ycdas1d@cdas1d",
  // DB_PORT: 5433,
  // DB_DATABASE: "cdas1d",
   DB_SCHEMA_NAME: "cdascfg",
  DB_HOST: "ca2updb249vd",
  DB_USER: "ycdas2d",
  DB_PASS: "ycdas2d@cdas2d",
  DB_PORT: 5432,
  DB_DATABASE: "cdas2d",

  FSR_HEADERS: {
    ClientId: "CDI",
    ClientSecret: "h+p78ADQ8Zwo1EiJdLPU9brxYe9qo64YUYoZAVq/VSjY1IOHsE3yiQ==",
    "Content-Type": "application/json",
  },
  FSR_API_URI: "https://rds-cdrfsr-dev.gdev-car3-k8s.work.iqvia.com/fsr",
  SDA_BASE_URL: "https://dev2-sda.work.iqvia.com",
  SDA_APP_KEY: "CDAS-CORE-APP-9f3798d2-16af-45b3-be21-0d43c1cfecec",
  AD_CONFIG: {
    url: "ldap://usadc-sdc01.quintiles.net:389",
    baseDN: "dc=quintiles,dc=net",
    username: "yEDCService",
    password: "v#afJ4pk",
  },
});
