import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  DeleteCommand,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

export const REGION = process.env.AWS_REGION || "eu-south-1";
export const TABLE_NAME = process.env.DYNAMO_TABLE || "main";

const docClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: REGION,
    credentials: {
      accessKeyId: process.env.ACCESS_KEY_ID || "",
      secretAccessKey: process.env.SECRET_ACCESS_KEY || "",
    },
  })
);

function questionFilterParams(where: any) {
  let FilterExpression = "#t = :t";
  const ExpressionAttributeNames: Record<string, string> = { "#t": "type" };
  const ExpressionAttributeValues: Record<string, any> = { ":t": "Question" };
  if (where?.subject) {
    FilterExpression += " and subject = :subject";
    ExpressionAttributeValues[":subject"] = where.subject;
  }
  if (where?.id !== undefined) {
    FilterExpression += " and id = :id";
    ExpressionAttributeValues[":id"] = where.id;
  }
  if (where?.number) {
    if (where.number.gte !== undefined) {
      FilterExpression += " and #n >= :from";
      ExpressionAttributeNames["#n"] = "number";
      ExpressionAttributeValues[":from"] = where.number.gte;
    }
    if (where.number.lte !== undefined) {
      FilterExpression += " and #n <= :to";
      ExpressionAttributeNames["#n"] = "number";
      ExpressionAttributeValues[":to"] = where.number.lte;
    }
  }
  return { FilterExpression, ExpressionAttributeNames, ExpressionAttributeValues };
}

const client = {
  question: {
    async findMany({ where }: any = {}) {
      const params: any = { TableName: TABLE_NAME };
      const filter = questionFilterParams(where);
      Object.assign(params, filter);
      const res = await docClient.send(new ScanCommand(params));
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
      const item = {
        pk: `TEST#${id}`,
        type: "Test",
        testType,
        id,
        ...rest,
      };
      await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
      return item;
    },
    async findMany({ where }: any = {}) {
      let FilterExpression = "#t = :t";
      const ExpressionAttributeNames: Record<string, string> = { "#t": "type" };
      const ExpressionAttributeValues: Record<string, any> = { ":t": "Test" };
      if (where?.type) {
        FilterExpression += " and testType = :type";
        ExpressionAttributeValues[":type"] = where.type;
      }
      if (where?.userId) {
        FilterExpression += " and userId = :u";
        ExpressionAttributeValues[":u"] = where.userId;
      }
      const params = {
        TableName: TABLE_NAME,
        FilterExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
      };
      const res = await docClient.send(new ScanCommand(params));
      return res.Items || [];
    },
    async deleteMany({ where }: any) {
      const params = {
        TableName: TABLE_NAME,
        FilterExpression: "#t = :t and userId = :u",
        ExpressionAttributeNames: { "#t": "type" },
        ExpressionAttributeValues: { ":t": "Test", ":u": where.userId },
      };
      const res = await docClient.send(new ScanCommand(params));
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
export default client;

