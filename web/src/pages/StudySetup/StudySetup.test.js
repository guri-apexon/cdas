import React from "react";
import { mount } from "enzyme";
import StudySetup from "./StudySetup";

test("Rendering Nav Panel", () => {
  const wrapper = mount(<StudySetup />);
  expect(wrapper.exists(".study-setup-wrapper")).toBe(true);
});
