import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Link } from "wouter";
import logoUrl from "@assets/ChatGPT Image Nov 15, 2025, 08_48_07 PM_1763586534590.png";

export function Footer() {
  return (
    <footer className="bg-muted mt-16">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-3">
              <img src={logoUrl} alt="PsychWebMD" className="h-10 w-10" />
              <span className="text-xl font-bold text-primary">PsychWebMD</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Compassionate, personalized behavioral healthcare. Your care is our passion.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-home">
                Home
              </Link>
              <Link href="/book-appointment" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-book">
                Book Appointment
              </Link>
              <a href="#services" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-services">
                Services
              </a>
              <a href="#about" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-about">
                About Us
              </a>
            </nav>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <a href="tel:+17165264041" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-phone">
                  +1 (716) 526-4041
                </a>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <a href="mailto:info@psychwebmd.com" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-email">
                  info@psychwebmd.com
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Office Hours</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-muted-foreground">Monday - Friday</p>
                  <p className="font-medium text-foreground">9:00 AM - 5:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Serving Jamestown, Olean & Ridgway
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} PsychWebMD. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-privacy">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-terms">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
