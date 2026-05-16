import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';
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

// GET single post by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  const post = await BlogPost.findById(id).lean();
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

  // Increment views
  await BlogPost.findByIdAndUpdate(id, { $inc: { views: 1 } });
  return NextResponse.json(post);
}

// PUT update post (admin only)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await connectDB();
  const { id } = await params;
  const body = await request.json();
  const post = await BlogPost.findByIdAndUpdate(id, body, { new: true });
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  return NextResponse.json(post);
}

// DELETE post (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await connectDB();
  const { id } = await params;
  await BlogPost.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
