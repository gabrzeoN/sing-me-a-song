import express from "express";
import * as testController from "../controllers/testController.js"

const testRouter = express.Router();

testRouter.delete("/tests/reset-database", testController.resetDatabase);

export default testRouter;