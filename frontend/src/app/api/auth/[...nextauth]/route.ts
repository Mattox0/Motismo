/* eslint-disable @typescript-eslint/naming-convention */
/* because next-auth convention */
// import NextAuth, { Session, NextAuthOptions } from 'next-auth';
// import CredentialsProvider from 'next-auth/providers/credentials';

// export const authOptions: NextAuthOptions = {
//   providers: [
//     CredentialsProvider({
//       name: 'Credentials',
//       credentials: {
//         email: { label: 'Email', type: 'email' },
//         password: { label: 'Password', type: 'password' },
//       },
//       async authorize(credentials) {
//         try {
//           if (!credentials?.email || !credentials?.password) {
//             throw new Error('Email and password are required');
//           }

//           const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//               email: credentials.email,
//               password: credentials.password,
//             }),
//           });

//           const data = await res.json();

//           if (!res.ok) {
//             throw new Error(data.message || 'Authentication failed');
//           }

//           if (data.accessToken) {
//             return {
//               id: data.id || 'unknown',
//               email: credentials.email,
//               accessToken: data.accessToken,
//               name: data.username || credentials.email,
//             };
//           }

//           return null;
//         } catch (error) {
//           console.error('Auth error:', error);
//           throw new Error('Authentication failed');
//         }
//       },
//     }),
//   ],
//   session: {
//     strategy: 'jwt',
//     maxAge: 7 * 24 * 60 * 60,
//   },
//   callbacks: {
//     async jwt({ token, user }: { token: any; user?: any }) {
//       if (user) {
//         token.accessToken = user.accessToken;
//         token.email = user.email;
//       }
//       return token;
//     },
//     async session({ session, token }: { session: Session; token: any }) {
//       if (token) {
//         session.accessToken = token.accessToken;
//         if (session.user) {
//           session.user.email = token.email;
//         }
//       }
//       return session;
//     },
//   },
//   pages: {
//     signIn: '/auth',
//   },
//   debug: process.env.NODE_ENV === 'development',
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      role?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string;
    accessToken?: string;
    role?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    accessToken?: string;
    role?: string;
  }
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email and password are required');
          }

          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.message || 'Authentication failed');
          }

          if (data.accessToken) {
            const tokenPayload = JSON.parse(
              Buffer.from(data.accessToken.split('.')[1], 'base64').toString()
            );

            return {
              id: data.id,
              email: credentials.email,
              name: data.username || credentials.email,
              accessToken: data.accessToken,
              role: tokenPayload.role,
            };
          }

          return null;
        } catch (error) {
          console.error('Auth error:', error);
          throw new Error('Authentication failed');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.accessToken = user.accessToken;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken;
        if (session.user) {
          session.user.id = token.id;
          session.user.role = token.role;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST };
