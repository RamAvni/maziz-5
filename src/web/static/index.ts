console.log("Hello from javascript!");
const worker = new Worker("worker.js", { type: "module" });

worker.onmessage = function (e) {
  console.log("data from worker:", e.data);
};
