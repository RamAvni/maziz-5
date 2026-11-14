const worker = new Worker("./sqliteWorker.js", { type: "module" });

console.log(worker);
worker.onmessage = function (e) {
  console.log("data from worker:", e.data);
};

const offlineBtn = document.getElementById(
  "offline-btn",
) as HTMLButtonElement | null;

offlineBtn?.addEventListener("click", () => {
  worker.postMessage("offline-fetch");
  offlineBtn.disabled = true;
});
