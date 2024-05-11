export type RemoteImageSubjectType =
  | "biologia"
  | "chimica"
  | "fis-mat"
  | "logica";

export function isRemoteImageSubjectType(
  subject: string
): subject is RemoteImageSubjectType {
  return ["biologia", "chimica", "fis-mat", "logica"].includes(subject);
}

function dbSubjectToRemoteImageSubjectType(
  subject: string
): RemoteImageSubjectType {
  switch (subject.toLowerCase()) {
    case "biologia":
      return "biologia";
    case "bhimica":
      return "chimica";
    case "fisica e matematica":
      return "fis-mat";
    case "logica":
      return "logica";
    default:
      throw new Error(
        "Invalid subject in dbSubjectToRemoteImageSubjectType, got " + subject
      );
  }
}

export function insertImageInText(s: string, sub: string) {
  sub = dbSubjectToRemoteImageSubjectType(sub);
  if (!isRemoteImageSubjectType(sub)) {
    throw new Error("Invalid subject type in insertImageInText, got " + sub);
  }
  // When includegraphics{asd.png} is found, replace it with an img tag
  return s.replace(
    /includegraphics{(.+?)}/g,
    `<img src="https://domande-ap.mur.gov.it/assets/includeGraphics/${sub}/$1" class="mx-auto" style="display: inline;"/>`
  );
}
