export interface InitPanel {
    type: "initPanel";
  }
  
  export interface GetNotes {
    type: "getNotes";
  }
  
  export type Message =
    | InitPanel
    | GetNotes;