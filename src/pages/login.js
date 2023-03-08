import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";

const Login = () => {
  const { data: session } = useSession();
  if (session) {
    return (
      <>
        <h1>Welcome, {session.user?.email} to our dashboard</h1>
        <button
          onClick={(ev) => {
            ev.preventDefault();
            signOut();
          }}
        >
          Sign Out
        </button>
      </>
    );
  }
  return (
    <>
      <p>You are not logged in.</p>
      <button
        onClick={(ev) => {
          ev.preventDefault();
          signIn("google");
        }}
      >
        Sign In
      </button>
    </>
  );
};

export default Login;
