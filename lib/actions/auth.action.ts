"use server";

import { db } from "@/firebase/admin";
import { auth } from '@/firebase/admin'
import { cookies } from "next/headers";

// const SESSION_DURATION = 60 * 60 * 24 * 7;

// export async function setSessionCookie(idToken: string) {
//   const cookieStore = await cookies();

//   const sessionCookie = await auth.createSessionCookie(idToken, {
//     expiresIn: SESSION_DURATION * 1000,
//   });

//   cookieStore.set("session", sessionCookie, {
//     maxAge: SESSION_DURATION,
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     path: "/",
//     sameSite: "lax",
//   });
// }


const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days

export async function setSessionCookie(idToken: string) {
  try {
    const cookieStore = cookies();
    
    // First verify the ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // Then create session cookie
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION * 1000,
    });

    cookieStore.set("session", sessionCookie, {
      maxAge: SESSION_DURATION,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return true;
  } catch (error) {
    console.error("Error setting session cookie:", error);
    return false;
  }
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    // First verify the ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // Verify the email matches the token
    if (decodedToken.email !== email) {
      return {
        success: false,
        message: "Token email mismatch",
      };
    }

    // Check if user exists (optional - token verification is sufficient)
    try {
      await auth.getUser(decodedToken.uid);
    } catch (error) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Set session cookie
    const cookieSet = await setSessionCookie(idToken);
    if (!cookieSet) {
      return {
        success: false,
        message: "Failed to create session",
      };
    }

    return {
      success: true,
      message: "Signed in successfully",
    };
  } catch (error: any) {
    console.error("Sign in error:", error);
    
    let message = "Authentication failed";
    if (error.code === "auth/id-token-expired") {
      message = "Session expired. Please sign in again.";
    } else if (error.code === "auth/user-not-found") {
      message = "Account not found. Please sign up.";
    }

    return {
      success: false,
      message,
    };
  }
}

interface SignUpParams {
  uid: string;
  name: string;
  email: string;
  password: string;
}

interface SignInParams {
  email: string;
  idToken: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export async function signUp(params: SignUpParams) {
  const { uid, name, email } = params;

  try {
    const userRecord = await db.collection("users").doc(uid).get();
    if (userRecord.exists) {
      return {
        success: false,
        message: "User already exists. Please sign in.",
      };
    }

    await db.collection("users").doc(uid).set({
      name,
      email,
      // profileURL,
      // resumeURL,
    });

    return {
      success: true,
      message: "Account created successfully. Please sign in.",
    };
  } catch (error: any) {
    console.error("Error creating user:", error);

    if (error.code === "auth/email-already-exists") {
      return {
        success: false,
        message: "This email is already in use",
      };
    }

    return {
      success: false,
      message: "Failed to create account. Please try again.",
    };
  }
}

// export async function signIn(params: SignInParams) {
//   const { email, idToken } = params;

//   try {
//     const userRecord = await auth.getUserByEmail(email);
//     if (!userRecord) {
//       return {
//         success: false,
//         message: "User does not exist. Create an account.",
//       };
//     }

//     await setSessionCookie(idToken);

//     return {
//       success: true,
//       message: "Signed in successfully.",
//     };
//   } catch (error: any) {
//     console.error("Error signing in:", error);

//     return {
//       success: false,
//       message: "Failed to log into account. Please try again.",
//     };
//   }
// }

export async function signOut() {
  const cookieStore = await cookies();

  cookieStore.delete("session");
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();
    if (!userRecord.exists) return null;

    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch (error) {
    console.error("Error verifying session cookie:", error);

    return null;
  }
}

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}