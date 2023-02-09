import { Request, Response } from "express";
import { client } from "./database";
import { iMovie, iMovieComplete, movieResult, iPagination } from "./interfaces";
import { QueryConfig } from "pg";
import format from "pg-format";

const createMovie = async (req: Request, res: Response): Promise<Response> => {
  try {
    const movieDataRequest: iMovie = req.body;

    const query: string = format(
      `
      INSERT INTO
        movies(%I)
      VALUES
        (%L)
      RETURNING *;
      `,
      Object.keys(movieDataRequest),
      Object.values(movieDataRequest)
    );

    const queryResult: movieResult = await client.query(query);

    const newMovie: iMovieComplete = queryResult.rows[0];

    return res.status(201).json(newMovie);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(409).json({
        message: "movie name must be diferrent than one that already exists",
      });
    }
    return res.status(500).json({
      message: "internal server error",
    });
  }
};

const listAllMovies = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    let perPage: any = req.query.perPage ? Number(req.query.perPage) : 5;

    if (perPage > 5 || perPage <= 0 || isNaN(perPage)) {
      perPage = 5;
    }

    let page: any = req.query.page ? Number(req.query.page) : 1;

    if (page <= 0 || isNaN(page)) {
      page = 1;
    }

    let order: any = req.query.order;

    let sort: any = req.query.sort;

    if (!order) {
      order = "ASC";
    }
   

    let query: string = "";

    if (!sort) {
      query = format(
        `
        SELECT
          * 
        FROM
          movies
        LIMIT %L OFFSET %L
        ;`,
        perPage,
        perPage * (page - 1)
      )
    } else {
      query = format(
        `
    SELECT
      * 
    FROM
      movies
    ORDER BY
      %I %s
    LIMIT %L OFFSET %L
    ;`,
        sort,
        order,
        perPage,
        perPage * (page-1)
      );
    }

    const queryConfig: QueryConfig = {
      text: query,
    };

    const queryResult: movieResult = await client.query(queryConfig);

    let count: number = queryResult.rowCount;

    let totalPages : number = Math.ceil(count / 5)

    const baseURL: string = `localhost:3000/movies`;

    let previousPage: any = `${baseURL}?page=${page - 1}&perPage=${perPage}`;
    if (page - 1 <= 0) {
      previousPage = null;
    }

    let nextPage: any = `${baseURL}?page=${page + 1}&perPage=${perPage}`;
    if (page >= totalPages) {
      nextPage = null;
    }

    const pagination: iPagination = {
      previousPage,
      nextPage,
      count,
      data: queryResult.rows,
    };

    return res.status(200).json(pagination);
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const listMovieById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id: number = parseInt(req.params.id);

  const query: string = `
    SELECT
    * 
    FROM
    movies
    WHERE
    id = $1;
  `;

  const queryConfig: QueryConfig = {
    text: query,
    values: [id],
  };

  const queryResult: movieResult = await client.query(queryConfig);

  return res.status(200).json(queryResult.rows[0]);
};

const updateMovie = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id: number = parseInt(req.params.id);

    const movieData = Object.values(req.body);
    const movieDataKeys = Object.keys(req.body);

    const query: string = format(
      `
      UPDATE
        movies
      SET
        (%I) = ROW(%L)
      WHERE
        id = $1
      RETURNING *;  
    `,
      movieDataKeys,
      movieData
    );

    const queryConfig: QueryConfig = {
      text: query,
      values: [id],
    };

    const queryResult: movieResult = await client.query(queryConfig);

    return res.status(200).json(queryResult.rows[0]);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(409).json({
        message: "movie name must be diferrent than one that already exists",
      });
    }
    return res.status(500).json({
      message: "internal server error",
    });
  }
};

const deleteMovie = async (req: Request, res: Response): Promise<Response> => {
  const id: number = parseInt(req.params.id);

  const query: string = `
  DELETE FROM
    movies
  WHERE
    id = $1;
  `;

  const queryConfig: QueryConfig = {
    text: query,
    values: [id],
  };

  await client.query(queryConfig);

  return res.status(204).send();
};

export { createMovie, listAllMovies, listMovieById, updateMovie, deleteMovie };
