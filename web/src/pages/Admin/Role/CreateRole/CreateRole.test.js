import React from "react";
import { mount } from "enzyme";
import CreateRole from "./CreateRole";

test("Rendering CreateRole component", () => {
  const wrapper = mount(<CreateRole />);
  expect(wrapper.exists(".create-role-wrapper")).toBe(true);
});
