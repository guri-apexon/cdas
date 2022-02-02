import React from "react";
import { mount } from "enzyme";
import CreatePolicy from "./CreatePolicy";

const wrapper = mount(<CreatePolicy />);
test("AuditLogs component renders", () => {
  setTimeout(() => {
    expect(wrapper).toMatchSnapshot();
  });
});

test("Rendering component", () => {
  expect(wrapper.exists(".create-policy-wrapper")).toBe(true);
});
