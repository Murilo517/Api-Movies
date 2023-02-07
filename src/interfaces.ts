import { QueryResult } from "pg"

interface iMovie{
name: string
description?: string
price: number
duration: number
}

interface iMovieComplete extends iMovie{
 id: number
}

interface iPagination{
    previousPage: string,
    nextPage: string,
    count: number,
    data: any
}

type movieResult = QueryResult<iMovieComplete>

export {iMovie, iMovieComplete, movieResult, iPagination}