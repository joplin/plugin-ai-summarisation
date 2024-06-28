import { AIHandler } from "../../base";

export class TransfomersHandler extends AIHandler {
  constructor() {
    if (this.constructor == TransfomersHandler) {
      throw new Error("Abstract class can't be instantiated");
    }
    if (this.getInstance == undefined) {
      throw new Error("getInstance method must be implemented");
    }
  }
}
