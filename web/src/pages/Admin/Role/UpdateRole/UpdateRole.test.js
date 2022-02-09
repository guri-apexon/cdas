import React from "react";
import { mount } from "enzyme";
import UpdateRole from "./UpdateRole";

test("Rendering UpdateRole component", () => {
  const wrapper = mount(<UpdateRole />);
  expect(wrapper.exists(".create-role-wrapper")).toBe(true);
});
