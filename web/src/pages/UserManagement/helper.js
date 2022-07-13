const STUDY_IDS = {
  ALL_STUDY: "<all>",
  NO_STUDY: "<none>",
};

const STUDY_LABELS = {
  ALL_STUDY: "All (all study access)",
  NO_STUDY: "None (no study access)",
};

const studyOptions = [
  {
    label: STUDY_LABELS.ALL_STUDY,
    prot_id: STUDY_IDS.ALL_STUDY,
  },
  {
    label: STUDY_LABELS.NO_STUDY,
    prot_id: STUDY_IDS.NO_STUDY,
  },
];

export { studyOptions, STUDY_IDS, STUDY_LABELS };
