import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Validate inputs
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // TODO: Connect to Resend / SendGrid / Firebase here.
    // Example:
    // await resend.emails.send({
    //   from: 'Contact Form <onboarding@resend.dev>',
    //   to: 'atilla@example.com',
    //   subject: `New Project Inquiry from ${name}`,
    //   html: `<p><strong>Email:</strong> ${email}</p><p>${message}</p>`,
    // });

    // Mock delay to simulate network request
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Return success
    return NextResponse.json(
      { message: "Message securely delivered." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
