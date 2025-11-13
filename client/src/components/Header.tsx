import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import logoUrl from "@assets/ChatGPT Image Nov 13, 2025, 07_21_40 AM_1763000509257.png";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (location !== "/") {
      window.location.href = `/#${sectionId}`;
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center space-x-3 hover-elevate active-elevate-2 transition-all rounded-md px-2 py-1 -mx-2" data-testid="link-home">
          <img src={logoUrl} alt="PsychWebMD" className="h-10 w-10" />
          <span className="text-xl font-bold text-primary">PsychWebMD</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => scrollToSection("services")}
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            data-testid="button-nav-services"
          >
            Services
          </button>
          <button
            onClick={() => scrollToSection("about")}
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            data-testid="button-nav-about"
          >
            About
          </button>
          <button
            onClick={() => scrollToSection("insurance")}
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            data-testid="button-nav-insurance"
          >
            Insurance
          </button>
          <button
            onClick={() => scrollToSection("faq")}
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            data-testid="button-nav-faq"
          >
            FAQ
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            data-testid="button-nav-contact"
          >
            Contact
          </button>
          <Link href="/book-appointment">
            <Button size="default" data-testid="button-book-appointment">
              Book Appointment
            </Button>
          </Link>
        </nav>

        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          data-testid="button-mobile-menu-toggle"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container mx-auto flex flex-col gap-4 px-4 py-6">
            <button
              onClick={() => scrollToSection("services")}
              className="text-left text-sm font-medium text-foreground hover:text-primary transition-colors"
              data-testid="button-mobile-services"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="text-left text-sm font-medium text-foreground hover:text-primary transition-colors"
              data-testid="button-mobile-about"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("insurance")}
              className="text-left text-sm font-medium text-foreground hover:text-primary transition-colors"
              data-testid="button-mobile-insurance"
            >
              Insurance
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="text-left text-sm font-medium text-foreground hover:text-primary transition-colors"
              data-testid="button-mobile-faq"
            >
              FAQ
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-left text-sm font-medium text-foreground hover:text-primary transition-colors"
              data-testid="button-mobile-contact"
            >
              Contact
            </button>
            <Button 
              className="w-full" 
              size="default" 
              data-testid="button-mobile-book-appointment"
              onClick={() => {
                setMobileMenuOpen(false);
                window.location.href = '/book-appointment';
              }}
            >
              Book Appointment
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
