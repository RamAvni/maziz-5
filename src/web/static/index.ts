const worker = new Worker("./sqliteWorker.js", { type: "module" });

worker.onmessage = function (e) {
  console.log("data from worker:", e.data);
};
