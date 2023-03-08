import React from "react";
import { useSession, signOut, getSession } from "next-auth/react";

const Account = () => {
  const { data: session, status } = useSession();

  if (status === "authenticated") {
    return (
      <>
        <h1 id="title_accounts">Accounts</h1>
        <p>Welcome {session?.user?.name}</p>
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
  return <p>You are not signed In.</p>;
};

export const getServerSideProps = async (context) => {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        destination: "/login",
      },
    };
  }
  return {
    props: {
      session,
    },
  };
};

export default Account;
