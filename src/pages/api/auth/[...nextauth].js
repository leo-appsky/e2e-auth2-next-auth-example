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
