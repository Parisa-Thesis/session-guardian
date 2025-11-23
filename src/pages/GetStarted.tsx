import { Shield, UserPlus, Users, FlaskConical, CheckCircle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";

const GetStarted = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4">{t('getStarted.title')}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('getStarted.subtitle')}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 mb-12">
        <Card className="relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <Badge variant="secondary">{t('roles.parent')}</Badge>
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              {t('getStarted.forParentsTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{t('getStarted.forParentsDesc')}</p>
            
            <div className="space-y-3">
              <h4 className="font-semibold">{t('getStarted.stepsTitle')}</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{t('getStarted.parentStep1')}</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{t('getStarted.parentStep2')}</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{t('getStarted.parentStep3')}</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{t('getStarted.parentStep4')}</p>
                </div>
              </div>
            </div>

            <Link to="/auth">
              <Button className="w-full gap-2">
                <UserPlus className="h-4 w-4" />
                {t('getStarted.signUpAsParent')}
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <Badge variant="secondary">{t('roles.researcher')}</Badge>
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="h-6 w-6 text-primary" />
              {t('getStarted.forResearchersTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{t('getStarted.forResearchersDesc')}</p>
            
            <div className="space-y-3">
              <h4 className="font-semibold">{t('getStarted.stepsTitle')}</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{t('getStarted.researcherStep1')}</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{t('getStarted.researcherStep2')}</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{t('getStarted.researcherStep3')}</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{t('getStarted.researcherStep4')}</p>
                </div>
              </div>
            </div>

            <Link to="/auth">
              <Button className="w-full gap-2" variant="secondary">
                <UserPlus className="h-4 w-4" />
                {t('getStarted.signUpAsResearcher')}
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('getStarted.featuresTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <h4 className="font-semibold mb-2">{t('getStarted.feature1Title')}</h4>
              <p className="text-sm text-muted-foreground">{t('getStarted.feature1Desc')}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">{t('getStarted.feature2Title')}</h4>
              <p className="text-sm text-muted-foreground">{t('getStarted.feature2Desc')}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">{t('getStarted.feature3Title')}</h4>
              <p className="text-sm text-muted-foreground">{t('getStarted.feature3Desc')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-12 text-center">
        <p className="text-muted-foreground mb-4">{t('getStarted.needHelpTitle')}</p>
        <Link to="/contact">
          <Button variant="outline">{t('getStarted.contactUs')}</Button>
        </Link>
      </div>
    </div>
  );
};

export default GetStarted;
