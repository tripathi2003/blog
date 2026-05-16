import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    await connectDB();

    // Check Database for user
    const dbUser = await User.findOne({ 
      $or: [{ username: username }, { email: username.toLowerCase() }] 
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, dbUser.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const userRole = dbUser.role;
    const finalUsername = dbUser.username;

    // Create Token
    const token = jwt.sign(
      { username: finalUsername, role: userRole },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({ 
      success: true, 
      token, 
      user: { username: finalUsername, role: userRole } 
    });

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
