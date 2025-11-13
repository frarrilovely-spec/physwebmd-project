export function InsuranceSection() {
  const insuranceProviders = [
    { name: "Aetna", id: "aetna" },
    { name: "Cigna", id: "cigna" },
    { name: "United Healthcare", id: "uhc" },
    { name: "Blue Cross Blue Shield", id: "bcbs" },
    { name: "Humana", id: "humana" },
  ];

  return (
    <section id="insurance" className="py-20 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            We Accept Most Major Insurance
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We offer affordable care for everyone and work with most major insurance providers
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 max-w-5xl mx-auto items-center">
          {insuranceProviders.map((provider) => (
            <div
              key={provider.id}
              className="flex items-center justify-center p-6 rounded-lg bg-card border border-border hover-elevate transition-all"
              data-testid={`insurance-${provider.id}`}
            >
              <span className="text-lg font-semibold text-foreground text-center">
                {provider.name}
              </span>
            </div>
          ))}
        </div>

        <p className="text-center text-muted-foreground mt-8 text-sm">
          ...and more. Contact us to verify your specific plan.
        </p>
      </div>
    </section>
  );
}
