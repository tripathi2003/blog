import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    return decoded;
  } catch {
    return null;
  }
}

// GET all posts (admin sees all, public sees published)
export async function GET(request: Request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const user = await getAuthUser();
  const all = searchParams.get('all');

  const isAdmin = user?.role === 'admin';
  const query = isAdmin && all === 'true' ? {} : { published: true };
  
  const posts = await BlogPost.find(query).sort({ createdAt: -1 }).lean();
  return NextResponse.json(posts);
}

// POST create new post (authenticated users only)
export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const body = await request.json();

  // Auto-generate slug from title
  if (!body.slug && body.title) {
    body.slug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  // Assign author from token if not provided
  if (!body.author) {
    body.author = user.username;
  }

  const post = new BlogPost(body);
  await post.save();
  return NextResponse.json(post, { status: 201 });
}
