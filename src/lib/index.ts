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

export function dbSubjectToRemoteImageSubjectType(
  subject: string
): RemoteImageSubjectType {
  switch (subject.toLowerCase()) {
    case "biologia":
      return "biologia";
    case "chimica":
      return "chimica";
    case "fisica e matematica":
      return "fis-mat";
    case "logica":
    case "ragionamento logico e problemi":
      return "logica";
    case "competenze di lettura e conoscenze acquisite negli studi":
      return "logica"; // Non e' vero ma tanto non capita
    default:
      throw new Error(
        "Invalid subject in dbSubjectToRemoteImageSubjectType, got " + subject
      );
  }
}

export function formatTextForTest(text: string) {
  return text
    .replaceAll("<b>", "")
    .replaceAll("</b>", "")
    .replaceAll("<p>", "")
    .replaceAll("</p>", "")
    .replaceAll("<br>", "")
    .replaceAll("</br>", "");
}

export function insertImageInText(s: string, sub: string) {
  if (!s.includes("includegraphics")) return s;
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
