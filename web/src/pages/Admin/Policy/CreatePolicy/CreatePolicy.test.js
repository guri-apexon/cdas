import React from "react";
import { mount } from "enzyme";
import axios from "axios";
import { render, cleanup, waitForElement } from "@testing-library/react";
import CreatePolicy from "./CreatePolicy";

// jest.mock('axios');

afterEach(cleanup);

test("renders hello correctly", () => {
  // axios.get.mockResolvedValue({
  //   data: [
  //     { id: 1, title: "post one" },
  //     { id: 2, title: "post two" },
  //   ],
  // });
  // const { asFragment } = render(wrapper);

  // const listNode = await waitForElement(() =>
  //   wrapper.find(".create-policy-wrapper")
  // );
  // expect(listNode.children).toHaveLength(1);
  // expect(asFragment()).toMatchSnapshot();
  const wrapper = mount(<CreatePolicy />);
  expect(wrapper.exists(".create-policy-wrapper")).toBe(true);
});

// test("Rendering component", () => {
//   expect(wrapper.exists(".create-policy-wrapper")).toBe(true);
// });
