'use server'
import { createClient } from '@/lib/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = (formData.get("email") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();
  const username = (formData.get("username") as string)?.trim();

  if (!email || !password || !username) {
    return { success: false, error: { message: "All fields are required." } };
  }

  // 1️⃣ Check if username already exists
  const { data: existingUser, error: usernameError } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (usernameError) {
    return { success: false, error: { message: "Database error checking username." } };
  }

  if (existingUser) {
    return { success: false, error: { message: "Username already taken. Please choose another." } };
  }

  // 2️⃣ Check if email already exists (optional, if you store in profiles)
  const { data: existingEmail } = await supabase
    .from("profiles")
    .select("email")
    .eq("email", email)
    .maybeSingle();

  if (existingEmail) {
    return { success: false, error: { message: "Email already registered. Try signing in." } };
  }

  // 3️⃣ If both unique, proceed with signup
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });

  if (signUpError) {
    if (signUpError.message.includes("User already registered")) {
      return { success: false, error: { message: "Email already registered. Please sign in." } };
    }
    return { success: false, error: signUpError };
  }

  return { success: true, data: signUpData };
}


export async function signout() {
    const supabase = await createClient();
  
    const { error } = await supabase.auth.signOut();
  
    if (error) {
      // Return the error so caller can handle it
      return { success: false, error };
    }
  
    // Return success instead of redirecting
    return { success: true };
  }
