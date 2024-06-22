test("Get a new explanation", async () => {
  const mockResult = `<b>La risposta corretta è [FAVA]</b>. In effetti, è sufficiente riorganizzare l'espressione \( y = f(x) \) per isolare \( x \) e scriverlo in funzione di \( y \):
\[ y = f(x) = 3x - 6 \rightarrow 3x = y + 6 \rightarrow x = \frac{y+6}{3} \]`;

  fetch("http://localhost:3000/api/getExplanation?id=596")
    .then((response) => {
      expect(response.status).toBe(200);
      return response.json();
    })
    .then((data) => {
      expect(data.length).not.toBe(0);
    });
});

test("Get a new explanation without id", async () => {
  fetch("http://localhost:3000/api/getExplanation").then((response) => {
    expect(response.status).toBe(400);
  });
});
