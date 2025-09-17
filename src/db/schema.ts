import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const appointments = sqliteTable('appointments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  patientName: text('patient_name').notNull(),
  doctorName: text('doctor_name').notNull(),
  specialty: text('specialty').notNull(),
  date: integer('date').notNull(),
  status: text('status').notNull().default('scheduled'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const historyItems = sqliteTable('history_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  date: integer('date').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const iotMetrics = sqliteTable('iot_metrics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  metric: text('metric').notNull(),
  value: real('value').notNull(),
  recordedAt: integer('recorded_at').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});