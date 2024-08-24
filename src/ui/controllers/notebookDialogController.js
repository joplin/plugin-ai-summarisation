let currLength = "6";
let currModel = "lexRank";
let currNotesSelection = "immediateChildrenNotes";

document
  .querySelectorAll('input[name="summary-length-radio-buttons"]')
  .forEach((elem) => {
    elem.addEventListener("change", function (event) {
      currLength = event.target.value;
    });
  });

document
  .querySelectorAll('input[name="summary-model-radio-buttons"]')
  .forEach((elem) => {
    elem.addEventListener("change", function (event) {
      currModel = event.target.value;
    });
  });

document
  .querySelectorAll('input[name="summary-notebook-option"]')
  .forEach((elem) => {
    elem.addEventListener("change", function (event) {
      currNotesSelection = event.target.value;
    });
  });