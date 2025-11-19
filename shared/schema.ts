import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const appointments = pgTable("appointments", {
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

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

export const contactSubmissions = pgTable("contact_submissions", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({
  id: true,
  createdAt: true,
});

export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
