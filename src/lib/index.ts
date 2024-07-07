export type RemoteImageSubjectType =
  | "biologia"
  | "chimica"
  | "fis-mat"
  | "logica";

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
  return insertImageInText(text)
    .replaceAll("<b>", "")
    .replaceAll("</b>", "")
    .replaceAll("<p>", "")
    .replaceAll("</p>", "")
    .replaceAll("<br>", "")
    .replaceAll("</br>", "");
}

export function insertImageInText(s: string) {
  console.log("Got", s);
  return s.replace(
    /src="\/api\/v1\/image\/([^"]*)"/g,
    'src="https://domande-ap.mur.gov.it/api/v1/image/$1" class="mx-auto" style="display: inline;"'
  );
}
