import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <span className="text-lg font-bold">Screen Guardian</span>
        </Link>

        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Button variant="ghost" onClick={handleSignOut}>
                خروج
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost">ورود</Button>
              </Link>
              <Link to="/auth">
                <Button>ثبت نام</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
