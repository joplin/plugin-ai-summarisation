import { TransfomersHandler } from "./transformersJS";
//const { pipeline, env } = require("@xenova/transformers");
// import 'onnxruntime-web';

export class FlantT5SmallHandler extends TransfomersHandler {
  static task = "summarization";
  static model = "Xenova/flan-t5-small";
  static instance = null;
  //static instances = {};

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, { progress_callback });
    }
    return this.instance;
  }

  // static async getInstance(task) {
  //     if (!this.instances[task]) {
  //         this.instance[task] = await pipeline(task, this.model);
  //     }
  //     return this.instances[task];
  // }

  static describe() {
    const description = `
            The pipeline uses Google/flan-t5-small which is a language model for
            performing various of tasks. FLAN-T5 was released in the paper
            Scaling Instruction-Finetuned Language Models - it is an enhanced
            version of T5 that has been finetuned in a mixture of tasks. In this
            handler, we are using the model for these tasks:
                - abstractive summarization
        `;
    return description;
  }

  static async predict(task, ...args) {
    let options = {};
    switch (task) {
      case "summarization":
        [options.noteContent, options.minLength, options.maxLength] = args;
        const summarization = await pipeline(
          "summarization",
          "Xenova/flan-t5-small",
        );
        const result = await summarization(options.noteContent, {
          minLength: options.minLength,
          maxLength: options.maxLength,
        });
        return result;
      default:
        throw new Error(`Invalid task type: ${task}`);
    }
  }
}
