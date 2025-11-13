import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { locations } from "@/lib/services-data";

export function ContactSection() {
  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Get In Touch</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Visit us at any of our convenient locations or reach out to learn more
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {locations.map((location, index) => (
            <Card key={index} className="hover-elevate transition-all" data-testid={`location-${index}`}>
              <CardHeader>
                <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{location.name}</CardTitle>
                <CardDescription>{location.address}</CardDescription>
                <CardDescription>{location.city}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <a
                    href={`tel:${location.phone}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {location.phone}
                  </a>
                </div>
                {location.fax && (
                  <div className="text-sm text-muted-foreground">
                    Fax: {location.fax}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-card rounded-2xl p-8 shadow-lg border border-border max-w-2xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center flex-shrink-0">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">Office Hours</h3>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">Monday - Friday:</span>
                  <span className="text-muted-foreground">9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">Saturday - Sunday:</span>
                  <span className="text-muted-foreground">Closed</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4 text-primary" />
              <a
                href="mailto:info@psychwebmd.com"
                className="hover:text-primary transition-colors"
                data-testid="link-contact-email"
              >
                info@psychwebmd.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
