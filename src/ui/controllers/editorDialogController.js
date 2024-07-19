const dataDir = document.querySelector(".note-dialog").dataset.dataDir;
let currLength = "6";
let currModel = "lexRank";

(() => {
  try {
    fetch(dataDir)
      .then((response) => response.json())
      .then((jsonData) => {
        summaries = jsonData;
        document.getElementById("summarized-note-content").innerText =
          summaries[currModel][currLength] + "\n" + "\n" + "\n";
      });
  } catch (err) {
    console.log(`Error displaying the length of the summary: ${err}`);
  }
})();

document
  .querySelectorAll('input[name="summary-length-radio-buttons"]')
  .forEach((elem) => {
    elem.addEventListener("change", function (event) {
      currLength = event.target.value;
      let summaries = null;

      try {
        fetch(dataDir)
          .then((response) => response.json())
          .then((jsonData) => {
            summaries = jsonData;
            document.getElementById("summarized-note-content").value =
              summaries[currModel][currLength] + "\n" + "\n" + "\n";
          });
      } catch (err) {
        console.log(`Error displaying the length of the summary: ${err}`);
      }
    });
  });

document
  .querySelectorAll('input[name="summary-model-radio-buttons"]')
  .forEach((elem) => {
    elem.addEventListener("change", function (event) {
      currModel = event.target.value;
      let summaries = null;

      try {
        fetch(dataDir)
          .then((response) => response.json())
          .then((jsonData) => {
            summaries = jsonData;
            document.getElementById("summarized-note-content").value =
              summaries[currModel][currLength] + "\n" + "\n" + "\n";
          });
      } catch (err) {
        console.log(`Error displaying the length of the summary: ${err}`);
      }
    });
  });
