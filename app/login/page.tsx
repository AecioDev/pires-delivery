"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, LogIn } from "lucide-react";
import { loginAdmin } from "@/actions/auth";
import { toast } from "sonner";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    try {
      const res = await loginAdmin(password);
      if (res.success) {
        toast.success("Acesso liberado!");
        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        toast.error(res.message || "Senha incorreta");
      }
    } catch (err) {
      console.error(err);
      toast.error("Ocorreu um erro ao tentar acessar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-tr from-yellow-400 to-orange-600 mb-4 shadow-lg shadow-orange-500/20">
          <Lock className="w-8 h-8 text-slate-900" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Acesso Restrito</h1>
        <p className="text-slate-400">Área exclusiva para administração.</p>
      </div>

      <Card className="w-full max-w-sm border-slate-800 bg-slate-950/50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500">
        <form onSubmit={handleLogin}>
          <CardHeader>
            <CardTitle className="text-white">Autenticação</CardTitle>
            <CardDescription className="text-slate-400">
              Digite a senha mestra para acessar o Backoffice.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha secreta..."
                  className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 h-12"
                  autoFocus
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={loading || !password}
              className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-bold"
            >
              {loading ? (
                "Verificando..."
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Entrar no Painel
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className="mt-8 text-xs text-slate-500 text-center">
        &copy; {new Date().getFullYear()} Salgados.ai. Todos os direitos
        reservados.
      </div>
    </div>
  );
}
