import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Shield, BarChart3, Users, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Get user role and redirect to appropriate dashboard
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();

          if (profile?.role) {
            navigate(`/dashboard/${profile.role}`, { replace: true });
            return;
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setLoading(false);
      }
    };

    // Set a timeout to ensure page loads even if auth check hangs
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    checkAuthAndRedirect();

    return () => clearTimeout(timeout);
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  const features = [
    {
      icon: Shield,
      title: "Screen Time Protection",
      description: "Monitor and manage your children's device usage with comprehensive tracking.",
    },
    {
      icon: BarChart3,
      title: "Detailed Analytics",
      description: "Get insights into screen activity patterns with interactive charts and reports.",
    },
    {
      icon: Users,
      title: "Research Platform",
      description: "Contribute to research on digital wellbeing and child development.",
    },
    {
      icon: Lock,
      title: "Privacy First",
      description: "Your family's data is encrypted and securely stored with enterprise-grade protection.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Screen Guardian
              </span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
              Protect your family's digital wellbeing with intelligent screen time monitoring and research-backed insights.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all">
                  Get Started
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold">Everything You Need</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Comprehensive tools for parents and researchers to understand and improve children's digital experiences.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-lg"
              >
                <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-gradient-to-r from-primary to-secondary p-12 text-center text-white shadow-2xl"
          >
            <h2 className="mb-4 text-4xl font-bold">Ready to Get Started?</h2>
            <p className="mb-8 text-lg opacity-90">
              Join thousands of families protecting their digital wellbeing.
            </p>
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="shadow-lg">
                Create Your Account
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
