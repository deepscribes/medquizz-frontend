import requests
import json
import time

CLERK_SECRET_KEY = "sk_test_I9cJyDPow4ivUngNiaCaJwIhOD3tKP0jVGbC7Jzetm"

max_limit = 500
total_users = 2000

all_users = []

print("Fetching users...")
for i in range(0, total_users, max_limit):
    print(f"Fetching users from {i} to {i + max_limit} / {total_users}")
    url = f"https://api.clerk.dev/v1/users?limit={max_limit}&offset={i}"
    headers = {
        "Authorization": f"Bearer {CLERK_SECRET_KEY}",
        "Content-Type": "application/json",
    }
    response = requests.get(url, headers=headers)
    users = response.json()
    all_users.extend(users)

usersWithoutEmails = []

print("Updating emails...")
start = time.time()
for i, user in enumerate(all_users):
    print(f"Updating email for user {i}/{len(all_users)}...")
    print(
        f"Time elapsed: {time.time() - start}, ETA: {int((time.time() - start) / (i+1) * (len(all_users) - i))}s remaining"
    )
    email = user["email_addresses"]
    if not email:
        print(f"User {user['id']} has no email")
        usersWithoutEmails.append(user)
        continue
    if user["primary_email_address_id"]:
        print(f"User {user['id']} already has a primary email")
        continue
    emailId = email[0]["id"]
    url = f"https://api.clerk.dev/v1/email_addresses/{emailId}"

    headers = {
        "Authorization": f"Bearer {CLERK_SECRET_KEY}",
        "Content-Type": "application/json",
    }

    data = {
        "verified": True,
        "primary": True,
    }

    response = requests.patch(url, headers=headers, json=data)
    requests.patch(
        "https://api.clerk.dev/v1/users/" + user["id"],
        headers=headers,
        json={"primary_email_address_id": emailId},
    )

with open("usersWithoutEmails.json", "w") as f:
    json.dump(usersWithoutEmails, f)
