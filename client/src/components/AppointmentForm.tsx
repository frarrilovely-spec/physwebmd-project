import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { services, locations } from "@/lib/services-data";
import { insertAppointmentSchema, type InsertAppointment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AppointmentType = "new" | "existing" | "intake";

interface AppointmentFormProps {
  appointmentType: AppointmentType;
  onBack: () => void;
}

const appointmentFormSchema = insertAppointmentSchema.extend({
  reasonForVisit: insertAppointmentSchema.shape.reasonForVisit,
  serviceType: insertAppointmentSchema.shape.serviceType,
  preferredLocation: insertAppointmentSchema.shape.preferredLocation,
  appointmentMode: insertAppointmentSchema.shape.appointmentMode,
});

type AppointmentFormValues = InsertAppointment;

export function AppointmentForm({ appointmentType, onBack }: AppointmentFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  const totalSteps = appointmentType === "intake" ? 6 : appointmentType === "new" ? 5 : 4;

  const storageKey = `appointment-form-${appointmentType}`;

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      appointmentType,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      insuranceProvider: "",
      insuranceMemberId: "",
      insuranceGroupNumber: "",
      medicalHistory: "",
      currentMedications: "",
      allergies: "",
      reasonForVisit: "",
      preferredDate: "",
      preferredTime: "",
      preferredLocation: "",
      appointmentMode: "",
      serviceType: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      previousTherapy: "",
      symptoms: "",
      additionalNotes: "",
    },
  });

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const savedData = JSON.parse(saved);
        form.reset({ ...savedData, appointmentType });
      } catch (error) {
        console.error("Error loading saved form data:", error);
      }
    }
  }, [appointmentType, storageKey, form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem(storageKey, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form, storageKey]);

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: InsertAppointment) => {
      return await apiRequest("POST", "/api/appointments", data);
    },
    onSuccess: () => {
      toast({
        title: "Appointment Submitted",
        description: "We will contact you shortly to confirm your appointment.",
      });
      localStorage.removeItem(storageKey);
      onBack();
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
    let fieldsToValidate: (keyof AppointmentFormValues)[] = [];

    if (step === 1) {
      fieldsToValidate = ["firstName", "lastName", "email", "phone", "dateOfBirth", "address", "city", "state", "zipCode"];
    } else if (step === 2) {
      fieldsToValidate = ["insuranceProvider", "insuranceMemberId", "insuranceGroupNumber"];
    } else if (step === 3) {
      if (appointmentType === "existing") {
        fieldsToValidate = ["reasonForVisit", "serviceType", "preferredLocation", "appointmentMode"];
      } else {
        fieldsToValidate = ["medicalHistory", "currentMedications", "allergies", "emergencyContactName", "emergencyContactPhone"];
      }
    } else if (step === 4) {
      if (appointmentType === "new") {
        fieldsToValidate = ["reasonForVisit", "serviceType", "preferredLocation", "appointmentMode"];
      } else if (appointmentType === "intake") {
        fieldsToValidate = ["previousTherapy", "symptoms"];
      }
    } else if (step === 5 && appointmentType === "intake") {
      fieldsToValidate = ["reasonForVisit", "serviceType", "preferredLocation", "appointmentMode"];
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

  const onSubmit = (data: AppointmentFormValues) => {
    createAppointmentMutation.mutate(data);
  };

  const getStepTitle = (step: number): string => {
    if (step === 1) return "Personal Information";
    if (step === 2) return "Insurance Information";
    if (step === 3) {
      if (appointmentType === "existing") return "Appointment Details";
      return "Medical History";
    }
    if (step === 4) {
      if (appointmentType === "existing") return "Review & Submit";
      if (appointmentType === "new") return "Appointment Details";
      return "Symptoms & History";
    }
    if (step === 5) {
      if (appointmentType === "new") return "Review & Submit";
      return "Appointment Details";
    }
    return "Review & Submit";
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
            <CardTitle className="text-3xl">
              {appointmentType === "new" && "New Patient Appointment"}
              {appointmentType === "existing" && "Existing Patient Appointment"}
              {appointmentType === "intake" && "Intake Form"}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Step {currentStep} of {totalSteps}: {getStepTitle(currentStep)}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`h-2 flex-1 rounded-full transition-all ${
                    step <= currentStep ? "bg-primary" : "bg-muted"
                  }`}
                  data-testid={`progress-step-${step}`}
                />
                {step < totalSteps && <div className="w-2" />}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} data-testid="input-first-name" />
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
                            <Input placeholder="Doe" {...field} data-testid="input-last-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john.doe@example.com" {...field} data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="(555) 123-4567" {...field} data-testid="input-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} data-testid="input-address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Jamestown" {...field} data-testid="input-city" />
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
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="NY" {...field} data-testid="input-state" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code</FormLabel>
                          <FormControl>
                            <Input placeholder="14701" {...field} data-testid="input-zip-code" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="insuranceProvider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Insurance Provider</FormLabel>
                        <FormControl>
                          <Input placeholder="Blue Cross Blue Shield" {...field} data-testid="input-insurance-provider" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="insuranceMemberId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Member ID</FormLabel>
                          <FormControl>
                            <Input placeholder="ABC123456789" {...field} data-testid="input-insurance-member-id" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="insuranceGroupNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Group Number</FormLabel>
                          <FormControl>
                            <Input placeholder="GRP987654" {...field} data-testid="input-insurance-group-number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="bg-accent/30 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">
                      If you don't have insurance information readily available, you can skip these fields and 
                      provide them later. We accept most major insurance providers.
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 3 && (appointmentType === "new" || appointmentType === "intake") && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="medicalHistory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical History</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please describe any relevant medical conditions, past surgeries, or health issues..."
                            className="min-h-32"
                            {...field}
                            data-testid="textarea-medical-history"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currentMedications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Medications</FormLabel>
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
                        <FormLabel>Allergies</FormLabel>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="emergencyContactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Contact Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Jane Doe" {...field} data-testid="input-emergency-contact-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="emergencyContactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Contact Phone</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="(555) 987-6543" {...field} data-testid="input-emergency-contact-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {currentStep === 4 && appointmentType === "intake" && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="previousTherapy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Previous Therapy Experience</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Have you received therapy or psychiatric treatment before? If yes, please describe..."
                            className="min-h-32"
                            {...field}
                            data-testid="textarea-previous-therapy"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="symptoms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Symptoms</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please describe the symptoms you are experiencing and how they affect your daily life..."
                            className="min-h-32"
                            {...field}
                            data-testid="textarea-symptoms"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {((currentStep === 4 && appointmentType === "existing") || 
                (currentStep === 5 && appointmentType === "new") ||
                (currentStep === 6 && appointmentType === "intake")) && (
                <div className="space-y-6">
                  <div className="bg-accent/20 rounded-lg p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Review Your Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-muted-foreground">Name</p>
                        <p className="text-foreground">{form.watch("firstName")} {form.watch("lastName")}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Email</p>
                        <p className="text-foreground">{form.watch("email")}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Phone</p>
                        <p className="text-foreground">{form.watch("phone")}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Service Type</p>
                        <p className="text-foreground">{form.watch("serviceType") || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Location</p>
                        <p className="text-foreground">{form.watch("preferredLocation") || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Mode</p>
                        <p className="text-foreground">{form.watch("appointmentMode") || "Not specified"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {((currentStep === 3 && appointmentType === "existing") || 
                (currentStep === 4 && appointmentType === "new") ||
                (currentStep === 5 && appointmentType === "intake")) && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="serviceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-service-type">
                              <SelectValue placeholder="Select a service" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {services.map((service) => (
                              <SelectItem key={service.id} value={service.title}>
                                {service.title}
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
                    name="reasonForVisit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason for Visit *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please describe why you are seeking care and what you hope to achieve..."
                            className="min-h-32"
                            {...field}
                            data-testid="textarea-reason-for-visit"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="preferredDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-preferred-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="preferredTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Time</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-preferred-time">
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="morning">Morning (9:00 AM - 12:00 PM)</SelectItem>
                              <SelectItem value="afternoon">Afternoon (12:00 PM - 3:00 PM)</SelectItem>
                              <SelectItem value="evening">Evening (3:00 PM - 5:00 PM)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="preferredLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Location *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-preferred-location">
                              <SelectValue placeholder="Select a location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {locations.map((location, index) => (
                              <SelectItem key={index} value={location.name}>
                                {location.name}
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
                    name="appointmentMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Appointment Mode *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-appointment-mode">
                              <SelectValue placeholder="Select appointment mode" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="in-person">In-Person</SelectItem>
                            <SelectItem value="telehealth">Telehealth (Online)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="additionalNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any additional information you'd like us to know..."
                            className="min-h-24"
                            {...field}
                            data-testid="textarea-additional-notes"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  data-testid="button-previous-step"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                {currentStep < totalSteps ? (
                  <Button type="button" onClick={nextStep} data-testid="button-next-step">
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting} data-testid="button-submit-appointment">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Submit Appointment
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
