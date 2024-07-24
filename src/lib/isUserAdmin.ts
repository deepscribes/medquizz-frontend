export function isUserAdmin(userId: string) {
  return [
    "user_2jfE5RSVUqHADG7gY48pP2g9lsb", 
    "user_2j7XifZZELVZwcj1qUncmWllMZy", // + 1 555 555 0100 (dev)
    "user_2j9GQMALwyAca8O0fTSon12iKrF", // + 1 555 555 0100 (prod)
  ].includes(userId);
}
