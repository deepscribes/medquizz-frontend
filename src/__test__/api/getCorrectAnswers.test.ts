test("For correct answers to be returned (.length > 0)", async () => {
  fetch("http://localhost:3000/api/getCorrectAnswers")
    .then((response) => {
      expect(response.status).toBe(200);
      return response.json();
    })
    .then((data) => {
      expect(data.length).not.toBe(0);
    });
});
