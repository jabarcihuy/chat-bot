import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Format request body JSON tidak valid" }, { status: 400 });
  }

  try {
    const { title, messages, prdDocument } = body;

    // Check if chat exists and belongs to user
    const chat = await prisma.chat.findUnique({
      where: { id }
    });

    if (!chat || chat.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found or Unauthorized" }, { status: 404 });
    }

    const updateData: { title?: string; prdDocument?: string; updatedAt?: Date } = {};
    if (title !== undefined) {
      updateData.title = title;
    }
    if (prdDocument !== undefined) {
      updateData.prdDocument = prdDocument;
    }

    if (messages !== undefined) {
      const messageIds = messages.map((m: { id: string }) => m.id);
      const upsertOperations = messages.map((m: { id: string; role: string; content: string; createdAt?: string | Date }) => {
        return prisma.message.upsert({
          where: { id: m.id },
          create: {
            id: m.id,
            chatId: id,
            role: m.role,
            content: m.content,
            createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
          },
          update: {
            content: m.content,
          }
        });
      });

      await prisma.$transaction([
        prisma.message.deleteMany({
          where: {
            chatId: id,
            id: { notIn: messageIds }
          }
        }),
        ...upsertOperations,
        prisma.chat.update({
          where: { id },
          data: { ...updateData, updatedAt: new Date() }
        })
      ]);
    } else {
      await prisma.chat.update({
        where: { id },
        data: { ...updateData, updatedAt: new Date() }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error updating chat:", error);
    return NextResponse.json({ error: "Failed to update chat" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if chat exists and belongs to user
    const chat = await prisma.chat.findUnique({
      where: { id }
    });

    if (!chat || chat.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found or Unauthorized" }, { status: 404 });
    }

    await prisma.chat.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error deleting chat:", error);
    return NextResponse.json({ error: "Failed to delete chat" }, { status: 500 });
  }
}
