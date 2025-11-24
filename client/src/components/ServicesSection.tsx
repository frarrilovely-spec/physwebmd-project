import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { services } from "@/lib/services-data";
import serviceBackground from "@assets/generated_images/medical_team_collaboration_background.png";

export function ServicesSection() {
  return (
    <section id="services" className="py-20 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Our Services</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive behavioral health services tailored to your unique needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Card key={service.id} className="relative overflow-hidden hover-elevate transition-all" data-testid={`card-service-${service.id}`}>
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-5"
                  style={{ backgroundImage: `url(${serviceBackground})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-background/95 to-background/90" />
                <div className="relative z-10">
                  <CardHeader>
                    <div className="rounded-lg bg-primary/10 w-16 h-16 flex items-center justify-center mb-4 mx-auto">
                      {service.iconImage ? (
                        <img 
                          src={service.iconImage} 
                          alt={service.title} 
                          className="w-10 h-10 object-contain"
                        />
                      ) : Icon ? (
                        <Icon className="h-8 w-8 text-primary" />
                      ) : null}
                    </div>
                    <CardTitle className="text-xl text-center">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed text-center">
                      {service.description}
                    </CardDescription>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
