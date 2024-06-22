test("Get a new explanation", async () => {
  const mockResult = `<b>La risposta corretta è [FAVA].</b><br/><br/><br/>Il perimetro di un rombo si calcola sommando la lunghezza dei suoi quattro lati. Poiché tutti i lati di un rombo sono uguali, il perimetro (\\(P\\)) è dato da:<br/><br/>\\[ P = 4 \\cdot \\text{lato} \\]<br/><br/>In questo caso, il lato del rombo misura 26 cm. Quindi, il perimetro è:<br/><br/>\\[ P = 4 \\cdot 26 \\, \\text{cm} = 104 \\, \\text{cm} \\]<br/><br/>`;

  const res = await fetch("http://localhost:3000/api/getExplanation?id=596");
  expect(res.status).toBe(200);
  const data = await res.json();
  expect(data.text).toBe(mockResult);
});

test("Get a new explanation without id", async () => {
  const res = await fetch("http://localhost:3000/api/getExplanation");
  expect(res.status).toBe(400);
});

test("Get a new explanation with an invalid id", async () => {
  const res = await fetch(
    "http://localhost:3000/api/getExplanation?id=invalid"
  );
  expect(res.status).toBe(400);
});
