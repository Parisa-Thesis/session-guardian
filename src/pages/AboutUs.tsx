import { Shield, Users, Target, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const AboutUs = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4">{t('about.title')}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('about.subtitle')}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {t('about.missionTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t('about.missionDesc')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              {t('about.researchTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t('about.researchDesc')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {t('about.whoWeServeTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">{t('roles.parent')}</h3>
            <p className="text-muted-foreground">
              {t('about.parentsDesc')}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">{t('roles.researcher')}</h3>
            <p className="text-muted-foreground">
              {t('about.researchersDesc')}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">{t('about.institutions')}</h3>
            <p className="text-muted-foreground">
              {t('about.institutionsDesc')}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="bg-muted/50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">{t('about.ethicsTitle')}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t('about.ethicsDesc')}
        </p>
      </div>
    </div>
  );
};

export default AboutUs;
