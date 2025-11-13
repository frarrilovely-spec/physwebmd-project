import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, UserCheck, ClipboardList } from "lucide-react";
import { AppointmentForm } from "@/components/AppointmentForm";

type AppointmentType = "new" | "existing" | "intake" | null;

export default function BookAppointment() {
  const [, setLocation] = useLocation();
  const [selectedType, setSelectedType] = useState<AppointmentType>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type") as AppointmentType;
    if (type && ["new", "existing", "intake"].includes(type)) {
      setSelectedType(type);
    }
  }, []);

  const appointmentTypes = [
    {
      id: "new" as const,
      title: "New Patient",
      description: "First-time comprehensive evaluation and treatment planning",
      icon: UserPlus,
    },
    {
      id: "existing" as const,
      title: "Existing Patient",
      description: "Follow-up appointment or ongoing care management",
      icon: UserCheck,
    },
    {
      id: "intake" as const,
      title: "Intake Form",
      description: "Complete detailed assessment questionnaire before your visit",
      icon: ClipboardList,
    },
  ];

  if (selectedType) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 md:px-6 py-12">
          <AppointmentForm
            appointmentType={selectedType}
            onBack={() => {
              setSelectedType(null);
              setLocation("/book-appointment");
            }}
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Book Your Appointment
            </h1>
            <p className="text-lg text-muted-foreground">
              Choose the appointment type that best fits your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {appointmentTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card
                  key={type.id}
                  className="cursor-pointer hover-elevate transition-all hover:border-primary"
                  onClick={() => setSelectedType(type.id)}
                  data-testid={`card-appointment-type-${type.id}`}
                >
                  <CardHeader>
                    <div className="rounded-lg bg-primary/10 w-16 h-16 flex items-center justify-center mb-4 mx-auto">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-center text-xl">{type.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center leading-relaxed">
                      {type.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="bg-accent/30 rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Not sure which option to choose? Our team will help guide you to the right type of care.
              Call us at <a href="tel:+17165264041" className="font-medium text-primary hover:underline">+1 (716) 526-4041</a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
