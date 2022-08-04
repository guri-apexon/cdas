const securedPaths = [
  {
    url: "/v1/api/vendor/create",
    methods: ["post"],
    feature: "Vendor Management",
    checkModificationPermission: true,
  },
  {
    url: "/v1/api/vendor/list",
    methods: ["get"],
    feature: "Vendor Management",
    checkModificationPermission: false,
  },
];
exports.securedPaths = securedPaths;
