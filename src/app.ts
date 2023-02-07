import express, { Application } from "express";
import { startDatabase } from "./database";
import { createMovie, deleteMovie, listAllMovies, listMovieById, updateMovie } from "./functions";
import { movieExists } from "./middlewares";

const app: Application = express();
app.use(express.json());

app.post('/movies',createMovie)

app.get('/movies',listAllMovies)

app.get('/movies/:id',movieExists,listMovieById)

app.patch('/movies/:id',movieExists, updateMovie)

app.delete('/movies/:id',movieExists, deleteMovie)

app.listen(3000, async() => {
  await startDatabase()
  console.log("server on");
});
