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
import { ArrowLeft, ArrowRight, Check, Loader2, AlertTriangle, Mail, Phone } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface NewPatientFlowProps {
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

const stateOptions = [
  "NY", "CA", "TX", "FL", "PA", "IL", "OH", "GA", "NC", "MI",
  "NJ", "VA", "WA", "AZ", "MA", "TN", "IN", "MO", "MD", "WI",
  "CO", "MN", "SC", "AL", "LA", "KY", "OR", "OK", "CT", "UT",
  "IA", "NV", "AR", "MS", "KS", "NM", "NE", "ID", "WV", "HI",
  "NH", "ME", "RI", "MT", "DE", "SD", "ND", "AK", "VT", "WY",
];

const newPatientSchema = z.object({
  verificationMethod: z.enum(["email", "phone"]),
  verifiedContact: z.string().min(1, "Required"),
  otpCode: z.string().length(6, "Code must be 6 digits").optional(),
  
  seekingHelpFor: z.enum(["myself", "someone_else"]),
  
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  cellNumber: z.string().min(10, "Valid phone number is required"),
  gender: z.enum(["male", "female"]),
  
  streetName: z.string().min(1, "Street name is required"),
  aptSuite: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(5, "ZIP code is required"),
  
  howHeardAboutUs: z.string().min(1, "Please select an option"),
  
  concerns: z.array(z.string()).min(1, "Please select at least one concern"),
  otherConcernDetails: z.string().optional(),
  
  insuranceMemberFirstName: z.string().min(1, "Required"),
  insuranceMemberLastName: z.string().min(1, "Required"),
  insuranceMemberDOB: z.string().min(1, "Required"),
  insuranceName: z.string().min(1, "Required"),
  insuranceMemberId: z.string().min(1, "Required"),
  policyHolder: z.string().min(1, "Required"),
  policyHolderOther: z.string().optional(),
  
  mentalHealthInfoConsent: z.boolean().refine((val) => val === true, "Consent is required"),
  hospitalizedPastYear: z.boolean(),
  selfHarmRisk: z.boolean(),
  alcoholRelationship: z.string().min(1, "Required"),
  drugUse: z.boolean(),
  drugUseFrequency: z.string().optional(),
  
  emergencyFirstName: z.string().min(1, "Required"),
  emergencyMiddleName: z.string().optional(),
  emergencyLastName: z.string().min(1, "Required"),
  emergencyRelationship: z.string().min(1, "Required"),
  emergencyRelationshipOther: z.string().optional(),
  emergencyPhone: z.string().min(10, "Valid phone number is required"),
  
  visitType: z.enum(["in-person", "telehealth"]),
  appointmentDate: z.string().min(1, "Required"),
  appointmentTime: z.string().min(1, "Required"),
  preferredProvider: z.string().min(1, "Required"),
  
  termsAgreed: z.boolean().refine((val) => val === true, "You must agree to terms"),
  privacyAgreed: z.boolean().refine((val) => val === true, "You must agree to privacy policy"),
  reminderConsent: z.boolean(),
});

type NewPatientFormValues = z.infer<typeof newPatientSchema>;

export function NewPatientFlow({ onBack }: NewPatientFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [otpSent, setOtpSent] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { toast } = useToast();
  const totalSteps = 10;
  const storageKey = "new-patient-flow";

  const form = useForm<NewPatientFormValues>({
    resolver: zodResolver(newPatientSchema),
    defaultValues: {
      verificationMethod: "email",
      verifiedContact: "",
      seekingHelpFor: "myself",
      firstName: "",
      middleName: "",
      lastName: "",
      dateOfBirth: "",
      cellNumber: "",
      gender: "male",
      streetName: "",
      aptSuite: "",
      city: "",
      state: "",
      zipCode: "",
      howHeardAboutUs: "",
      concerns: [],
      otherConcernDetails: "",
      insuranceMemberFirstName: "",
      insuranceMemberLastName: "",
      insuranceMemberDOB: "",
      insuranceName: "",
      insuranceMemberId: "",
      policyHolder: "",
      policyHolderOther: "",
      mentalHealthInfoConsent: false,
      hospitalizedPastYear: false,
      selfHarmRisk: false,
      alcoholRelationship: "",
      drugUse: false,
      drugUseFrequency: "",
      emergencyFirstName: "",
      emergencyMiddleName: "",
      emergencyLastName: "",
      emergencyRelationship: "",
      emergencyRelationshipOther: "",
      emergencyPhone: "",
      visitType: "in-person",
      appointmentDate: "",
      appointmentTime: "",
      preferredProvider: "",
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
        appointmentType: "new",
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

  const handleSendOTP = () => {
    const contact = form.getValues("verifiedContact");
    if (contact) {
      toast({
        title: "Code Sent",
        description: `We've sent a one-time passcode to ${contact}`,
      });
      setOtpSent(true);
    }
  };

  const validateStep = async (step: number): Promise<boolean> => {
    let fieldsToValidate: (keyof NewPatientFormValues)[] = [];

    if (step === 1) {
      fieldsToValidate = ["verificationMethod", "verifiedContact"];
    } else if (step === 2) {
      fieldsToValidate = ["seekingHelpFor"];
    } else if (step === 3) {
      fieldsToValidate = ["firstName", "lastName", "dateOfBirth", "cellNumber", "gender", "streetName", "city", "state", "zipCode", "howHeardAboutUs"];
    } else if (step === 4) {
      fieldsToValidate = ["concerns"];
    } else if (step === 5) {
      fieldsToValidate = ["insuranceMemberFirstName", "insuranceMemberLastName", "insuranceMemberDOB", "insuranceName", "insuranceMemberId", "policyHolder"];
    } else if (step === 6) {
      fieldsToValidate = ["mentalHealthInfoConsent", "hospitalizedPastYear", "selfHarmRisk", "alcoholRelationship", "drugUse"];
    } else if (step === 7) {
      fieldsToValidate = ["emergencyFirstName", "emergencyLastName", "emergencyRelationship", "emergencyPhone"];
    } else if (step === 8) {
      fieldsToValidate = ["visitType", "appointmentDate", "appointmentTime", "preferredProvider"];
    } else if (step === 9) {
      fieldsToValidate = ["termsAgreed", "privacyAgreed"];
    }

    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  const nextStep = async () => {
    if (currentStep === 1 && !otpSent) {
      handleSendOTP();
      return;
    }

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

  const onSubmit = (data: NewPatientFormValues) => {
    createAppointmentMutation.mutate(data);
  };

  if (showConfirmation) {
    const firstName = form.getValues("firstName");
    const appointmentDate = form.getValues("appointmentDate");
    const appointmentTime = form.getValues("appointmentTime");
    const visitType = form.getValues("visitType");
    const preferredProvider = form.getValues("preferredProvider");

    return (
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl">Appointment Request Submitted</CardTitle>
            <CardDescription className="text-base">
              Thank you, {firstName}! We've received your appointment request.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-accent/20 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-lg">Appointment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{appointmentDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">{appointmentTime}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{visitType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Provider</p>
                  <p className="font-medium">{preferredProvider}</p>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground text-center">
              A confirmation email and SMS will be sent to you with appointment details.
              {visitType === "telehealth" && " For telehealth appointments, we'll send you a secure video link."}
            </p>
            <div className="flex gap-4">
              <Button onClick={() => window.location.href = "/"} className="flex-1" data-testid="button-back-to-home">
                Back to Home
              </Button>
              <Button variant="outline" onClick={onBack} className="flex-1" data-testid="button-book-another">
                Book Another Appointment
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
      "Verify your contact",
      "Who are you seeking help for?",
      "Your Information",
      "Your concern or reason for consultation",
      "Insurance Information",
      "Mental Health Questions",
      "Emergency Contact Details",
      "Schedule your appointment",
      "Review your details",
      "Confirmation",
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
            <CardTitle className="text-3xl">New Patient Appointment</CardTitle>
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
                  <FormField
                    control={form.control}
                    name="verificationMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verification Method</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="email" id="email" data-testid="radio-verification-email" />
                              <label htmlFor="email" className="flex items-center gap-2 cursor-pointer">
                                <Mail className="h-4 w-4" />
                                Email
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="phone" id="phone" data-testid="radio-verification-phone" />
                              <label htmlFor="phone" className="flex items-center gap-2 cursor-pointer">
                                <Phone className="h-4 w-4" />
                                Phone
                              </label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="verifiedContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {form.watch("verificationMethod") === "email" ? "Email Address" : "Phone Number"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type={form.watch("verificationMethod") === "email" ? "email" : "tel"}
                            placeholder={form.watch("verificationMethod") === "email" ? "your@email.com" : "(555) 123-4567"}
                            {...field}
                            data-testid="input-verified-contact"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {otpSent && (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        We've sent a one-time passcode to {form.watch("verifiedContact")}. Enter it to continue.
                      </p>
                      <FormField
                        control={form.control}
                        name="otpCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Enter 6-digit code</FormLabel>
                            <FormControl>
                              <Input
                                maxLength={6}
                                placeholder="000000"
                                {...field}
                                data-testid="input-otp-code"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="button" variant="link" className="p-0" onClick={handleSendOTP} data-testid="button-resend-code">
                        Didn't receive code? Resend
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="seekingHelpFor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg">Who are you seeking help for?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
                          >
                            <Card className={`cursor-pointer hover-elevate ${field.value === "myself" ? "border-primary" : ""}`}>
                              <CardContent className="p-6">
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="myself" id="myself" data-testid="radio-seeking-help-myself" />
                                  <label htmlFor="myself" className="text-lg font-medium cursor-pointer">
                                    Myself
                                  </label>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className={`cursor-pointer hover-elevate ${field.value === "someone_else" ? "border-primary" : ""}`}>
                              <CardContent className="p-6">
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="someone_else" id="someone_else" data-testid="radio-seeking-help-someone-else" />
                                  <label htmlFor="someone_else" className="text-lg font-medium cursor-pointer">
                                    Someone else
                                  </label>
                                </div>
                              </CardContent>
                            </Card>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {currentStep === 3 && (
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
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender *</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="male" id="male" data-testid="radio-gender-male" />
                              <label htmlFor="male">Male</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="female" id="female" data-testid="radio-gender-female" />
                              <label htmlFor="female">Female</label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <h3 className="font-semibold">Primary Address</h3>
                    <FormField
                      control={form.control}
                      name="streetName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Name *</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-street-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="aptSuite"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Apt, Suite, etc.</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-apt-suite" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City *</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-city" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-state">
                                  <SelectValue placeholder="Select state" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {stateOptions.map((state) => (
                                  <SelectItem key={state} value={state}>
                                    {state}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code *</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-zip-code" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="howHeardAboutUs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How did you hear about us? *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-how-heard-about-us">
                              <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="social_media">Social Media</SelectItem>
                            <SelectItem value="friend_family">Friend/Family</SelectItem>
                            <SelectItem value="doctor_referral">Doctor Referral</SelectItem>
                            <SelectItem value="insurance_directory">Insurance Directory</SelectItem>
                            <SelectItem value="google_search">Google Search</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
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
                    name="concerns"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-lg">Select your concern(s)</FormLabel>
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

              {currentStep === 5 && (
                <div className="space-y-6">
                  <p className="text-sm text-muted-foreground">
                    We'll verify your benefits before your appointment.
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

                  <FormField
                    control={form.control}
                    name="policyHolder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Policy Holder *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-policy-holder">
                              <SelectValue placeholder="Select policy holder" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="me">Me</SelectItem>
                            <SelectItem value="spouse">Spouse</SelectItem>
                            <SelectItem value="parent">Parent</SelectItem>
                            <SelectItem value="step_parent">Step Parent</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("policyHolder") === "other" && (
                    <FormField
                      control={form.control}
                      name="policyHolderOther"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specify policy holder</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-policy-holder-other" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}

              {currentStep === 6 && (
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
                            I agree to provide mental health information in upcoming screens *
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
                        If you are in crisis or considering harming yourself, please call 911 or go to the nearest emergency room. This online booking system is not for emergencies.
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

              {currentStep === 7 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      name="emergencyMiddleName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Middle Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-emergency-middle-name" />
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
                            <SelectItem value="caregiver">Caregiver</SelectItem>
                            <SelectItem value="friend">Friend</SelectItem>
                            <SelectItem value="parent">Parent</SelectItem>
                            <SelectItem value="spouse">Spouse</SelectItem>
                            <SelectItem value="child">Child</SelectItem>
                            <SelectItem value="sibling">Sibling</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("emergencyRelationship") === "other" && (
                    <FormField
                      control={form.control}
                      name="emergencyRelationshipOther"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specify relationship</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-emergency-relationship-other" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

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

              {currentStep === 8 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="visitType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visit Type *</FormLabel>
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
                    name="appointmentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-appointment-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="appointmentTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Time *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-appointment-time">
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="9:00 AM">9:00 AM</SelectItem>
                            <SelectItem value="10:30 AM">10:30 AM</SelectItem>
                            <SelectItem value="2:00 PM">2:00 PM</SelectItem>
                            <SelectItem value="3:30 PM">3:30 PM</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferredProvider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Provider *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-preferred-provider">
                              <SelectValue placeholder="Select provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="first_available">First Available</SelectItem>
                            <SelectItem value="dr_smith">Dr. Smith</SelectItem>
                            <SelectItem value="dr_johnson">Dr. Johnson</SelectItem>
                            <SelectItem value="dr_williams">Dr. Williams</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {currentStep === 9 && (
                <div className="space-y-6">
                  <div className="bg-accent/20 rounded-lg p-6 space-y-6">
                    <h3 className="font-semibold text-lg">Review Your Information</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Personal Information</h4>
                        <p>{form.watch("firstName")} {form.watch("middleName")} {form.watch("lastName")}</p>
                        <p className="text-sm text-muted-foreground">DOB: {form.watch("dateOfBirth")}</p>
                        <p className="text-sm text-muted-foreground">{form.watch("cellNumber")}</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Address</h4>
                        <p>{form.watch("streetName")} {form.watch("aptSuite")}</p>
                        <p>{form.watch("city")}, {form.watch("state")} {form.watch("zipCode")}</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Insurance</h4>
                        <p>{form.watch("insuranceName")}</p>
                        <p className="text-sm text-muted-foreground">Member ID: {form.watch("insuranceMemberId")}</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Appointment</h4>
                        <p>{form.watch("appointmentDate")} at {form.watch("appointmentTime")}</p>
                        <p className="text-sm text-muted-foreground capitalize">{form.watch("visitType")} - {form.watch("preferredProvider")}</p>
                      </div>
                    </div>
                  </div>

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
                    {currentStep === 1 && !otpSent ? "Send Code" : "Next"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={createAppointmentMutation.isPending} className="ml-auto" data-testid="button-submit-appointment">
                    {createAppointmentMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Confirm Appointment
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
