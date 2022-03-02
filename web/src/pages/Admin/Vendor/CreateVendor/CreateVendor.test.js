import React from "react";
import { mount } from "enzyme";
import CreateVendor from "./CreateVendor";

test("Rendering component", () => {
  const wrapper = mount(<CreateVendor />);
  expect(wrapper.exists(".create-vendor-wrapper")).toBe(true);
});
