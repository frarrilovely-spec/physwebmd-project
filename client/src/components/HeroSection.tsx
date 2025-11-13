import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Calendar, Video, Users } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/10 py-20 md:py-32">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
      
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-block">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary" data-testid="badge-trusted">
                  Trusted Behavioral Healthcare Provider
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Behavioral Healthcare:
                <span className="text-primary block mt-2">Anywhere, Anytime</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                We're the go-to provider for individuals seeking compassionate, personalized behavioral healthcare. 
                Your care is our passion.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/book-appointment">
                <Button size="lg" className="text-base group" data-testid="button-hero-book-appointment">
                  Book Appointment
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-base" onClick={() => {
                const element = document.getElementById("about");
                element?.scrollIntoView({ behavior: "smooth" });
              }} data-testid="button-hero-learn-more">
                Learn More
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Quick Access</p>
                  <p className="text-sm text-muted-foreground">Same-week appointments</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Video className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Online & In-Person</p>
                  <p className="text-sm text-muted-foreground">Care that fits your life</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Expert Providers</p>
                  <p className="text-sm text-muted-foreground">Matched to your needs</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-accent/30 rounded-full blur-3xl" />
            <div className="relative bg-card rounded-2xl shadow-2xl p-8 border border-border">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">Start Your Journey</h3>
                  <p className="text-muted-foreground">Choose how you'd like to begin care</p>
                </div>
                <div className="space-y-3">
                  <Link href="/book-appointment?type=new">
                    <div className="p-4 rounded-lg border border-border hover:border-primary hover:bg-accent/50 transition-all cursor-pointer hover-elevate" data-testid="card-new-patient">
                      <h4 className="font-semibold text-foreground mb-1">New Patient</h4>
                      <p className="text-sm text-muted-foreground">First-time comprehensive evaluation</p>
                    </div>
                  </Link>
                  <Link href="/book-appointment?type=existing">
                    <div className="p-4 rounded-lg border border-border hover:border-primary hover:bg-accent/50 transition-all cursor-pointer hover-elevate" data-testid="card-existing-patient">
                      <h4 className="font-semibold text-foreground mb-1">Existing Patient</h4>
                      <p className="text-sm text-muted-foreground">Follow-up or ongoing care</p>
                    </div>
                  </Link>
                  <Link href="/book-appointment?type=intake">
                    <div className="p-4 rounded-lg border border-border hover:border-primary hover:bg-accent/50 transition-all cursor-pointer hover-elevate" data-testid="card-intake-form">
                      <h4 className="font-semibold text-foreground mb-1">Intake Form</h4>
                      <p className="text-sm text-muted-foreground">Complete detailed assessment</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
