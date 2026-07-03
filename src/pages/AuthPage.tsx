import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../components/ui/Button";
import { useServices } from "../hooks/useServices";

export function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const services = useServices();
  const navigate = useNavigate();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const name = String(form.get("name") ?? "Auralis Member");
    if (mode === "signup") {
      await services.auth.signup(name, email, password);
    } else {
      await services.auth.login(email, password);
    }
    toast.success(mode === "signup" ? "Account prepared" : "Welcome back");
    navigate("/gallery");
  }

  return (
    <div className="grid min-h-screen bg-bone text-charcoal lg:grid-cols-[1.05fr_0.95fr]">
      <section className="flex flex-col justify-between p-6 md:p-12">
        <Link to="/" className="font-serif text-3xl font-semibold">
          Auralis
        </Link>
        <div className="mx-auto w-full max-w-md py-20">
          <h1 className="font-serif text-5xl font-semibold leading-none">
            {mode === "signup" ? "Begin a private archive." : "Return to your archive."}
          </h1>
          <p className="mt-5 text-charcoal/62">
            This form talks to the auth contract today and can be backed by AWS
            Cognito later without UI changes.
          </p>
          <form onSubmit={submit} className="mt-10 space-y-4">
            {mode === "signup" ? (
              <label className="block">
                <span className="text-sm font-medium text-charcoal/70">Name</span>
                <input
                  name="name"
                  required
                  className="focus-ring mt-2 w-full rounded-2xl border border-charcoal/10 bg-ivory px-4 py-3"
                />
              </label>
            ) : null}
            <label className="block">
              <span className="text-sm font-medium text-charcoal/70">Email</span>
              <input
                name="email"
                type="email"
                required
                defaultValue="mira@auralis.photos"
                className="focus-ring mt-2 w-full rounded-2xl border border-charcoal/10 bg-ivory px-4 py-3"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-charcoal/70">Password</span>
              <input
                name="password"
                type="password"
                required
                defaultValue="auralis-demo"
                className="focus-ring mt-2 w-full rounded-2xl border border-charcoal/10 bg-ivory px-4 py-3"
              />
            </label>
            <Button className="w-full">
              {mode === "signup" ? "Create account" : "Enter gallery"}
            </Button>
          </form>
        </div>
      </section>
      <aside className="hidden overflow-hidden p-4 lg:block">
        <img
          src="https://picsum.photos/seed/auth-warm-gallery/1200/1600"
          alt=""
          className="h-full w-full rounded-[2.25rem] object-cover grayscale contrast-125"
        />
      </aside>
    </div>
  );
}
