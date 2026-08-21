import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import logoAsset from "@/assets/inkspire-hq-logo.png.asset.json";

const safeNext = (value: string | null) =>
  value && value.startsWith("/") && !value.startsWith("//") ? value : "/community";

const Auth = () => {
  useSeo("Sign in | Academix", "Sign in to Academix to build your research profile, connect with professors and discover opportunities.", { noindex: true });
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ email: "", password: "", fullName: "" });
  const [accountType, setAccountType] = useState<"student" | "professor">("student");

  // Password recovery / reset
  const [recovery, setRecovery] = useState(
    () => params.get("mode") === "reset" || window.location.hash.includes("type=recovery"),
  );
  const [newPassword, setNewPassword] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!authLoading && user && !recovery) navigate(next, { replace: true });
  }, [user, authLoading, next, navigate, recovery]);

  const sendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });
    setLoading(false);
    if (error) toast({ title: "Could not send email", description: error.message, variant: "destructive" });
    else {
      setForgotOpen(false);
      setForgotEmail("");
      toast({ title: "Check your email", description: "We sent you a password reset link." });
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      toast({ title: "Could not update password", description: error.message, variant: "destructive" });
      return;
    }
    setRecovery(false);
    toast({ title: "Password updated", description: "You're signed in with your new password." });
    navigate("/profile", { replace: true });
  };

  const handleGoogle = async () => {
    setLoading(true);

    sessionStorage.setItem("academix:next", next);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth`,
      },
    });

    if (error) {
      setLoading(false);
      toast({
        title: "Google sign-in failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginForm.email,
      password: loginForm.password,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      navigate(next, { replace: true });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: signupForm.email,
      password: signupForm.password,
      options: {
        data: { full_name: signupForm.fullName, role: accountType },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
      return;
    }
    if (data.session) {
      toast({ title: "Welcome to Academix" });
      navigate(accountType === "professor" ? "/settings" : "/profile?setup=1", { replace: true });
    } else {
      toast({ title: "Check your email", description: "We sent you a verification link." });
    }
  };

  // Show a spinner while auth state is still hydrating so the form doesn't flash
  // for users who are already signed in.
  if (authLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md border-border shadow-elevated">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <img
              src={logoAsset.url}
              alt="Inkspire HQ"
              decoding="async"
              className="h-24 w-auto object-contain"
            />
          </div>
          <CardTitle className="text-2xl tracking-tight">Welcome to Academix</CardTitle>
          <CardDescription>One account for your research profile, network and opportunities.</CardDescription>
        </CardHeader>
        <CardContent>
          {recovery ? (
            <div className="space-y-5">
              <div className="text-center">
                <h3 className="text-lg font-semibold">Set a new password</h3>
                <p className="text-sm text-muted-foreground mt-1">Choose a strong password for your account.</p>
              </div>
              <form onSubmit={updatePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>New password</Label>
                  <Input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update password"}
                </Button>
              </form>
              <button
                type="button"
                onClick={() => setRecovery(false)}
                className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition w-full"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              <Button variant="outline" className="w-full h-10" onClick={handleGoogle} disabled={loading}>
                Continue with Google
              </Button>

              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground">or</span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <Tabs defaultValue="login">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign in</TabsTrigger>
                  <TabsTrigger value="signup">Create account</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4 mt-4">
                    <div className="space-y-1.5">
                      <Label>Email</Label>
                      <Input type="email" required value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label>Password</Label>
                        <button
                          type="button"
                          onClick={() => setForgotOpen(true)}
                          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <Input type="password" required value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4 mt-4">
                    <div className="space-y-1.5">
                      <Label>I am a</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: "student" as const, label: "Student / Researcher" },
                          { value: "professor" as const, label: "Professor" },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setAccountType(opt.value)}
                            className={`rounded-lg border p-3 text-left text-sm font-medium transition ${
                              accountType === opt.value
                                ? "border-accent bg-secondary/60 text-primary"
                                : "border-border text-muted-foreground hover:bg-secondary/40"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {accountType === "professor"
                          ? "You'll be able to publish your own mentor directory listing."
                          : "Build a research profile, follow mentors and discover opportunities."}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Full name</Label>
                      <Input required value={signupForm.fullName} onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })} />
                    </div>

                    <div className="space-y-1.5">
                      <Label>Email</Label>
                      <Input type="email" required value={signupForm.email} onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Password</Label>
                      <Input type="password" required minLength={8} value={signupForm.password} onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })} />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </>
          )}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            You stay signed in on this device.{" "}
            <Link to="/" className="underline underline-offset-2">Back to home</Link>
          </p>
        </CardContent>
      </Card>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to set a new password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={sendReset} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="you@university.edu"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={() => setForgotOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send reset link"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
