import { db } from '@/db';
import { appointments } from '@/db/schema';

async function main() {
    const sampleAppointments = [
        {
            patientName: 'Sarah Johnson',
            doctorName: 'Dr. Michael Chen',
            specialty: 'cardiology',
            date: Date.now() + 86400000 * 3, // 3 days from now
            status: 'scheduled',
            notes: 'Follow-up for hypertension management',
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            patientName: 'Robert Martinez',
            doctorName: 'Dr. Emily Rodriguez',
            specialty: 'dermatology',
            date: Date.now() + 86400000 * 7, // 7 days from now
            status: 'scheduled',
            notes: 'Annual skin screening',
            createdAt: new Date('2024-01-16').toISOString(),
            updatedAt: new Date('2024-01-16').toISOString(),
        },
        {
            patientName: 'Jennifer Wu',
            doctorName: 'Dr. David Thompson',
            specialty: 'general practice',
            date: Date.now() - 86400000 * 5, // 5 days ago
            status: 'completed',
            notes: 'Routine check-up, all vitals normal',
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString(),
        },
        {
            patientName: 'Carlos Gonzalez',
            doctorName: 'Dr. Michael Chen',
            specialty: 'cardiology',
            date: Date.now() - 86400000 * 12, // 12 days ago
            status: 'completed',
            notes: null,
            createdAt: new Date('2024-01-03').toISOString(),
            updatedAt: new Date('2024-01-03').toISOString(),
        },
        {
            patientName: 'Amanda Foster',
            doctorName: 'Dr. Sarah Mitchell',
            specialty: 'general practice',
            date: Date.now() - 86400000 * 2, // 2 days ago
            status: 'canceled',
            notes: 'Patient rescheduled due to family emergency',
            createdAt: new Date('2024-01-13').toISOString(),
            updatedAt: new Date('2024-01-13').toISOString(),
        }
    ];

    await db.insert(appointments).values(sampleAppointments);
    
    console.log('✅ Appointments seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});