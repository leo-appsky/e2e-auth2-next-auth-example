# What is the goal of this repository?

The goal of this repository is demonstrate you how we can persist a user session using [Google Provider](https://next-auth.js.org/providers/google)
before to test the content of some React Pages protected by [Next-Auth](https://next-auth.js.org/) in [Cypress](https://docs.cypress.io/guides/overview/why-cypress)

## Getting Started

Before to run this project you will need to create a `.env` file with your secrets and Google API Credentials in order to use `Google OAuth 2.0 Client IDs`.Basically you can set these credentials in [Google Cloud Console - Credentials](https://console.developers.google.com/apis/credentials).

<img src="https://github.com/leo-appsky/e2e-auth2-next-auth-example/blob/main/screenshots/01.png?raw=true  " alt="Google OAuth 2.0 Client IDs Option"/>

Make sure that you have already inserted the URL `http://localhost:3000` in the section of Authorized JavaScript origins.

<img src="https://github.com/leo-appsky/e2e-auth2-next-auth-example/blob/main/screenshots/02.png" alt="Authorized JavaScript origins"/>

Then in the Section of Authorized redirect URIs ,make sure that have already inserted this URL `http://localhost:3000/api/auth/callback/google`

<img src="https://github.com/leo-appsky/e2e-auth2-next-auth-example/blob/main/screenshots/03.png" alt=" Authorized redirect URIs"/>

Your `.env` file should look something like this:

```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
NEXTAUTH_URL=http://localhost:3000 
JWT_SECRET=your_JSON_web_token_secret
```

Finally run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
## How to Test it?

You will need a valid [Gmail Account](https://gmail.com/),that account shouldn't have Two Factor Autentication.In the root of the project create a file named `cypress.env.json`. 
It should have this structure,you just need to replace the values with your Gmail credentials:
```json
{
  "GOOGLE_USER": "your_email@gmail.com",
  "GOOGLE_PSWD": "your_secret_password",
}
```

Finally in the root of the project open a new terminal and run this command:
`npm run cypress`.
In case that you want to see what's going on in the Web Browser you can run the command `npm run cypress:open`.Note that you also need to run the command `npm run dev` at the same time for both cypress commands.

# What is the problem?

In order to deal with Authentication stuff Next-Auth has a lot features to secure our web application,that configuration should be on this path `/pages/api/auth/[...nextauth].js`, basically it has this code:

```js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import * as dotenv from "dotenv";

dotenv.config();
export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      idToken:true
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      if (email && email.verificationRequest) return true;
      return true;
    },
    async jwt({ token, user, account }) {
      if (account) {
        token.id_token = account.id_token;
      }
      return token;
    },
    async session({ session, token, user }) {
      session.user.name = session.user.name || session.user.email || "";
      session.user.image = session.user.image || "";
      session.id_token = token.id_token;
      return session;
    },
  },
  debug: true,
  secret: process.env.JWT_SECRET,
});

```

So based in this [youtube video](https://www.youtube.com/watch?v=Fohrq5GZSD8) of the official documentation of Cypress in order to save and persists a
sessions we should use [cy.session()](https://docs.cypress.io/api/commands/session) in conjunction with [cy.origin()](https://docs.cypress.io/api/commands/origin) so I created a custom Cypess command to Authenticate the Users using Google OAuth 2.0 API but if I implement `cy.session()` Next-Auth will throw an error that says: `https://next-auth.js.org/errors#oauth_callback_error id_token not present in TokenSet` as part of the Google Provider.

This is my custom Cypress command:

```js
Cypress.Commands.add("loginWithGmail", () => {
  Cypress.log({
    name: "loginViaGmail",
  });
  cy.visit('/login')
  cy.contains("Sign In").click();
     //cy.session('login',()=>{
       cy.request("/api/auth/csrf").then((resp) => {
         const csrfToken = resp.body.csrfToken;
         cy.request({
           method: "POST",
           url: "/api/auth/callback/google",
           form: true,
           body: {
             csrfToken: csrfToken,
             json: true,
             callbackUrl: "/",
           },
         }).then(() => {
           cy.origin("accounts.google.com", () => {
             cy.get('input[type="email"]', { timeout: 26000 }).type(
               Cypress.env("GOOGLE_USER")
             );
             cy.get("button", { timeout: 26000 }).eq(3).click();
             cy.wait(2000);
             Cypress.on("uncaught:exception", (error, runnable) => {
               Cypress.log({
                 error,
               });
               return !error.message.includes(
                 "ResizeObserver loop limit exceeded"
               );
             });
             cy.get('input[name="password"]', { timeout: 26000 }).type(
               Cypress.env("GOOGLE_PSWD")
             );
             cy.wait(2000);
             cy.get('input[type="checkbox"]', { timeout: 26000 }).check();
             Cypress.on("uncaught:exception", (error, runnable) => {
               Cypress.log({
                 error,
               });
               return !error.message.includes(
                 "ResizeObserver loop limit exceeded"
               );
             });
             cy.wait(600);
             cy.get("button", { timeout: 26000 }).eq(2).click();
           });
         });
         cy.visit("/account");
       });
     //})
});

```
Note that I have commented the `cy.session()` so if you remove that comment the cypress stuff will crash on the cypress browser.This is the error:

<img src="https://github.com/leo-appsky/e2e-auth2-next-auth-example/blob/main/screenshots/error.png" alt="Next-Auth Error"/>

So the big question here is how to fix oauth_callback_error when it says `id_token not present in TokenSet` on Google Provider?
