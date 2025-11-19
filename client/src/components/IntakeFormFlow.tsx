import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, ArrowRight, Check, Loader2, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface IntakeFormFlowProps {
  onBack: () => void;
}

const concernOptions = [
  "Anxiety / Panic Symptoms",
  "Obsessive-Compulsive Disorder (OCD)",
  "Bipolar Mood Disorder",
  "Post-Traumatic Stress Disorder (PTSD)",
  "Depressive Symptoms / Major Depression",
  "Attention-Deficit/Hyperactivity Disorder (ADHD)",
  "Postpartum Depression / Perinatal Mood Concerns",
  "I'm Not Sure – I would like an assessment",
  "Eating Disorder / Disordered Eating Concerns",
  "Personality Disorder or Personality-Related Difficulties",
  "Substance Use / Addiction Concerns",
  "Self-Harm Thoughts or Behaviors",
  "Any Other",
];

const intakeFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  cellNumber: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  
  concerns: z.array(z.string()).min(1, "Please select at least one concern"),
  otherConcernDetails: z.string().optional(),
  symptomsDescription: z.string().min(10, "Please describe your symptoms (min 10 characters)"),
  symptomsDuration: z.string().min(1, "Required"),
  symptomsImpact: z.string().min(1, "Required"),
  
  previousTherapy: z.string().min(1, "Required"),
  previousTherapyDetails: z.string().optional(),
  currentMedications: z.string().optional(),
  allergies: z.string().optional(),
  medicalHistory: z.string().optional(),
  
  mentalHealthInfoConsent: z.boolean().refine((val) => val === true, "Consent is required"),
  hospitalizedPastYear: z.boolean(),
  selfHarmRisk: z.boolean(),
  alcoholRelationship: z.string().min(1, "Required"),
  drugUse: z.boolean(),
  drugUseFrequency: z.string().optional(),
  
  emergencyFirstName: z.string().min(1, "Required"),
  emergencyLastName: z.string().min(1, "Required"),
  emergencyRelationship: z.string().min(1, "Required"),
  emergencyPhone: z.string().min(10, "Valid phone number is required"),
  
  insuranceMemberFirstName: z.string().min(1, "Required"),
  insuranceMemberLastName: z.string().min(1, "Required"),
  insuranceMemberDOB: z.string().min(1, "Required"),
  insuranceName: z.string().min(1, "Required"),
  insuranceMemberId: z.string().min(1, "Required"),
  
  visitType: z.enum(["in-person", "telehealth"]),
  preferredDate: z.string().optional(),
  
  termsAgreed: z.boolean().refine((val) => val === true, "You must agree to terms"),
  privacyAgreed: z.boolean().refine((val) => val === true, "You must agree to privacy policy"),
  reminderConsent: z.boolean(),
});

type IntakeFormFormValues = z.infer<typeof intakeFormSchema>;

