// global.d.ts
declare namespace webviewApi {
  function postMessage(msg: any): Promise<any>;
}
