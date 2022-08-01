import { Request, Response } from "express";
import * as testRepository from "../repositories/testRepository.js"

export async function resetDatabase(req: Request, res: Response) {
    await testRepository.resetDatabase();
    res.sendStatus(200);
}