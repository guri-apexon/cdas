import React from "react";
import { mount } from "enzyme";
import VendorList from "./VendorList";

test("VendorList Table component renders", () => {
  const wrapper = mount(<VendorList />);
  expect(wrapper.exists(<table />)).toBe(true);
});
