import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Contact from '@/models/Contact';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return false;
  try {
    jwt.verify(token, process.env.JWT_SECRET as string);
    return true;
  } catch {
    return false;
  }
}

// POST - Submit contact (public)
export async function POST(request: Request) {
  await connectDB();
  const body = await request.json();

  const { name, email, subject, message } = body;
  if (!name || !email || !subject || !message) {
    return NextResponse.json(
      { error: 'Name, email, subject, and message are required.' },
      { status: 400 }
    );
  }

  const contact = new Contact(body);
  await contact.save();
  return NextResponse.json({ success: true, message: 'Message sent successfully!' }, { status: 201 });
}

// GET - Admin: fetch all contacts
export async function GET() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await connectDB();
  const contacts = await Contact.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(contacts);
}
