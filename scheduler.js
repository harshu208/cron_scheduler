const { Worker } = require("worker_threads");
const Job = require('./models/JobModel');

class JobScheduler {
    constructor() {
        // this.jobs = [];
    }

    async init() {
        await this.loadJobsFromDB();
    }

    async loadJobsFromDB() {
        try{
            const jobs = await Job.find();
            jobs.forEach((job) => {
                console.log(`[Scheduler] Loading Job: ${job.name}`);
                this.scheduleJob(job);
            });
        }
        catch(err){
            console.log("[Scheduler] Error loading jobs:", err);
        }
    }

    async addJob(name, fn, interval) {
        try {
            const job = new Job({
                name,
                fn: fn.toString().replace(/\n/g, ""),
                interval,
                nextRun: new Date(Date.now() + interval),
            });
            await job.save();

            // this.jobs.push(job);
            this.scheduleJob(job);
        }
        catch (err) {
            console.log("[Scheduler] Error adding job:", err);
        }
    }

    scheduleJob(job) {
        try{
            setTimeout(() => this.runJob(job), job.interval);
        }
        catch(err){
            console.log("[Scheduler] Error Scheduling jobs:", err);
        }
    }

    async runJob(job) {
        try {
            console.log(`[Scheduler] Running Job: ${job.name}`);

            await Job.updateOne({ _id: job._id }, { status: "running", lastRun: new Date() });

            const worker = new Worker("./worker.js");
            worker.postMessage({
                name: job.name,
                fn: job.fn
            });

            const timeout = setTimeout(() => {
                console.log(`[Scheduler] Timeout! Terminating Job: ${job.name}`);
                worker.terminate();
                this.handleFailure(job);
            }, 30000);

            worker.on("message", async (result) => {
                clearTimeout(timeout);
                if (result.success) {
                    console.log(`[Scheduler] Job Succeeded: ${job.name}`);
                    await Job.updateOne({ _id: job._id }, { status: "completed", nextRun: new Date(Date.now() + job.interval), retries: 0 });
                } else {
                    await this.handleFailure(job);
                }
                worker.terminate();
                this.scheduleJob(job);
            });

            worker.on("error", async (error) => {
                console.error(`[Scheduler] Worker Error in ${job.name}:`, error);
                await this.handleFailure(job);
                worker.terminate();
            });
        }
        catch (err) {
            console.error(`[Scheduler] Error running job ${job.name}:`, err);
            await this.handleFailure(job);
        }
    }

    async handleFailure(job) {
        try {

            if (job.retries < 2) {
                console.log(`[Scheduler] Retrying Job: ${job.name} in 5s`);
                job.retries++;
                await Job.updateOne({ _id: job._id }, { status: "failed", retries: job.retries });
                setTimeout(() => this.runJob(job), 5000);
            } else {
                console.log(`[Scheduler] Job Failed After 3 Attempts: ${job.name}`);
                await Job.updateOne({ _id: job._id }, { status: "failed" });
            }
        }
        catch (err) {
            console.error(`[Scheduler] Error handling failure for job ${job.name}:`, err);
        }
    }
}

module.exports = JobScheduler;
