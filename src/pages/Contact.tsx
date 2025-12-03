import { Mail, MessageSquare, Phone, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { toast } from "sonner";

const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the message
    toast.success(t('contact.messageSent'));
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('contact.title')}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('contact.subtitle')}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              {t('contact.generalInquiries')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-muted-foreground">{t('contact.supportDesc')}</p>
            <a
              href="mailto:parisa.bakhshaee@studserv.uni-leipzig.de"
              className="text-primary hover:underline block"
            >
              parisa.bakhshaee@studserv.uni-leipzig.de
            </a>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              © Universität Leipzig
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-muted-foreground">Child Development and Intervention MSc</p>
            <p className="text-muted-foreground">Academic adviser: Professor Dr Tina Malti</p>
            <p className="text-muted-foreground">Researcher Assistant: Parisa bakhshaee</p>
          </CardContent>
        </Card>



        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              {t('contact.phone')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-2">{t('contact.phoneHours')}</p>
            <p className="font-medium">+49 (341) 97-32079</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {t('contact.location')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              © Universität Leipzig<br />
              Humboldt Science Centre for Child Development,<br />
              Jahnallee 59, <br />
              04109 Leipzig, Germany<br />

            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('contact.sendMessage')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">{t('contact.name')}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">{t('contact.subject')}</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">{t('contact.message')}</Label>
              <Textarea
                id="message"
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              {t('contact.sendButton')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Contact;
