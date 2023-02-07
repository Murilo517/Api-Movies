import { Request, Response, NextFunction } from "express";
import { QueryConfig } from "pg";
import { client } from "./database";
import { movieResult } from "./interfaces";

const movieExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
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

  if (!queryResult.rowCount) {
    return res.status(404).json({
      message: "movies does not exists",
    });
  }

  return next();
};

export { movieExists };
