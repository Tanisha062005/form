"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { revalidatePath } from "next/cache";

export async function loginAdmin(formData: FormData) {
    const passkey = formData.get("passkey");
    const envPass = process.env.ADMPASS;

    if (passkey === envPass) {
        cookies().set("admin69_session", "authenticated", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24, // 1 day
            path: "/",
        });
        revalidatePath("/admin69");
    } else {
        redirect("/admin69?error=invalid");
    }
}

export async function logoutAdmin() {
    cookies().delete("admin69_session");
    redirect("/admin69");
}
