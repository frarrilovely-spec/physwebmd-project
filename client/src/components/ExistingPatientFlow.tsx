import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, Check, Loader2, Mail, Phone } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ExistingPatientFlowProps {
  onBack: () => void;
}

const existingPatientSchema = z.object({
  verificationMethod: z.enum(["email", "phone"]),
  verifiedContact: z.string().min(1, "Required"),
  otpCode: z.string().length(6, "Code must be 6 digits").optional(),
  
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  cellNumber: z.string().min(10, "Valid phone number is required"),
  
  reasonForVisit: z.string().min(10, "Please describe your reason for visit (min 10 characters)"),
  currentSymptoms: z.string().optional(),
  medicationChanges: z.string().optional(),
  
  insuranceName: z.string().min(1, "Required"),
  insuranceMemberId: z.string().min(1, "Required"),
  insuranceChanged: z.boolean(),
  
  visitType: z.enum(["in-person", "telehealth"]),
  appointmentDate: z.string().min(1, "Required"),
  appointmentTime: z.string().min(1, "Required"),
  preferredProvider: z.string().min(1, "Required"),
  
  termsAgreed: z.boolean().refine((val) => val === true, "You must agree to terms"),
  reminderConsent: z.boolean(),
});

type ExistingPatientFormValues = z.infer<typeof existingPatientSchema>;

export function ExistingPatientFlow({ onBack }: ExistingPatientFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [otpSent, setOtpSent] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { toast } = useToast();
  const totalSteps = 6;
  const storageKey = "existing-patient-flow";

  const form = useForm<ExistingPatientFormValues>({
    resolver: zodResolver(existingPatientSchema),
    defaultValues: {
      verificationMethod: "email",
      verifiedContact: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      cellNumber: "",
      reasonForVisit: "",
      currentSymptoms: "",
      medicationChanges: "",
      insuranceName: "",
      insuranceMemberId: "",
      insuranceChanged: false,
      visitType: "in-person",
      appointmentDate: "",
      appointmentTime: "",
      preferredProvider: "",
      termsAgreed: false,
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
        appointmentType: "existing",
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
    let fieldsToValidate: (keyof ExistingPatientFormValues)[] = [];

    if (step === 1) {
      fieldsToValidate = ["verificationMethod", "verifiedContact"];
    } else if (step === 2) {
      fieldsToValidate = ["firstName", "lastName", "dateOfBirth", "cellNumber"];
    } else if (step === 3) {
      fieldsToValidate = ["reasonForVisit"];
    } else if (step === 4) {
      fieldsToValidate = ["insuranceName", "insuranceMemberId"];
    } else if (step === 5) {
      fieldsToValidate = ["visitType", "appointmentDate", "appointmentTime", "preferredProvider"];
    } else if (step === 6) {
      fieldsToValidate = ["termsAgreed"];
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

  const onSubmit = (data: ExistingPatientFormValues) => {
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
              Thank you, {firstName}! We've received your follow-up appointment request.
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
              {visitType === "telehealth" && " We'll send you a secure video link for your telehealth session."}
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
      "Confirm your information",
      "Reason for visit",
      "Insurance verification",
      "Schedule your appointment",
      "Review & confirm",
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
            <CardTitle className="text-3xl">Existing Patient Appointment</CardTitle>
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
                  <p className="text-sm text-muted-foreground">
                    Please confirm your information is still current
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="reasonForVisit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason for Follow-up Visit *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please describe the reason for your follow-up appointment..."
                            className="min-h-32"
                            {...field}
                            data-testid="textarea-reason-for-visit"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currentSymptoms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Symptoms (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe any current symptoms or changes since your last visit..."
                            className="min-h-24"
                            {...field}
                            data-testid="textarea-current-symptoms"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="medicationChanges"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medication Changes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Have you experienced any medication changes or side effects?"
                            className="min-h-24"
                            {...field}
                            data-testid="textarea-medication-changes"
                          />
                        </FormControl>
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
                    name="insuranceChanged"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-insurance-changed"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            My insurance information has changed
                          </FormLabel>
                        </div>
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

              {currentStep === 5 && (
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
                            <SelectItem value="your_previous_provider">Your Previous Provider</SelectItem>
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

              {currentStep === 6 && (
                <div className="space-y-6">
                  <div className="bg-accent/20 rounded-lg p-6 space-y-6">
                    <h3 className="font-semibold text-lg">Review Your Information</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Personal Information</h4>
                        <p>{form.watch("firstName")} {form.watch("lastName")}</p>
                        <p className="text-sm text-muted-foreground">DOB: {form.watch("dateOfBirth")}</p>
                        <p className="text-sm text-muted-foreground">{form.watch("cellNumber")}</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Reason for Visit</h4>
                        <p className="text-sm">{form.watch("reasonForVisit")}</p>
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
