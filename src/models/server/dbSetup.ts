import { db } from "../name";
import createAnswerCollection from "./answer.collection";
import createCommentCollection from "./comment.collection";
import createQuestionCollection from "./question.collection";
import createVoteCollection from "./vote.collection";
import { databases } from "./config";

export default async function getOrCreateDatabase() {
  try {
    await databases.get(db);
    console.log("Database connected");
  } catch {
    try {
      await databases.create(db, db);
      console.log("Database created");
      await Promise.all([
        createQuestionCollection(),
        createAnswerCollection(),
        createCommentCollection(),
        createVoteCollection(),
      ]);
      console.log("Database created and connected");
    } catch (error) {
      console.log("Error creating database", error);
    }
  }
  return databases;
}
