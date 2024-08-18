const dataDir = document.querySelector(".note-dialog").dataset.dataDir;
let currLength = "6";
let currModel = "lexRank";

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