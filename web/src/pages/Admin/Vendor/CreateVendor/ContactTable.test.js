import React from "react";
import { mount } from "enzyme";
import ContactTable from "./ContactTable";

test("Rendering component", () => {
  const wrapper = mount(<ContactTable />);
  expect(wrapper.exists(<table />)).toBe(true);
});
