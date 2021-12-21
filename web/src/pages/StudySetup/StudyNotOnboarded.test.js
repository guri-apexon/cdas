import React from "react";
import { mount } from "enzyme";
import StudyNotOnboarded from "./StudyNotOnboarded";

const studyData = {
  notOnBoardedStudyStatus: { inprogress_count: 100, faliure_count: 100 },
};
const noData = {
  notOnBoardedStudyStatus: { inprogress_count: 0, faliure_count: 0 },
};
const { notOnBoardedStudyStatus } = studyData;
const selectedStatus = "";
const selectedFilter = "";

test("Not Onboarded component renders count", () => {
  const wrapper = mount(
    <StudyNotOnboarded
      studyData={studyData}
      selectedStatus={selectedStatus}
      selectedFilter={selectedFilter}
    />
  );
  const p = wrapper.find(".studies-not-onboarded p");
  expect(p.text()).toBe(
    `Studies Not Onboarded (${
      notOnBoardedStudyStatus.inprogress_count +
      notOnBoardedStudyStatus.faliure_count
    })`
  );
});

test("Check Inprogress count", () => {
  const wrapper = mount(
    <StudyNotOnboarded
      studyData={studyData}
      selectedStatus={selectedStatus}
      selectedFilter={selectedFilter}
    />
  );
  const h3 = wrapper.find(".studies-not-onboarded .in-progress-box h3");
  expect(h3.text()).toBe(
    `${notOnBoardedStudyStatus.inprogress_count} In-progress`
  );
});

test("Check failures count", () => {
  const wrapper = mount(
    <StudyNotOnboarded
      studyData={studyData}
      selectedStatus={selectedStatus}
      selectedFilter={selectedFilter}
    />
  );
  const h3 = wrapper.find(".studies-not-onboarded .failure-box h3");
  expect(h3.text()).toBe(`${notOnBoardedStudyStatus.faliure_count} Failures`);
});

test("Check Accordian is expanded when count more than 0", () => {
  const wrapper = mount(
    <StudyNotOnboarded
      studyData={studyData}
      selectedStatus={selectedStatus}
      selectedFilter={selectedFilter}
    />
  );
  expect(wrapper.exists(".Mui-expanded")).toBe(true);
});

test("Check Accordian is expanded when count is 0", () => {
  const wrapper = mount(
    <StudyNotOnboarded
      studyData={noData}
      selectedStatus={selectedStatus}
      selectedFilter={selectedFilter}
    />
  );
  expect(wrapper.exists(".Mui-expanded")).toBe(false);
});
