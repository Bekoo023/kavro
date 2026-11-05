"use client";

import { useActionState } from "react";
import { login, type LoginState } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label htmlFor="password" className="block font-medium">
          Wachtwoord
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? "login-fout" : undefined}
          className="field mt-2"
        />
        {state.error && (
          <p id="login-fout" className="mt-2 text-danger">
            {state.error}
          </p>
        )}
      </div>
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Bezig…" : "Inloggen"}
      </button>
    </form>
  );
}
