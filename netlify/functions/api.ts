import express, { Router } from "express";
import serverless from "serverless-http";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { z } from "zod";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey(),
  appointmentType: text("appointment_type").notNull(),
  verificationMethod: text("verification_method"),
  verifiedContact: text("verified_contact"),
  seekingHelpFor: text("seeking_help_for"),
  firstName: text("first_name").notNull(),
  middleName: text("middle_name"),
  lastName: text("last_name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  cellNumber: text("cell_number").notNull(),
  gender: text("gender"),
  streetName: text("street_name"),
  aptSuite: text("apt_suite"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  howHeardAboutUs: text("how_heard_about_us"),
  concerns: text("concerns").array(),
  otherConcernDetails: text("other_concern_details"),
  insuranceMemberFirstName: text("insurance_member_first_name"),
  insuranceMemberLastName: text("insurance_member_last_name"),
  insuranceMemberDOB: text("insurance_member_dob"),
  insuranceName: text("insurance_name"),
  insuranceMemberId: text("insurance_member_id"),
  policyHolder: text("policy_holder"),
  policyHolderOther: text("policy_holder_other"),
  mentalHealthInfoConsent: boolean("mental_health_info_consent"),
  hospitalizedPastYear: boolean("hospitalized_past_year"),
  selfHarmRisk: boolean("self_harm_risk"),
  alcoholRelationship: text("alcohol_relationship"),
  drugUse: boolean("drug_use"),
  drugUseFrequency: text("drug_use_frequency"),
  emergencyFirstName: text("emergency_first_name"),
  emergencyMiddleName: text("emergency_middle_name"),
  emergencyLastName: text("emergency_last_name"),
  emergencyRelationship: text("emergency_relationship"),
  emergencyRelationshipOther: text("emergency_relationship_other"),
  emergencyPhone: text("emergency_phone"),
  visitType: text("visit_type"),
  appointmentDate: text("appointment_date"),
  appointmentTime: text("appointment_time"),
  preferredProvider: text("preferred_provider"),
  termsAgreed: boolean("terms_agreed"),
  privacyAgreed: boolean("privacy_agreed"),
  reminderConsent: boolean("reminder_consent"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  insuranceProvider: text("insurance_provider"),
  insuranceGroupNumber: text("insurance_group_number"),
  medicalHistory: text("medical_history"),
  currentMedications: text("current_medications"),
  allergies: text("allergies"),
  reasonForVisit: text("reason_for_visit"),
  preferredDate: text("preferred_date"),
  preferredTime: text("preferred_time"),
  preferredLocation: text("preferred_location"),
  appointmentMode: text("appointment_mode"),
  serviceType: text("service_type"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  previousTherapy: text("previous_therapy"),
  symptoms: text("symptoms"),
  additionalNotes: text("additional_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const contactSubmissions = pgTable("contact_submissions", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({
  id: true,
  createdAt: true,
});

const getDb = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return drizzle({ client: pool });
};

const app = express();
const router = Router();

app.use(express.json());

router.get("/", (_req, res) => {
  res.json({ message: "PsychWebMD API is running!" });
});

router.post("/appointments", async (req, res) => {
  try {
    const db = getDb();
    const validatedData = insertAppointmentSchema.parse(req.body);
    const id = randomUUID();
    const [appointment] = await db
      .insert(appointments)
      .values({ ...validatedData, id })
      .returning();
    res.status(201).json(appointment);
  } catch (error: any) {
    console.error("Error creating appointment:", error);
    if (error.name === "ZodError") {
      res.status(400).json({ error: "Invalid appointment data", details: error.errors });
    } else {
      res.status(500).json({ error: "Failed to create appointment" });
    }
  }
});

router.get("/appointments", async (_req, res) => {
  try {
    const db = getDb();
    const allAppointments = await db
      .select()
      .from(appointments)
      .orderBy(desc(appointments.createdAt));
    res.json(allAppointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

router.get("/appointments/:id", async (req, res) => {
  try {
    const db = getDb();
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, req.params.id));
    if (!appointment) {
      res.status(404).json({ error: "Appointment not found" });
      return;
    }
    res.json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({ error: "Failed to fetch appointment" });
  }
});

router.post("/contact", async (req, res) => {
  try {
    const db = getDb();
    const validatedData = insertContactSubmissionSchema.parse(req.body);
    const id = randomUUID();
    const [submission] = await db
      .insert(contactSubmissions)
      .values({ ...validatedData, id })
      .returning();
    res.status(201).json(submission);
  } catch (error: any) {
    console.error("Error creating contact submission:", error);
    if (error.name === "ZodError") {
      res.status(400).json({ error: "Invalid contact data", details: error.errors });
    } else {
      res.status(500).json({ error: "Failed to create contact submission" });
    }
  }
});

router.get("/contact", async (_req, res) => {
  try {
    const db = getDb();
    const submissions = await db
      .select()
      .from(contactSubmissions)
      .orderBy(desc(contactSubmissions.createdAt));
    res.json(submissions);
  } catch (error) {
    console.error("Error fetching contact submissions:", error);
    res.status(500).json({ error: "Failed to fetch contact submissions" });
  }
});

app.use("/.netlify/functions/api", router);

export const handler = serverless(app);
