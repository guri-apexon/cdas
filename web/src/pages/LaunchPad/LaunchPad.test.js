import React from "react";
import { mount } from "enzyme";
import LaunchPad from "./LaunchPad";

test("Rendering Progress bar component", () => {
  const wrapper = mount(<LaunchPad />);
  expect(wrapper.exists(".lauchpad-wrapper")).toBe(true);
});
