import { CheckCircle2 } from "lucide-react";

export function AboutSection() {
  const features = [
    "Comprehensive evaluation process",
    "Provider matching to your specific needs",
    "Both in-person and online care options",
    "Personalized treatment plans",
    "Experienced behavioral health professionals",
    "Compassionate, judgment-free environment",
  ];

  return (
    <section id="about" className="py-20 bg-accent/20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Welcome to PsychWebMD
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                PsychWebMD is the go-to provider for individuals seeking compassionate, personalized 
                behavioral health care. Our providers are well equipped to address a wide range of 
                behavioral health needs, and we will ensure you are matched with the right provider.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                <span className="font-semibold text-primary">Your care is our passion.</span> Our evaluation 
                process is comprehensive and will help us determine whether medication, psychotherapy, or a 
                combination of both would be most effective for YOU.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We're redefining behavioral health care through our network of providers. Whether it's in 
                person or online, it's time to get the behavioral health care you deserve.
              </p>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
            <h3 className="text-2xl font-bold text-foreground mb-6">Why Choose Us</h3>
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3" data-testid={`feature-${index}`}>
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-foreground">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
