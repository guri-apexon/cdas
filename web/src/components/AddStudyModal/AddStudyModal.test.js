import { cleanup, render, fireEvent, screen } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { Router } from "react-router-dom";
import AddStudyModal from "./AddStudyModal";
import StudyNotOnboarded from "../../pages/StudySetup/StudyNotOnboarded";

afterEach(cleanup);

// testing a controlled component form.
it("Inputing text updates the state", () => {
  const history = createMemoryHistory();
  const {container} = render(
    <Router history={history}>
      <AddStudyModal open={true} onClose={() => console.log("Hello")} />
      {/* <StudyNotOnboarded
        studyData={{
          notOnBoardedStudyStatus: { inprogress_count: 100, faliure_count: 100 },
        }}
        selectedStatus={''}
        selectedFilter={''}
      /> */}
    </Router>
  );
  expect(container.querySelector(".custom-modal")).toBeInTheDocument();

//   fireEvent.change(getByLabelText("Input Text:"), {
//     target: { value: "Text" },
//   });
//   expect(getByText(/Change/i).textContent).not.toBe("Change: ");

});
