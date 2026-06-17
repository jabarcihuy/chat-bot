import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";

const REGISTRATION_RATE_LIMIT = {
  limit: 5,
  windowMs: 60_000, // 5 requests per minute
};

function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

export async function POST(req: Request) {
  try {
    // 1. Request Throttling based on client IP
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`register:${ip}`, REGISTRATION_RATE_LIMIT);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak upaya pendaftaran dari alamat IP ini. Silakan coba lagi nanti." },
        { status: 429, headers: rateLimitHeaders(rateLimit) }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Format request body JSON tidak valid" }, { status: 400 });
    }
    const { name, email, password } = body;

    // 2. Input validation: check completeness
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // 3. Name validation
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      return NextResponse.json({ error: "Nama harus minimal 2 karakter" }, { status: 400 });
    }

    // 4. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Format email tidak valid" }, { status: 400 });
    }

    // 5. Password strength validation (Password Policy)
    if (password.length < 8) {
      return NextResponse.json({ error: "Password harus minimal 8 karakter" }, { status: 400 });
    }
    if (!/[a-z]/.test(password)) {
      return NextResponse.json({ error: "Password harus mengandung minimal 1 huruf kecil" }, { status: 400 });
    }
    if (!/[A-Z]/.test(password)) {
      return NextResponse.json({ error: "Password harus mengandung minimal 1 huruf besar" }, { status: 400 });
    }
    if (!/[0-9]/.test(password)) {
      return NextResponse.json({ error: "Password harus mengandung minimal 1 angka" }, { status: 400 });
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return NextResponse.json({ error: "Password harus mengandung minimal 1 karakter spesial" }, { status: 400 });
    }

    // 6. Check existing user
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
    }

    // 7. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 8. Create user in database
    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        email,
        password: hashedPassword,
      }
    });

    return NextResponse.json({ message: "Akun berhasil dibuat", userId: user.id });
  } catch (error: unknown) {
    // 9. Prevent internal error leakage
    console.error("Internal registration error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal pada server saat mendaftar" }, 
      { status: 500 }
    );
  }
}
