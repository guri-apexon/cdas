import React from "react";
import { mount } from "enzyme";
import ExistingStudyAssignment from "./ExistingStudyAssignment";

test("Rendering Nav Panel", () => {
  const wrapper = mount(<ExistingStudyAssignment />);
  expect(wrapper.exists(".existing-study-assignment")).toBe(true);
});
