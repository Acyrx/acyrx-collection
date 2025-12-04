"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = (formData.get("email") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();
  const username = (formData.get("username") as string)?.trim();

  if (!email && !password && !username) {
    return { success: false, error: { message: "All fields are required." } };
  }

  // Check if username already exists
  const { data: existingUser, error: usernameError } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (usernameError && usernameError.code !== "PGRST116") {
    return {
      success: false,
      error: { message: "Database error checking username." },
    };
  }

  if (existingUser) {
    return {
      success: false,
      error: { message: "Username already taken. Please choose another." },
    };
  }

  // Check if email already exists
  const { data: existingEmail } = await supabase
    .from("profiles")
    .select("email")
    .eq("email", email)
    .maybeSingle();

  if (existingEmail) {
    return {
      success: false,
      error: { message: "Email already registered. Try signing in." },
    };
  }

  // Proceed with signup
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
        `${
          process.env.SITE_URL ||
          process.env.NEXT_PUBLIC_SITE_URL ||
          "http://localhost:3000"
        }/auth/confirm`,
    },
  });

  if (signUpError) {
    if (signUpError.message.includes("User already registered")) {
      return {
        success: false,
        error: { message: "Email already registered. Please sign in." },
      };
    }
    return { success: false, error: signUpError };
  }

  return {
    success: true,
    data: signUpData,
    message: "Sign up successful! Please check your email to confirm.",
  };
}

export async function signin(formData: FormData) {
  const supabase = await createClient();

  const email = (formData.get("email") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();

  // Format phone number with country code if provided
  const formattedPhone = phone
    ? phone.startsWith("+")
      ? phone
      : `+${phone.replace(/^\+/, "")}`
    : null;

  const identifier = email || formattedPhone;

  if (!identifier || !password) {
    return {
      success: false,
      error: { message: "Email/Phone and password are required." },
    };
  }

  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email: identifier,
      password,
    });

  if (signInError) {
    return {
      success: false,
      error: { message: signInError.message || "Invalid credentials." },
    };
  }

  return {
    success: true,
    data: signInData,
    message: "Signed in successfully!",
  };
}

export async function signout() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error };
  }

  return { success: true };
}

export async function sendResetPasswordEmail(formData: FormData) {
  const supabase = await createClient();

  const email = (formData.get("email") as string)?.trim();

  if (!email) {
    return { success: false, error: { message: "Email is required." } };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo:
      process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
      `${process.env.SITE_URL || "http://localhost:3000"}/auth/reset-password`,
  });

  if (error) {
    return { success: false, error: { message: error.message } };
  }

  return {
    success: true,
    message: "Please check your email to reset your password.",
  };
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();

  const password = (formData.get("password") as string)?.trim();

  if (!password || password.length < 8 || password.length > 60) {
    return {
      success: false,
      error: { message: "Password must be 8-60 characters." },
    };
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { success: false, error: { message: error.message } };
  }

  return { success: true, message: "Password updated successfully!" };
}

export async function signinWithGithub() {
  const supabase = await createClient();

  const redirectUrl = `${
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000"
  }/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: redirectUrl,
    },
  });

  if (error) {
    return { success: false, error };
  }

  if (data.url) {
    redirect(data.url);
  } else {
    return { success: false, error: { message: "Failed to get OAuth URL" } };
  }
}

export async function sendPhoneOTP(formData: FormData) {
  const supabase = await createClient();

  const phone = (formData.get("phone") as string)?.trim();

  if (!phone) {
    return { success: false, error: { message: "Phone number is required." } };
  }

  // Ensure phone number starts with + for international format
  const formattedPhone = phone.startsWith("+")
    ? phone
    : `+${phone.replace(/^\+/, "")}`;

  const { data, error } = await supabase.auth.signInWithOtp({
    phone: formattedPhone,
    options: {
      channel: "sms",
    },
  });

  if (error) {
    return {
      success: false,
      error: { message: error.message || "Failed to send OTP." },
    };
  }

  return {
    success: true,
    data,
    message: "OTP sent successfully! Please check your phone.",
  };
}

export async function verifyPhoneOTP(formData: FormData) {
  const supabase = await createClient();

  const phone = (formData.get("phone") as string)?.trim();
  const token = (formData.get("token") as string)?.trim();

  if (!phone || !token) {
    return {
      success: false,
      error: { message: "Phone number and OTP are required." },
    };
  }

  // Ensure phone number starts with + for international format
  const formattedPhone = phone.startsWith("+")
    ? phone
    : `+${phone.replace(/^\+/, "")}`;

  const { data, error } = await supabase.auth.verifyOtp({
    phone: formattedPhone,
    token,
    type: "sms",
  });

  if (error) {
    return {
      success: false,
      error: { message: error.message || "Invalid OTP. Please try again." },
    };
  }

  return {
    success: true,
    data,
    message: "Phone verified successfully!",
  };
}
