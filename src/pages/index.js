import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>Google Authentication Session with Cypress and Next-Auth</title>
        <meta
          name="description"
          content="Google Authentication Session with Cypress and Next-Auth"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <p>
          The purpose of this repository is show you how you can test a page
          protected with Next-Auth and keep that session for each web page
          protected by <Link href={"https://next-auth.js.org/"}>Next-Auth</Link>
          {` `} using Cypress to Test the UI and the API
        </p>
        <Link href={"/login"}>
          <button>Login</button>
        </Link>
      </main>
    </>
  );
}
