export function insertImageInText(s: string) {
  // When includegraphics{asd.png} is found, replace it with an img tag
  return s.replace(
    /includegraphics{(.+?)}/g,
    '<img src="https://medquizz.s3.eu-south-1.amazonaws.com/images/$1" class="mx-auto" style="display: inline;"/>'
  );
}
