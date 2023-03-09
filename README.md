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
NEXT_AUTH_URL=http://localhost:3000 
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
  "COOKIE_NAME": "next-auth.session-token",
  "SITE_NAME": "http://localhost:3000"
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
    async session({ session, token, user }) {
      session.user.id = user.id;
      session.user.name = session.user.name || session.user.email || "";
      session.user.image = session.user.image || defaultAvatar;
      session.id_token = token.id_token;
      return session;
    },
  },
  debug: true,
});
```

So based in this [npm Cypress Plugin](https://www.npmjs.com/package/cypress-social-logins) of the official [documentation of Cypress](https://next-auth.js.org/tutorials/testing-with-cypress) in order to save and persists a
sessions so I created a custom Cypess command to Authenticate the Users using Google OAuth 2.0 API but its throwing an error about time out exceed.The error says: `cy.task('GoogleSocialLogin') timed out after waiting 60000ms.`.
If you comment the `cy.session()` the error says: ` waiting for selector "input#identifierId[type="email"]" failed: timeout 30000ms exceeded`

This is my custom Cypress command:

```js
Cypress.Commands.add("loginWithGmail", () => {
  const username = Cypress.env("GOOGLE_USER");
  const password = Cypress.env("GOOGLE_PSWD");
  const loginUrl = Cypress.env("SITE_NAME") + "/login";
  const cookieName = Cypress.env("COOKIE_NAME");
  const socialLoginOptions = {
    username,
    password,
    loginUrl,
    headless: true,
    logs: true,
    isPopup: false,
    getAllBrowserCookies: true,
    loginSelector: 'button',
    cookieDelay: 200000,
    postLoginSelector: "h1",
  };
  return cy
    .task("GoogleSocialLogin", socialLoginOptions)
    .then(({ cookies }) => {
      cy.clearCookies();

      const cookie = cookies
        .filter((cookie) => cookie.name === cookieName)
        .pop();
     
        if (cookie) {
          cy.session('login',()=>{
            cy.setCookie(cookie.name, cookie.value, {
              domain: cookie.domain,
              expiry: cookie.expires,
              httpOnly: cookie.httpOnly,
              path: cookie.path,
              secure: cookie.secure,
            });
          })
        }
      
    })
    .then(() => {
      cy.visit("/account");
    }); 
});

```
Note if you remove the `cy.session()` line you can pass the Gmail Authentications form but the session dont persist.
So the big question here is how to save and persist an user session using Google Provider?
