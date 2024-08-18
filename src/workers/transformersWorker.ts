// @ts-ignore -- no types available for transformers.js
import { Min } from "@tensorflow/tfjs";
import { pipeline, env } from "@xenova/transformers";

// Use code similar to the following to use local models
// See https://github.com/xenova/transformers.js?tab=readme-ov-file#settings
env.localModelPath = "../ai/transformersModels/";
env.allowRemoteModels = false;

// Don't fetch ONNX WASM from the internet (see tools/copyModels.js).
env.backends.onnx.wasm.wasmPaths = "../ai/onnx-dist/";

let pipe: (text: string, config: any) => Promise<unknown>;

const classify = async (text: string) => {
  pipe ??= await pipeline("summarization", "Xenova/flan-t5-small");
  let min_length = 250;
  if (text.length <= 5000) {
	min_length = 150;
  }
  const summarization = await pipe(text.replace(/\[.*?\]/g, ''), {
    min_length: min_length,
    max_length: 600,
  });

  console.debug("summarized", text, "as", summarization);
  return summarization;
};

self.addEventListener("message", async (event) => {
  console.debug("got message", event.data);

  if (event.data.type === "classify") {
    postMessage({
      response: await classify(event.data.text),
    });
  } else {
	postMessage({
		generatedSummary: await classify(event.data.text),
	});
  }
});
