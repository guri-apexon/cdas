import { cleanup, render, fireEvent, screen } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { Router } from "react-router-dom";
import AddStudyModal from "./AddStudyModal";

// describe("Flatten tests:", () => {
//   it("Flattens an array.", () => {
//     const nestedArray = [[1, 2, 3], [4]];
//     const flatArray = [1, 2, 3, 4];
//     expect(flatten(nestedArray)).toEqual(flatArray);
//   });
//   it("Returns empty array when the input is an empty array.", () => {
//     const array = [];
//     const result = flatten(array);
//     const expectedResult = [];
//     expect(result).toEqual(expectedResult);
//   });
// });

afterEach(cleanup);

// testing a controlled component form.
it("Inputing text updates the state", () => {
// const { getByText, getByPlaceholderText } = render(<AddStudyModal />);
  const history = createMemoryHistory();
  render(
    <Router history={history}>
      <AddStudyModal />
    </Router>
  );
  expect(screen.getByText(/Search for a study/i).textContent).toBe("Search for a study");

//   fireEvent.change(getByLabelText("Input Text:"), {
//     target: { value: "Text" },
//   });

//   expect(getByText(/Change/i).textContent).not.toBe("Change: ");
});
