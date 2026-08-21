import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import logoAsset from "@/assets/inkspire-hq-logo.png.asset.json";

const DEFAULT_NEXT = "/";

function safeNext(value: string | null): string {
  if (
    value &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.startsWith("/auth")
  ) {
    return value;
  }

  return DEFAULT_NEXT;
}

const Auth = () => {
  useSeo(
    "Sign in | Academix",
    "Sign in to Academix to build your research profile, connect with professors and discover opportunities.",
    { noindex: true }
  );

  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const next = useMemo(
    () => safeNext(params.get("next")),
    [params]
  );

  const [loading, setLoading] = useState(false);
  const [oauthProcessing, setOauthProcessing] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [signupForm, setSignupForm] = useState({
    email: "",
    password: "",
    fullName: "",
  });

  const [accountType, setAccountType] = useState<"student" | "professor">(
    "student"
  );

  const [recovery, setRecovery] = useState(
    () =>
      params.get("mode") === "reset" ||
      window.location.hash.includes("type=recovery")
  );

  const [newPassword, setNewPassword] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  /*
   * ----------------------------------------------------
   * OAuth callback
   * ----------------------------------------------------
   *
   * Supabase PKCE returns:
   *
   * /auth?code=...
   *
   * The browser must exchange that code for a session
   * BEFORE navigating away from /auth.
   */
  useEffect(() => {
    let mounted = true;

    const finishOAuth = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      if (!code) {
        return;
      }

      setOauthProcessing(true);

      try {
        console.log("[Academix Auth] OAuth callback detected");

        const { data, error } =
          await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error(
            "[Academix Auth] OAuth exchange failed:",
            error
          );

          if (mounted) {
            toast({
              title: "Google sign-in failed",
              description: error.message,
              variant: "destructive",
            });
          }

          return;
        }

        if (!data.session) {
          throw new Error("Google authentication completed without a session.");
        }

        console.log("[Academix Auth] OAuth session established");

        /*
         * Remove OAuth code from browser URL.
         * This prevents accidental code reuse.
         */
        url.searchParams.delete("code");

        const cleanQuery = url.searchParams.toString();

        const cleanUrl =
          url.pathname +
          (cleanQuery ? `?${cleanQuery}` : "");

        window.history.replaceState(
          {},
          document.title,
          cleanUrl
        );

        /*
         * Always use the saved safe destination.
         */
        const savedNext = safeNext(
          sessionStorage.getItem("academix:next")
        );

        const destination =
          savedNext !== DEFAULT_NEXT
            ? savedNext
            : safeNext(params.get("next"));

        sessionStorage.removeItem("academix:next");

        if (mounted) {
          navigate(destination, { replace: true });
        }
      } catch (error) {
        console.error(
          "[Academix Auth] OAuth callback exception:",
          error
        );

        if (mounted) {
          toast({
            title: "Google sign-in failed",
            description:
              error instanceof Error
                ? error.message
                : "Authentication could not be completed.",
            variant: "destructive",
          });
        }
      } finally {
        if (mounted) {
          setOauthProcessing(false);
          setLoading(false);
        }
      }
    };

    finishOAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      console.log("[Academix Auth] Auth event:", event);

      if (event === "PASSWORD_RECOVERY") {
        setRecovery(true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, params, toast]);

  /*
   * ----------------------------------------------------
   * Already authenticated
   * ----------------------------------------------------
   */
  useEffect(() => {
    if (
      !authLoading &&
      user &&
      !recovery &&
      !oauthProcessing
    ) {
      const destination = safeNext(
        sessionStorage.getItem("academix:next")
      );

      sessionStorage.removeItem("academix:next");

      navigate(
        destination || next || DEFAULT_NEXT,
        { replace: true }
      );
    }
  }, [
    user,
    authLoading,
    recovery,
    oauthProcessing,
    navigate,
    next,
  ]);

  /*
   * ----------------------------------------------------
   * Password reset
   * ----------------------------------------------------
   */
  const sendReset = async (e: React.FormEvent) => {
    e.preventDefault();

    const email = forgotEmail.trim();

    if (!email) return;

    setLoading(true);

    const { error } =
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo:
          `${window.location.origin}/auth?mode=reset`,
      });

    setLoading(false);

    if (error) {
      toast({
        title: "Could not send reset email",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setForgotOpen(false);
    setForgotEmail("");

    toast({
      title: "Check your email",
      description:
        "We sent you a password reset link.",
    });
  };

  /*
   * ----------------------------------------------------
   * Update password
   * ----------------------------------------------------
   */
  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast({
        title: "Password too short",
        description:
          "Your password must contain at least 8 characters.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } =
      await supabase.auth.updateUser({
        password: newPassword,
      });

    setLoading(false);

    if (error) {
      toast({
        title: "Could not update password",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setRecovery(false);
    setNewPassword("");

    toast({
      title: "Password updated",
      description:
        "You're signed in with your new password.",
    });

    navigate("/profile", { replace: true });
  };

  /*
   * ----------------------------------------------------
   * Google
   * ----------------------------------------------------
   */
  const handleGoogle = async () => {
    if (loading || oauthProcessing) return;

    setLoading(true);

    const destination = safeNext(
      new URLSearchParams(window.location.search).get("next")
    );

    sessionStorage.setItem(
      "academix:next",
      destination
    );

    const redirectTo =
      `${window.location.origin}/auth?next=${encodeURIComponent(
        destination
      )}`;

    console.log(
      "[Academix Auth] Google redirect:",
      redirectTo
    );

    const { error } =
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

    if (error) {
      console.error(
        "[Academix Auth] Google OAuth start failed:",
        error
      );

      setLoading(false);

      toast({
        title: "Google sign-in failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  /*
   * ----------------------------------------------------
   * Email/password login
   * ----------------------------------------------------
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    const email = loginForm.email.trim();

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password: loginForm.password,
      });

    setLoading(false);

    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    sessionStorage.removeItem("academix:next");

    toast({
      title: "Welcome back",
      description: "You are now signed in.",
    });

    navigate(next, { replace: true });
  };

  /*
   * ----------------------------------------------------
   * Signup
   * ----------------------------------------------------
   */
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const email = signupForm.email.trim();
    const fullName = signupForm.fullName.trim();

    if (!email || !signupForm.password || !fullName) {
      toast({
        title: "Missing information",
        description:
          "Please complete all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (signupForm.password.length < 8) {
      toast({
        title: "Password too short",
        description:
          "Your password must contain at least 8 characters.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    /*
     * Keep emailRedirectTo on the same production origin.
     * This avoids sending users through Lovable or another
     * development domain.
     */
    const emailRedirectTo =
      `${window.location.origin}/auth?next=${encodeURIComponent(
        accountType === "professor"
          ? "/settings"
          : "/profile?setup=1"
      )}`;

    const { data, error } =
      await supabase.auth.signUp({
        email,
        password: signupForm.password,
        options: {
          data: {
            full_name: fullName,
            role: accountType,
          },
          emailRedirectTo,
        },
      });

    setLoading(false);

    if (error) {
      console.error(
        "[Academix Auth] Signup error:",
        error
      );

      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });

      return;
    }

    if (data.session) {
      toast({
        title: "Welcome to Academix",
        description: "Your account has been created.",
      });

      navigate(
        accountType === "professor"
          ? "/settings"
          : "/profile?setup=1",
        { replace: true }
      );

      return;
    }

    toast({
      title: "Check your email",
      description:
        "We sent you a verification link. Open it to finish creating your account.",
    });
  };

  if (authLoading || oauthProcessing) {
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

          <CardTitle className="text-2xl tracking-tight">
            Welcome to Academix
          </CardTitle>

          <CardDescription>
            One account for your research profile, network and opportunities.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {recovery ? (
            <div className="space-y-5">
              <div className="text-center">
                <h3 className="text-lg font-semibold">
                  Set a new password
                </h3>

                <p className="text-sm text-muted-foreground mt-1">
                  Choose a strong password for your account.
                </p>
              </div>

              <form
                onSubmit={updatePassword}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label>New password</Label>

                  <Input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(e.target.value)
                    }
                    placeholder="At least 8 characters"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Update password"
                  )}
                </Button>
              </form>
            </div>
          ) : (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="login">
                  Sign in
                </TabsTrigger>

                <TabsTrigger value="signup">
                  Create account
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form
                  onSubmit={handleLogin}
                  className="space-y-4 mt-5"
                >
                  <div className="space-y-1.5">
                    <Label>Email</Label>

                    <Input
                      type="email"
                      required
                      value={loginForm.email}
                      onChange={(e) =>
                        setLoginForm({
                          ...loginForm,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Password</Label>

                    <Input
                      type="password"
                      required
                      value={loginForm.password}
                      onChange={(e) =>
                        setLoginForm({
                          ...loginForm,
                          password: e.target.value,
                        })
                      }
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Sign in"
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogle}
                    disabled={loading}
                  >
                    Continue with Google
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form
                  onSubmit={handleSignup}
                  className="space-y-4 mt-5"
                >
                  <div className="space-y-1.5">
                    <Label>Full name</Label>

                    <Input
                      required
                      value={signupForm.fullName}
                      onChange={(e) =>
                        setSignupForm({
                          ...signupForm,
                          fullName: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Email</Label>

                    <Input
                      type="email"
                      required
                      value={signupForm.email}
                      onChange={(e) =>
                        setSignupForm({
                          ...signupForm,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Password</Label>

                    <Input
                      type="password"
                      required
                      minLength={8}
                      value={signupForm.password}
                      onChange={(e) =>
                        setSignupForm({
                          ...signupForm,
                          password: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Account type</Label>

                    <select
                      value={accountType}
                      onChange={(e) =>
                        setAccountType(
                          e.target.value as
                            | "student"
                            | "professor"
                        )
                      }
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    >
                      <option value="student">
                        Student
                      </option>

                      <option value="professor">
                        Professor
                      </option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Create account"
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogle}
                    disabled={loading}
                  >
                    Continue with Google
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
