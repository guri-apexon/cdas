import React from "react";
import { mount } from "enzyme";
import PolicyList from "./PolicyList";

test("PolicyList Table component renders", () => {
  const wrapper = mount(<PolicyList />);
  expect(wrapper.exists(<table />)).toBe(true);
});
