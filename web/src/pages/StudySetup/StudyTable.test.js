import React from "react";
import { mount } from "enzyme";
import StudyTable from "./StudyTable";

const studyData = {
  studyboardData: [
    {
      protocolnumber: "UXA19251",
      sponsorname: "AERIE [US]",
      phase: "Phase 4",
      protocolstatus: "Completed",
      dateadded: "01/01/2006",
      dateedited: "01/01/2006",
      onboardingprogress: "Success",
      assignmentcount: 0,
      therapeuticarea: "ALLERGY/RESPIRATORY",
      projectcode: "UXA19251",
    },
    {
      protocolnumber: "20180290",
      sponsorname: "ADIAL PHARMACEUTICALS  [US]",
      phase: "Phase 1",
      protocolstatus: "In Development",
      dateadded: "01/01/2018",
      dateedited: "01/01/2018",
      onboardingprogress: "In Progress",
      assignmentcount: 0,
      therapeuticarea: "INFECTIOUS DISEASES",
      projectcode: "PXA71913",
    },
    {
      protocolnumber: "UXA19253",
      sponsorname: "AERAS",
      phase: "Phase 4",
      protocolstatus: "Completed",
      dateadded: "01/01/2019",
      dateedited: "01/01/2019",
      onboardingprogress: "Success",
      assignmentcount: 0,
      therapeuticarea: "PSYCHIATRY",
      projectcode: "UXA19253",
    },
    {
      protocolnumber: "20150102",
      sponsorname: "AFFIMED",
      phase: "Phase 1",
      protocolstatus: "On Hold",
      dateadded: "01/01/2020",
      dateedited: "01/01/2020",
      onboardingprogress: "In Progress",
      assignmentcount: 0,
      therapeuticarea: "INFECTIOUS DISEASE",
      projectcode: "ZWA22751",
    },
    {
      protocolnumber: "20180059",
      sponsorname: "Advaxis, Inc.",
      phase: "Phase 4",
      protocolstatus: "Completed",
      dateadded: "01/01/2021",
      dateedited: "01/01/2021",
      onboardingprogress: "Success",
      assignmentcount: 0,
      therapeuticarea: "SEXUAL HEALTH",
      projectcode: "ZWAA2751",
    },
    {
      protocolnumber: "NP-1998",
      sponsorname: "ACUSPHERE  [US]",
      phase: "Phase 3",
      protocolstatus: "On Hold",
      dateadded: "01/01/2021",
      dateedited: "01/01/2021",
      onboardingprogress: "In Progress",
      assignmentcount: 0,
      therapeuticarea: "ANTI-INFECTIVE",
      projectcode: "CXA27260",
    },
  ],
  notOnBoardedStudyStatus: {
    inprogress_count: "280",
    faliure_count: "112",
  },
  loading: false,
  exportStudy: null,
  uniqurePhase: [
    "Phase 3b",
    "",
    "Phase 1",
    "Phase 0",
    "N/A",
    "Phase 2",
    "Phase 4",
    "Phase 3",
  ],
  uniqueProtocolStatus: [
    "Planning",
    "Enrolling",
    "On Hold",
    "Proposed",
    "Closed To Enrollment",
    "Discontinued",
    "In Development",
    "Completed",
    "Closed Follow Up / In Analysis",
    "Open To Enrollment",
  ],
  studyboardFetchSuccess: true,
  studyboardFetchFailure: false,
};

// const noStudyData = {
//   studyBoardData: [],
//   uniqurePhase: [
//     "Phase 3b",
//     "",
//     "Phase 1",
//     "Phase 0",
//     "N/A",
//     "Phase 2",
//     "Phase 4",
//     "Phase 3",
//   ],
//   uniqueProtocolStatus: [
//     "Planning",
//     "Enrolling",
//     "On Hold",
//     "Proposed",
//     "Closed To Enrollment",
//     "Discontinued",
//     "In Development",
//     "Completed",
//     "Closed Follow Up / In Analysis",
//     "Open To Enrollment",
//   ],
//   studyboardFetchSuccess: false,
//   studyboardFetchFailure: true,
// };

const selectedFilter = "";

test("Study Table component renders count", () => {
  const wrapper = mount(
    <StudyTable
      studyData={studyData}
      refreshData={studyData}
      selectedFilter={selectedFilter}
    />
  );
  expect(wrapper.exists(<table />)).toBe(true);
});
