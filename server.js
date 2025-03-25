
const connectDB = require('./db');
const JobScheduler = require("./scheduler");
(
    async () => {
        try {
            await connectDB();
            const scheduler = new JobScheduler();
            await scheduler.init();
             scheduler.addJob("Job A", () => console.log("Job A running"), 60000);
            scheduler.addJob("Job B", async () => {
                throw new Error('err in Job B');
            }, 60000);
             scheduler.addJob("Job C", () => console.log("Job C running"), 30000);
        }
        catch (err) {
            console.error("[Scheduler] Error initializing jobs:", err);
        }

    }
)();