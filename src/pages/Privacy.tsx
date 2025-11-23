import { Shield, Lock, Eye, Database, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";

const Privacy = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4">{t('privacy.title')}</h1>
        <p className="text-xl text-muted-foreground">
          {t('privacy.subtitle')}
        </p>
      </div>

      <Alert className="mb-8">
        <FileText className="h-4 w-4" />
        <AlertTitle>{t('privacy.lastUpdated')}</AlertTitle>
        <AlertDescription>
          {t('privacy.lastUpdateDate')}
        </AlertDescription>
      </Alert>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              {t('privacy.dataCollectionTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">{t('privacy.personalInfoTitle')}</h3>
              <p className="text-muted-foreground mb-2">{t('privacy.personalInfoDesc')}</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>{t('privacy.dataPoint1')}</li>
                <li>{t('privacy.dataPoint2')}</li>
                <li>{t('privacy.dataPoint3')}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">{t('privacy.screenTimeTitle')}</h3>
              <p className="text-muted-foreground mb-2">{t('privacy.screenTimeDesc')}</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>{t('privacy.screenPoint1')}</li>
                <li>{t('privacy.screenPoint2')}</li>
                <li>{t('privacy.screenPoint3')}</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              {t('privacy.dataProtectionTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{t('privacy.dataProtectionDesc')}</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>{t('privacy.protection1')}</li>
              <li>{t('privacy.protection2')}</li>
              <li>{t('privacy.protection3')}</li>
              <li>{t('privacy.protection4')}</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              {t('privacy.researchUseTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{t('privacy.researchUseDesc')}</p>
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">{t('privacy.anonymizationTitle')}</h4>
              <p className="text-sm text-muted-foreground">{t('privacy.anonymizationDesc')}</p>
            </div>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>{t('privacy.research1')}</li>
              <li>{t('privacy.research2')}</li>
              <li>{t('privacy.research3')}</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('privacy.yourRightsTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">{t('privacy.yourRightsDesc')}</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>{t('privacy.right1')}</li>
              <li>{t('privacy.right2')}</li>
              <li>{t('privacy.right3')}</li>
              <li>{t('privacy.right4')}</li>
              <li>{t('privacy.right5')}</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('privacy.consentTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{t('privacy.consentDesc')}</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>{t('privacy.consent1')}</li>
              <li>{t('privacy.consent2')}</li>
              <li>{t('privacy.consent3')}</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('privacy.contactTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{t('privacy.contactDesc')}</p>
            <div className="space-y-2">
              <p className="font-medium">{t('privacy.dataProtectionOfficer')}</p>
              <a 
                href="mailto:privacy@screenguardian.edu" 
                className="text-primary hover:underline block"
              >
                privacy@screenguardian.edu
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;
