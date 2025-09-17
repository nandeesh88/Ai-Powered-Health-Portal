import { db } from '@/db';
import { iotMetrics } from '@/db/schema';

async function main() {
    const baseTime = new Date('2024-01-01T00:00:00Z').getTime();
    
    const heartRateReadings = [];
    for (let i = 0; i < 50; i++) {
        const timestamp = baseTime + (i * 5 * 60 * 60 * 1000);
        heartRateReadings.push({
            metric: 'heart_rate',
            value: 60 + Math.floor(Math.random() * 31),
            recordedAt: timestamp,
            createdAt: new Date(timestamp).toISOString(),
            updatedAt: new Date(timestamp).toISOString(),
        });
    }
    
    const stepsReadings = [];
    for (let i = 0; i < 14; i++) {
        const timestamp = baseTime + (i * 24 * 60 * 60 * 1000);
        stepsReadings.push({
            metric: 'steps',
            value: 3000 + Math.floor(Math.random() * 9001),
            recordedAt: timestamp,
            createdAt: new Date(timestamp).toISOString(),
            updatedAt: new Date(timestamp).toISOString(),
        });
    }
    
    const sleepReadings = [];
    for (let i = 0; i < 14; i++) {
        const timestamp = baseTime + (i * 24 * 60 * 60 * 1000);
        sleepReadings.push({
            metric: 'sleep_hours',
            value: 4.5 + Math.random() * 4.5,
            recordedAt: timestamp,
            createdAt: new Date(timestamp).toISOString(),
            updatedAt: new Date(timestamp).toISOString(),
        });
    }
    
    const allMetrics = [...heartRateReadings, ...stepsReadings, ...sleepReadings];
    
    await db.insert(iotMetrics).values(allMetrics);
    
    console.log('✅ IoT Metrics seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});