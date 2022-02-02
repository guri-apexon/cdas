import React from "react";
import { mount } from "enzyme";
import UpdatePolicy from "./UpdatePolicy";

test("Rendering component", () => {
  const wrapper = mount(<UpdatePolicy />);
  expect(wrapper.exists(".update-policy-wrapper")).toBe(true);
});
