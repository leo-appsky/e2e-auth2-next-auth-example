import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import * as dotenv from "dotenv";

dotenv.config();
export default NextAuth({
  session:{
    jwt:true
  },
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
      session.user.id = user?.id;
      session.user.name = session.user?.name || session.user?.email || "";
      session.user.image = session.user?.image || "";
      session.id_token = token?.id_token;
      return session;
    },
  },
  debug: true,
});
