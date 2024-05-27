/*
    The AIHandler class serves as a basis of creating new AI features, where
    predict and describe functions need to be implemented.

    - predict(data): it calls the model and returns predicted data
    - describe(): describes what the AI feature does
*/
export class AIHandler {
  constructor() {
    if (this.constructor == AIHandler) {
      throw new Error("Abstract class can't be instantiated");
    }
    if (this.predict == undefined && this.describe == undefined) {
      throw new Error(
        "predict(data) and describe() methods must be implemented",
      );
    }
  }
}