export function IntakeFormFlow({ onBack }: IntakeFormFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { toast } = useToast();
  const totalSteps = 8;
  const storageKey = "intake-form-flow";

  const form = useForm<IntakeFormFormValues>({
    resolver: zodResolver(intakeFormSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      dateOfBirth: "",
      cellNumber: "",
      email: "",
      concerns: [],
      otherConcernDetails: "",
      symptomsDescription: "",
      symptomsDuration: "",
      symptomsImpact: "",
      previousTherapy: "",
      previousTherapyDetails: "",
      currentMedications: "",
      allergies: "",
      medicalHistory: "",
      mentalHealthInfoConsent: false,
      hospitalizedPastYear: false,
      selfHarmRisk: false,
      alcoholRelationship: "",
      drugUse: false,
      drugUseFrequency: "",
      emergencyFirstName: "",
      emergencyLastName: "",
      emergencyRelationship: "",
      emergencyPhone: "",
      insuranceMemberFirstName: "",
      insuranceMemberLastName: "",
      insuranceMemberDOB: "",
      insuranceName: "",
      insuranceMemberId: "",
      visitType: "in-person",
      preferredDate: "",
      termsAgreed: false,
      privacyAgreed: false,
      reminderConsent: false,
    },
  });

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const savedData = JSON.parse(saved);
        form.reset(savedData);
      } catch (error) {
        console.error("Error loading saved form data:", error);
      }
    }
  }, [form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem(storageKey, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/appointments", {
        ...data,
        appointmentType: "intake",
      });
    },
    onSuccess: () => {
      localStorage.removeItem(storageKey);
      setShowConfirmation(true);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "Please try again or call us at (716) 526-4041.",
      });
    },
  });

  const validateStep = async (step: number): Promise<boolean> => {
    let fieldsToValidate: (keyof IntakeFormFormValues)[] = [];

    if (step === 1) {
      fieldsToValidate = ["firstName", "lastName", "dateOfBirth", "cellNumber", "email"];
    } else if (step === 2) {
      fieldsToValidate = ["concerns"];
    } else if (step === 3) {
      fieldsToValidate = ["symptomsDescription", "symptomsDuration", "symptomsImpact"];
    } else if (step === 4) {
      fieldsToValidate = ["previousTherapy"];
    } else if (step === 5) {
      fieldsToValidate = ["mentalHealthInfoConsent", "hospitalizedPastYear", "selfHarmRisk", "alcoholRelationship", "drugUse"];
    } else if (step === 6) {
      fieldsToValidate = ["emergencyFirstName", "emergencyLastName", "emergencyRelationship", "emergencyPhone"];
    } else if (step === 7) {
      fieldsToValidate = ["insuranceMemberFirstName", "insuranceMemberLastName", "insuranceMemberDOB", "insuranceName", "insuranceMemberId"];
    } else if (step === 8) {
      fieldsToValidate = ["visitType", "termsAgreed", "privacyAgreed"];
    }

    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: IntakeFormFormValues) => {
    createAppointmentMutation.mutate(data);
  };

  if (showConfirmation) {
    const firstName = form.getValues("firstName");
    const visitType = form.getValues("visitType");

    return (
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl">Intake Form Submitted</CardTitle>
            <CardDescription className="text-base">
              Thank you, {firstName}! We've received your comprehensive intake assessment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-accent/20 rounded-lg p-6">
              <p className="text-center text-muted-foreground">
                Our clinical team will review your intake form and contact you within 24-48 hours to schedule your first appointment.
                You'll receive a confirmation email with next steps.
              </p>
            </div>
            <p className="text-muted-foreground text-center text-sm">
              Preferred visit type: <span className="font-medium capitalize">{visitType}</span>
            </p>
            <div className="flex gap-4">
              <Button onClick={() => window.location.href = "/"} className="flex-1" data-testid="button-back-to-home">
                Back to Home
              </Button>
              <Button variant="outline" onClick={onBack} className="flex-1" data-testid="button-submit-another">
                Submit Another Form
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStepTitle = (step: number): string => {
    const titles = [
      "",
      "Personal Information",
      "Primary Concerns",
      "Symptoms Assessment",
      "Treatment History",
      "Mental Health Questions",
      "Emergency Contact",
      "Insurance Information",
      "Review & Submit",
    ];
    return titles[step] || "";
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-6"
        data-testid="button-back-to-type-selection"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to appointment types
      </Button>

      <Card className="shadow-lg">
        <CardHeader className="space-y-4">
          <div>
            <CardTitle className="text-3xl">Comprehensive Intake Assessment</CardTitle>
            <CardDescription className="text-base mt-2">
              Step {currentStep} of {totalSteps}: {getStepTitle(currentStep)}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  i < currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-first-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="middleName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Middle Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-middle-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name *</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-last-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-date-of-birth" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cellNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cell Number *</FormLabel>
                          <FormControl>
                            <Input type="tel" {...field} data-testid="input-cell-number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="concerns"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-lg">Select your primary concern(s)</FormLabel>
                        <FormDescription>You can select multiple options</FormDescription>
                        <div className="space-y-3 mt-4">
                          {concernOptions.map((concern) => (
                            <FormField
                              key={concern}
                              control={form.control}
                              name="concerns"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={concern}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(concern)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, concern])
                                            : field.onChange(
                                                field.value?.filter((value) => value !== concern)
                                              );
                                        }}
                                        data-testid={`checkbox-concern-${concern.toLowerCase().replace(/\s+/g, "-")}`}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      {concern}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("concerns")?.includes("Any Other") && (
                    <FormField
                      control={form.control}
                      name="otherConcernDetails"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Please describe your concern</FormLabel>
                          <FormControl>
                            <Textarea
                              className="min-h-32"
                              {...field}
                              data-testid="textarea-other-concern-details"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="symptomsDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Describe your current symptoms in detail *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please describe the symptoms you are experiencing and how they affect your daily life..."
                            className="min-h-32"
                            {...field}
                            data-testid="textarea-symptoms-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="symptomsDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How long have you been experiencing these symptoms? *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-symptoms-duration">
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="less_than_month">Less than a month</SelectItem>
                            <SelectItem value="1-3_months">1-3 months</SelectItem>
                            <SelectItem value="3-6_months">3-6 months</SelectItem>
                            <SelectItem value="6-12_months">6-12 months</SelectItem>
                            <SelectItem value="more_than_year">More than a year</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="symptomsImpact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How much do these symptoms impact your daily life? *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-symptoms-impact">
                              <SelectValue placeholder="Select impact level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="minimal">Minimal - I can function normally</SelectItem>
                            <SelectItem value="moderate">Moderate - Some difficulty with daily tasks</SelectItem>
                            <SelectItem value="significant">Significant - Major difficulty functioning</SelectItem>
                            <SelectItem value="severe">Severe - Unable to perform daily activities</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="previousTherapy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Have you received therapy or psychiatric treatment before? *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-previous-therapy">
                              <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("previousTherapy") === "yes" && (
                    <FormField
                      control={form.control}
                      name="previousTherapyDetails"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Please describe your previous treatment</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Include when, what type of therapy, medications tried, what was helpful or not helpful..."
                              className="min-h-32"
                              {...field}
                              data-testid="textarea-previous-therapy-details"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="currentMedications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Medications (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="List all medications you are currently taking, including dosages..."
                            className="min-h-24"
                            {...field}
                            data-testid="textarea-current-medications"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="allergies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Allergies (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="List any medication or substance allergies..."
                            className="min-h-24"
                            {...field}
                            data-testid="textarea-allergies"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="medicalHistory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical History (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any relevant medical conditions, past surgeries, or health issues..."
                            className="min-h-24"
                            {...field}
                            data-testid="textarea-medical-history"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="mentalHealthInfoConsent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-mental-health-consent"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I agree to provide mental health information *
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hospitalizedPastYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Have you been admitted to a hospital or inpatient facility for mental health concerns within the past year?
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => field.onChange(value === "true")}
                            defaultValue={field.value ? "true" : "false"}
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="true" id="hospitalized-yes" data-testid="radio-hospitalized-yes" />
                              <label htmlFor="hospitalized-yes">Yes</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="false" id="hospitalized-no" data-testid="radio-hospitalized-no" />
                              <label htmlFor="hospitalized-no">No</label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="selfHarmRisk"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Do you currently feel at risk of harming yourself?
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => field.onChange(value === "true")}
                            defaultValue={field.value ? "true" : "false"}
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="true" id="selfharm-yes" data-testid="radio-selfharm-yes" />
                              <label htmlFor="selfharm-yes">Yes</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="false" id="selfharm-no" data-testid="radio-selfharm-no" />
                              <label htmlFor="selfharm-no">No</label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("selfHarmRisk") && (
                    <Alert className="border-destructive">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <AlertDescription className="text-destructive">
                        If you are in crisis or considering harming yourself, please call 911 or go to the nearest emergency room. This online form is not for emergencies.
                      </AlertDescription>
                    </Alert>
                  )}

                  <FormField
                    control={form.control}
                    name="alcoholRelationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Please share about your relationship with alcohol *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-alcohol-relationship">
                              <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="healthy">After drinking alcohol, I feel healthy</SelectItem>
                            <SelectItem value="unhealthy">After drinking alcohol, I feel unhealthy</SelectItem>
                            <SelectItem value="unsure">I am unsure</SelectItem>
                            <SelectItem value="none">I do not drink alcohol</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="drugUse"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Do you use drugs?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => field.onChange(value === "true")}
                            defaultValue={field.value ? "true" : "false"}
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="true" id="drugs-yes" data-testid="radio-drugs-yes" />
                              <label htmlFor="drugs-yes">Yes</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="false" id="drugs-no" data-testid="radio-drugs-no" />
                              <label htmlFor="drugs-no">No</label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("drugUse") && (
                    <FormField
                      control={form.control}
                      name="drugUseFrequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency of drug use</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-drug-use-frequency">
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Once a week</SelectItem>
                              <SelectItem value="monthly">Once a month</SelectItem>
                              <SelectItem value="occasionally">Occasionally</SelectItem>
                              <SelectItem value="past">I have used drugs in the past but not currently</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}

              {currentStep === 6 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="emergencyFirstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-emergency-first-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="emergencyLastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name *</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-emergency-last-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="emergencyRelationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-emergency-relationship">
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="parent">Parent</SelectItem>
                            <SelectItem value="spouse">Spouse</SelectItem>
                            <SelectItem value="sibling">Sibling</SelectItem>
                            <SelectItem value="friend">Friend</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergencyPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input type="tel" {...field} data-testid="input-emergency-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {currentStep === 7 && (
                <div className="space-y-6">
                  <p className="text-sm text-muted-foreground">
                    We'll verify your benefits before contacting you to schedule.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="insuranceMemberFirstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Member First Name *</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-insurance-member-first-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="insuranceMemberLastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Member Last Name *</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-insurance-member-last-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="insuranceMemberDOB"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Member Date of Birth *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-insurance-member-dob" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="insuranceName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Insurance Name *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-insurance-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="insuranceMemberId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Insurance Member ID *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-insurance-member-id" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {currentStep === 8 && (
                <div className="space-y-6">
                  <div className="bg-accent/20 rounded-lg p-6 space-y-6">
                    <h3 className="font-semibold text-lg">Review Your Information</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Personal Information</h4>
                        <p>{form.watch("firstName")} {form.watch("lastName")}</p>
                        <p className="text-sm text-muted-foreground">{form.watch("email")}</p>
                        <p className="text-sm text-muted-foreground">{form.watch("cellNumber")}</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Primary Concerns</h4>
                        <p className="text-sm">{form.watch("concerns")?.join(", ")}</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Insurance</h4>
                        <p>{form.watch("insuranceName")}</p>
                        <p className="text-sm text-muted-foreground">Member ID: {form.watch("insuranceMemberId")}</p>
                      </div>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="visitType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Visit Type *</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="in-person" id="in-person" data-testid="radio-visit-in-person" />
                              <label htmlFor="in-person">In-Person</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="telehealth" id="telehealth" data-testid="radio-visit-telehealth" />
                              <label htmlFor="telehealth">Telehealth</label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferredDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Date (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-preferred-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="termsAgreed"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-terms-agreed"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I agree to the Terms & Conditions *
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="privacyAgreed"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-privacy-agreed"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I acknowledge the Privacy Policy / HIPAA Notice *
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reminderConsent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-reminder-consent"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I consent to receive appointment reminders via email/SMS
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep} data-testid="button-previous-step">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                )}
                {currentStep < totalSteps ? (
                  <Button type="button" onClick={nextStep} className={currentStep === 1 ? "ml-auto" : ""} data-testid="button-next-step">
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={createAppointmentMutation.isPending} className="ml-auto" data-testid="button-submit-intake">
                    {createAppointmentMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Submit Intake Form
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
