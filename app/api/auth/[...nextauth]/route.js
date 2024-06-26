import NextAuth from 'next-auth/next';
import GoogleProvider from 'next-auth/providers/google';

import User from '@models/user';
import { connectToDb } from '@utils/database';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session }) {
      const sessionUser = await User.findOne({
        email: session.user.email,
      });

      session.user.id = sessionUser._id.toString();

      return session;
    },

    async signIn({ profile }) {
      try {
        await connectToDb();

        //1 check if a user already exists
        const userExists = await User.findOne({
          email: profile.email,
        });

        //2 if not, create a new user and save it to db
        if (!userExists) {
          await User.create({
            email: profile.email,
            username: profile.name.replaceAll(' ', '').toLowerCase(),
            image: profile.picture,
          });
        }

        return true;
      } catch (error) {
        console.error('Error in Sing In:', error);
        return false;
      }
    },
  },
});

export { handler as GET, handler as POST };
