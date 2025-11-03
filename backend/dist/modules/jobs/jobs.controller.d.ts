import { Queue } from 'bullmq';
export declare class JobsController {
    private readonly csvQueue;
    constructor(csvQueue: Queue);
    getInfo(): Promise<{
        queue: string;
        waiting: number;
        active: number;
        completed: number;
        failed: number;
        delayed: number;
    }>;
}
