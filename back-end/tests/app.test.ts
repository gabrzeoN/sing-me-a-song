import app from "../src/app.js";
import supertest from "supertest";
import * as recommendationFactory from "./factories/recommendationFactory.js"
import * as scenarioFactory from "./factories/scenarioFactory.js"
const agent = supertest(app);
import { prisma } from "./../src/database.js";

beforeEach(async () => {
    await scenarioFactory.deleteAllData();
});

describe("/POST recommendations", ()=> {
    it("given valid inputs, 201",async () => {
        const recommendation = recommendationFactory.recommendationInput;
        const response = await agent.post("/recommendations").send(recommendation);
        expect(response.statusCode).toEqual(201);
        const recommendationCreated = await prisma.recommendation.findFirst({
            where: {name: recommendation.name}
        });
        expect(recommendationCreated).not.toEqual(null);
    });

    it("given two recommendations with same name, 409",async () => {
        const recommendation = recommendationFactory.recommendationInput;
        await agent.post("/recommendations").send(recommendation);
        const response = await agent.post("/recommendations").send(recommendation);
        expect(response.statusCode).toEqual(409);
        const recommendationCreated = await prisma.recommendation.findMany({
            where: {name: recommendation.name}
        });
        expect(recommendationCreated.length).toEqual(1);
    });

    // TODO: Recomendacao sem link do youtube
    // TODO: Recomendacao sem nome
    // TODO: recomend sem link e nome
    // TODO: errar inputs

});

describe("/GET recommendations", ()=> {
    
    // TODO: se nao tiver nenhuma muscia, 200, arr vazio
    // TODO: se estiver com 3 musicas, 200, arr [3]

});