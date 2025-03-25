const { parentPort } = require("worker_threads");
parentPort.on("message", async (task) => {
    try {
      console.log(`[Worker] Executing Task: ${task.name}`);
  
      // Run the provided task function (as a string)
      const taskFunction = new Function(`return (${task.fn})`)();
      await taskFunction(); // Execute the function
  
      console.log(`[Worker] Task Completed: ${task.name}`);
      parentPort.postMessage({ success: true });
    } catch (error) {
      console.error(`[Worker] Task Failed: ${task.name}`, error);
      parentPort.postMessage({ success: false });
    }
  });