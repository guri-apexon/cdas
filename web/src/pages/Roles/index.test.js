import React from "react";
import { mount } from "enzyme";
import RolesList from "./index.js";

test("Roles List Table component renders", () => {
  const wrapper = mount(<RolesList />);
  expect(wrapper.exists(".role-container-wrapper")).toBe(true);
});
