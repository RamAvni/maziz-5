const worker = new Worker("./sqliteWorker.js", { type: "module" });

console.log(worker);
worker.onmessage = function (e) {
  console.log("data from worker:", e.data);
};
