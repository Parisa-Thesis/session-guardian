import { Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <span className="text-lg font-bold">{t('parent.screenGuardian')}</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-2">
              {t('footer.tagline')}
            </p>
            <p className="text-xs text-muted-foreground italic">
              {t('footer.academicProject')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.getStarted')}</h3>
            <Link 
              to="/get-started" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors block"
            >
              {t('footer.getStarted')} →
            </Link>
          </div>

          {/* About & Contact */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.aboutUs')}</h3>
            <Link 
              to="/about"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors block mb-2"
            >
              {t('footer.aboutUs')} →
            </Link>
            
            <h3 className="font-semibold mb-4 mt-6">{t('footer.contact')}</h3>
            <Link 
              to="/contact"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors block"
            >
              {t('footer.contact')} →
            </Link>
          </div>

          {/* Privacy & Legal */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.privacy')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.dataProtection')}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.ethicsCompliance')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {currentYear} {t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};
