#!/usr/bin/env python3
"""
Migrate data from the PostgreSQL schema
(Answer, Explanation, Question, Report, Test, User)
into the single-table DynamoDB design.

Required environment variables:
  DATABASE_URL
  AWS_ACCESS_KEY_ID
  AWS_SECRET_ACCESS_KEY
  AWS_REGION          (defaults to eu-south-1)
  DYNAMO_TABLE        (defaults to 'main')

Dependencies:
  pip install psycopg2-binary boto3
"""

from decimal import Decimal
import os
from dotenv import load_dotenv
import boto3
import psycopg2
from psycopg2.extras import RealDictCursor

load_dotenv()

REGION = "eu-south-1"
TABLE_NAME = "main"
DATABASE_URL = "mybeautifuldatabaseurl"

dynamo = boto3.resource(
    "dynamodb",
    region_name=REGION,
    aws_access_key_id=os.environ["ACCESS_KEY_ID"],
    aws_secret_access_key=os.environ["SECRET_ACCESS_KEY"],
)
table = dynamo.Table(TABLE_NAME)


# --------- Helpers --------------------------------------------------
def iso(dt):
    return dt.isoformat() if dt else None


# --------- Migration ------------------------------------------------
with psycopg2.connect(DATABASE_URL) as conn:
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # --- Questions (with answers + explanation) ---------------------
    # cur.execute(
    #     """
    #     SELECT q.id, q.question, q.subject, q.number,
    #            COALESCE(json_agg(
    #                json_build_object(
    #                    'id', a.id,
    #                    'text', a.text,
    #                    'isCorrect', a."isCorrect",
    #                    'domandaId', a."domandaId"
    #                )
    #            ) FILTER (WHERE a.id IS NOT NULL), '[]') AS answers,
    #            e.id   AS explanation_id,
    #            e.text AS explanation_text,
    #            e."createdAt" AS explanation_created,
    #            e."updatedAt" AS explanation_updated
    #     FROM "Question" q
    #     LEFT JOIN "Answer" a       ON a."domandaId" = q.id
    #     LEFT JOIN "Explanation" e  ON e."questionId" = q.id
    #     GROUP BY q.id, e.id, e.text, e."createdAt", e."updatedAt"
    # """
    # )
    # with table.batch_writer() as batch:
    #     for row in cur.fetchall():
    #         item = {
    #             "pk": f"QUESTION#{row['id']}",
    #             "type": "Question",
    #             "id": row["id"],
    #             "question": row["question"],
    #             "subject": row["subject"],
    #             "number": row["number"],
    #             "answers": row["answers"],
    #         }
    #         if row["explanation_id"]:
    #             item["explanation"] = {
    #                 "id": row["explanation_id"],
    #                 "text": row["explanation_text"],
    #                 "createdAt": iso(row["explanation_created"]),
    #                 "updatedAt": iso(row["explanation_updated"]),
    #                 "questionId": row["id"],
    #             }
    #         batch.put_item(Item=item)

    # --- Users (with wrong-question IDs) ----------------------------
    # cur.execute(
    #     """
    #     SELECT u.id, u.plan, u."createdAt", u."updatedAt",
    #            COALESCE(array_agg(rel."B"::int)
    #                     FILTER (WHERE rel."B" IS NOT NULL), '{}') AS wrong_ids
    #     FROM "User" u
    #     LEFT JOIN "_wrongUserQuestionsRelation" rel
    #            ON u.id = rel."A"::text
    #     GROUP BY u.id, u.plan, u."createdAt", u."updatedAt"
    #     """
    # )
    # with table.batch_writer() as batch:
    #     for row in cur.fetchall():
    #         batch.put_item(
    #             Item={
    #                 "pk": f"USER#{row['id']}",
    #                 "type": "User",
    #                 "id": row["id"],
    #                 "plan": row["plan"],
    #                 "wrongQuestionIds": row["wrong_ids"],
    #                 "createdAt": iso(row["createdAt"]),
    #                 "updatedAt": iso(row["updatedAt"]),
    #             }
    #         )

    # --- Prepare test relation maps --------------------------------
    def load_pairs(sql):
        cur.execute(sql)
        m = {}
        for a, b in cur.fetchall():
            m.setdefault(b, []).append(a)
        return m

    correct = load_pairs('SELECT "A","B" FROM "_correctQuestionsRelation"')
    wrong = load_pairs('SELECT "A","B" FROM "_wrongQuestionsRelation"')
    not_ans = load_pairs('SELECT "A","B" FROM "_notAnsweredQuestionsRelation"')

    cur.execute(
        """
        SELECT rel."B" AS test_id,
               json_agg(json_build_object(
                   'id', a.id,
                   'text', a.text,
                   'isCorrect', a."isCorrect",
                   'domandaId', a."domandaId"
               )) AS answers
        FROM "_testAnswersRelation" rel
        JOIN "Answer" a ON a.id = rel."A"
        GROUP BY rel."B"
    """
    )
    answers_map = {row["test_id"]: row["answers"] for row in cur.fetchall()}

    # --- Tests ------------------------------------------------------
    cur.execute(
        'SELECT id, score, "maxScore", type, "createdAt", "updatedAt", "userId" FROM "Test"'
    )
    with table.batch_writer() as batch:
        for row in cur.fetchall():
            batch.put_item(
                Item={
                    "pk": f"TEST#{row['id']}",
                    "type": "Test",
                    "testType": row["type"],
                    "id": row["id"],
                    "score": Decimal(str(row["score"])),
                    "maxScore": Decimal(str(row["maxScore"])),
                    "createdAt": iso(row["createdAt"]),
                    "updatedAt": iso(row["updatedAt"]),
                    "userId": row["userId"],
                    "correctQuestions": correct.get(row["id"], []),
                    "wrongQuestions": wrong.get(row["id"], []),
                    "notAnsweredQuestions": not_ans.get(row["id"], []),
                    "answers": answers_map.get(row["id"], []),
                }
            )

    # --- Reports ----------------------------------------------------
    cur.execute('SELECT id, "questionId" FROM "Report"')
    with table.batch_writer() as batch:
        for row in cur.fetchall():
            batch.put_item(
                Item={
                    "pk": f"REPORT#{row['id']}",
                    "type": "Report",
                    "id": row["id"],
                    "questionId": row["questionId"],
                }
            )

print("Migration complete.")
