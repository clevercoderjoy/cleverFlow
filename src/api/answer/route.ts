/* eslint-disable @typescript-eslint/no-explicit-any */
import { answerCollection, db } from "@/models/name";
import { databases, users } from "@/models/server/config";
import { UserPrefs } from "@/store/auth";
import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";

export async function POST(request: NextRequest) {
  try {
    const { questionId, authorId, answer } = await request.json();

    const answerResponse = await databases.createDocument(
      db,
      answerCollection,
      ID.unique(),
      {
        content: answer,
        authorId: authorId,
        questionId: questionId,
      }
    );

    const prefsResponse = await users.getPrefs<UserPrefs>(authorId);
    await users.updatePrefs(authorId, {
      reputation: Number(prefsResponse.reputation) + 1,
    });

    return NextResponse.json(answerResponse, {
      status: 201,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "Error creating answer",
      },
      {
        status: error?.status || error?.code || 500,
      }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { answerId } = await request.json();
    const answer = await databases.getDocument(db, answerCollection, answerId);
    const answerResponse = await databases.deleteDocument(
      db,
      answerCollection,
      answerId
    );
    const prefsResponse = await users.getPrefs<UserPrefs>(answer.authorId);
    await users.updatePrefs(answer.authorId, {
      reputation:
        Number(prefsResponse.reputation) > 0
          ? Number(prefsResponse.reputation) - 1
          : null,
    });

    return NextResponse.json(
      {
        data: answerResponse,
      },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error?.message || "Error",
      },
      {
        status: error?.status || error?.code || 500,
      }
    );
  }
}
