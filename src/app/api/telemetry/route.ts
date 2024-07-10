import { OAuth2Client } from "google-auth-library";

import { GoogleSpreadsheet } from "google-spreadsheet";
import { NextResponse } from "next/server";

// Initialize the OAuth2Client with your app's oauth credentials
const oauthClient = new OAuth2Client({
  clientId:
    "609677044717-ellpq0lvs5so5ig8e0o4hfs2mjgkp3cn.apps.googleusercontent.com",
  clientSecret: "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",
});

oauthClient.credentials.refresh_token =
  "1//09ye7RTyvOst7CgYIARAAGAkSNwF-L9Ir37PJkntHe66B_IshhpL87S6BA1shGc-HEw7dJxf3ppa-rRf5bpwAPYQ5ogYB740ML4Y";

async function getAllUsers(): Promise<any[]> {
  let users;
  let res = [];
  let i = 0;
  while (typeof users === "undefined" || users.length > 0) {
    users = await fetch(
      `https://api.clerk.com/v1/users?limit=500&offset=${
        500 * i
      }&order_by=created_at`,
      {
        headers: {
          Authorization: `Bearer sk_live_w5fn5Fe240dLiTgNdotn1vNALC1FiYfXyj48zLTSc3`,
        },
      }
    ).then((res) => {
      if (res.ok) return res.json();
      throw new Error("Failed to fetch users");
    });
    res.push(...users);
    i++;
  }

  return res;
}

export async function GET() {
  const doc = new GoogleSpreadsheet(
    "1PO1KabQDYQ-2Gupps92VnXKgCJkfsR5A3E_H1w_EkYE",
    oauthClient
  );

  await doc.loadInfo();

  const sheet = doc.sheetsByTitle["Foglio2"];

  const allUsers = await getAllUsers();

  const users = allUsers.filter(
    (u) => new Date(u.created_at) >= new Date("2024-07-01")
  );

  console.log("Found a total of ", users.length, " users after filtering");

  if (users.length == 0) {
    return NextResponse.json(
      { error: "No users found after filtering" },
      { status: 400 }
    );
  }

  await sheet.clear();

  await sheet.setHeaderRow([
    "Nome",
    "Cognome",
    "Email",
    "Numero Telefono",
    "Data",
    "Ora",
  ]);

  await sheet.addRows(
    users.map((u) => {
      const phone = u?.phone_numbers[0]?.phone_number ?? "N/A";
      const email = u?.email_addresses[0]?.email_address ?? "N/A";
      const data = new Date(u.created_at);
      const ora = new Date(u.created_at);
      return {
        Nome: u.first_name || "N/A",
        Cognome: u.last_name || "N/A",
        Email: email,
        "Numero Telefono": "+" + phone,
        Data:
          data.getFullYear() +
          "-" +
          (data.getMonth() + 1).toString().padStart(2, "0") +
          "-" +
          data.getDate().toString().padStart(2, "0"),
        Ora:
          ora.getHours().toString().padStart(2, "0") +
          ":" +
          ora.getMinutes().toString().padStart(2, "0"),
      };
    })
  );

  await sheet.deleteDuplicates();

  return NextResponse.json({ status: "Success" }, { status: 200 });
}
