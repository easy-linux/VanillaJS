import fastify from "fastify";
import cors from "cors";
import express from "@fastify/express";

const app = fastify();
app.register(express).then(() => {
  app.use(cors());
  const address = "0.0.0.0";
  const port = 4000;
  try {
    app.get("/todos", (req, res) => {
      const { _start, _limit } = req.query;
      fetch(`https://jsonplaceholder.typicode.com/todos?_start=${_start}&_limit=${_limit}`)
        .then((response) => response.json())
        .then((todos) => {
          setTimeout(() => {
            res.send(todos);
          }, 2000);
        })
        .catch((e) => console.log(e));
    });

    app.listen({ address, port }, function (err, address) {
      if (err) {
        console.log(err);
        process.exit(1);
      }
      console.log(`server listening on ${address}`);
    });
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
});
