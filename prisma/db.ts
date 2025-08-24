import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  DeleteCommand,
  GetCommand,
  UpdateCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

export const REGION = process.env.AWS_REGION || "eu-south-1";
export const TABLE_NAME = process.env.DYNAMO_TABLE || "main";

// Reuse the same client instance across hot reloads/tests
let docClient: DynamoDBDocumentClient;
if (!(globalThis as any).__DYNAMO_DOC_CLIENT__) {
  const dynamo = new DynamoDBClient({
    region: REGION,
    credentials: {
      accessKeyId: process.env.ACCESS_KEY_ID || "",
      secretAccessKey: process.env.SECRET_ACCESS_KEY || "",
    },
  });
  docClient = DynamoDBDocumentClient.from(dynamo);
  if (process.env.NODE_ENV !== "production") {
    (globalThis as any).__DYNAMO_DOC_CLIENT__ = docClient;
  }
} else {
  docClient = (globalThis as any).__DYNAMO_DOC_CLIENT__;
}

const client = {
  question: {
    async findMany({ where }: any = {}) {
      // Fetch by primary key if id is provided
      if (where?.id !== undefined) {
        const res = await docClient.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: { pk: `QUESTION#${where.id}` },
          })
        );
        return res.Item ? [res.Item] : [];
      }

      // Query by subject/number range using SubjectNumberIndex
      if (where?.subject) {
        let KeyConditionExpression = "subject = :subject";
        const ExpressionAttributeValues: Record<string, any> = {
          ":subject": where.subject,
        };
        const ExpressionAttributeNames: Record<string, string> = {};
        if (where.number) {
          ExpressionAttributeNames["#n"] = "number";
          if (
            where.number.gte !== undefined &&
            where.number.lte !== undefined
          ) {
            KeyConditionExpression += " and #n BETWEEN :from AND :to";
            ExpressionAttributeValues[":from"] = String(where.number.gte);
            ExpressionAttributeValues[":to"] = String(where.number.lte);
          } else if (where.number.gte !== undefined) {
            KeyConditionExpression += " and #n >= :from";
            ExpressionAttributeValues[":from"] = String(where.number.gte);
          } else if (where.number.lte !== undefined) {
            KeyConditionExpression += " and #n <= :to";
            ExpressionAttributeValues[":to"] = String(where.number.lte);
          }
        }
        const params: any = {
          TableName: TABLE_NAME,
          IndexName: "SubjectNumberIndex",
          KeyConditionExpression,
          ExpressionAttributeValues,
        };
        if (Object.keys(ExpressionAttributeNames).length) {
          params.ExpressionAttributeNames = ExpressionAttributeNames;
        }
        const res = await docClient.send(new QueryCommand(params));
        return res.Items || [];
      }

      // Fallback: query all questions via TypeIndex
      const params: any = {
        TableName: TABLE_NAME,
        IndexName: "TypeIndex",
        KeyConditionExpression: "#t = :t",
        ExpressionAttributeNames: { "#t": "type" },
        ExpressionAttributeValues: { ":t": "Question" },
      };
      if (where?.number) {
        const filters: string[] = [];
        params.ExpressionAttributeNames["#n"] = "number";
        if (where.number.gte !== undefined) {
          filters.push("#n >= :from");
          params.ExpressionAttributeValues[":from"] = String(where.number.gte);
        }
        if (where.number.lte !== undefined) {
          filters.push("#n <= :to");
          params.ExpressionAttributeValues[":to"] = String(where.number.lte);
        }
        if (filters.length) {
          params.FilterExpression = filters.join(" AND ");
        }
      }
      const res = await docClient.send(new QueryCommand(params));
      return res.Items || [];
    },
    async findUnique({ where }: any) {
      const res = await docClient.send(
        new GetCommand({ TableName: TABLE_NAME, Key: { pk: `QUESTION#${where.id}` } })
      );
      return res.Item;
    },
    async update({ where, data }: any) {
      const UpdateExpression: string[] = [];
      const ExpressionAttributeValues: Record<string, any> = {};
      if (data.question) {
        UpdateExpression.push("question = :q");
        ExpressionAttributeValues[":q"] = data.question;
      }
      if (data.answers) {
        UpdateExpression.push("answers = :a");
        ExpressionAttributeValues[":a"] = data.answers;
      }
      await docClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { pk: `QUESTION#${where.id}` },
          UpdateExpression: "SET " + UpdateExpression.join(", "),
          ExpressionAttributeValues,
        })
      );
    },
  },
  user: {
    async create({ data }: any) {
      const item = { pk: `USER#${data.id}`, type: "User", ...data };
      await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
      return item;
    },
    async delete({ where }: any) {
      await docClient.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: { pk: `USER#${where.id}` },
        })
      );
    },
    async findUnique({ where }: any) {
      const res = await docClient.send(
        new GetCommand({ TableName: TABLE_NAME, Key: { pk: `USER#${where.id}` } })
      );
      return res.Item;
    },
    async update({ where, data }: any) {
      const UpdateExpression: string[] = [];
      const ExpressionAttributeValues: Record<string, any> = {};
      for (const key of Object.keys(data)) {
        UpdateExpression.push(`${key} = :${key}`);
        ExpressionAttributeValues[`:${key}`] = data[key];
      }
      await docClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { pk: `USER#${where.id}` },
          UpdateExpression: "SET " + UpdateExpression.join(", "),
          ExpressionAttributeValues,
        })
      );
    },
  },
  test: {
    async create({ data }: any) {
      const id = data.id ?? randomUUID();
      const { type: testType, ...rest } = data;
      const now = new Date().toISOString();
      const item = {
        pk: `TEST#${id}`,
        type: "Test",
        testType,
        id,
        createdAt: data.createdAt ?? now,
        updatedAt: data.updatedAt ?? now,
        ...rest,
      };
      await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
      return item;
    },
    async findMany({ where }: any = {}) {
      // Query tests for a specific user using UserIndex
      if (where?.userId) {
        let KeyConditionExpression = "userId = :u";
        const ExpressionAttributeValues: Record<string, any> = {
          ":u": where.userId,
        };
        if (where?.type) {
          KeyConditionExpression += " and testType = :type";
          ExpressionAttributeValues[":type"] = where.type;
        }
        const res = await docClient.send(
          new QueryCommand({
            TableName: TABLE_NAME,
            IndexName: "UserIndex",
            KeyConditionExpression,
            ExpressionAttributeValues,
          })
        );
        return res.Items || [];
      }

      // Otherwise query by type via TypeIndex
      const params: any = {
        TableName: TABLE_NAME,
        IndexName: "TypeIndex",
        KeyConditionExpression: "#t = :t",
        ExpressionAttributeNames: { "#t": "type" },
        ExpressionAttributeValues: { ":t": "Test" },
      };
      if (where?.type) {
        params.FilterExpression = "testType = :type";
        params.ExpressionAttributeValues[":type"] = where.type;
      }
      const res = await docClient.send(new QueryCommand(params));
      return res.Items || [];
    },
    async deleteMany({ where }: any) {
      const res = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: "UserIndex",
          KeyConditionExpression: "userId = :u",
          ExpressionAttributeValues: { ":u": where.userId },
        })
      );
      if (res.Items) {
        for (const item of res.Items) {
          await docClient.send(
            new DeleteCommand({ TableName: TABLE_NAME, Key: { pk: item.pk } })
          );
        }
      }
    },
  },
  report: {
    async create({ data }: any) {
      const item = {
        pk: `REPORT#${randomUUID()}`,
        type: "Report",
        ...data,
      };
      await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
      return item;
    },
  },
  explanation: {
    async update({ where, data }: any) {
      await docClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { pk: `QUESTION#${where.questionId}` },
          UpdateExpression: "SET explanation = :e",
          ExpressionAttributeValues: { ":e": data },
        })
      );
    },
  },
};
export { docClient };
export function destroyDocClient() {
  // Close open handles (useful in tests)
  (docClient as any).destroy?.();
}
export default client;
