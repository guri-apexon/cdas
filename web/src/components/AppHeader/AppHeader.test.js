import React from "react";
import { BrowserRouter } from "react-router-dom";
import { mount } from "enzyme";
import AppHeader from "./AppHeader";

test("Rendering TopNavbar", () => {
  const wrapper = mount(
    <BrowserRouter basename="/">
      <AppHeader />
    </BrowserRouter>
  );
  expect(wrapper.exists("#topNavbar")).toBe(true);
});
